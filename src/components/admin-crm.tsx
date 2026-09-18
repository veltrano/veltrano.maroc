"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronDown,
  Filter,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { mad, productBySlug } from "@/data/catalog";
import {
  computedListMembership,
  customerMatchesOrderOutcome,
  dedupeClients,
  followUpIsOpen,
  latestOrder,
  SAVED_LIST_KEYS,
  type ClientProfile,
  type ClientSource,
  type ContactOutcome,
  type SavedListKey,
} from "@/lib/crm";
import type { Order } from "@/lib/order";
import {
  adminHeaders,
  contactStatusLabels,
  fetchCrm,
  listLabels,
  sourceLabels,
  type CrmData,
} from "@/lib/admin-crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ClientFilter =
  | "all"
  | "delivered"
  | "cancelled"
  | "no_answer"
  | "callback_today"
  | "no_orders"
  | "has_email"
  | "email_consent";

const filters: { value: ClientFilter; label: string }[] = [
  { value: "all", label: "Tous les contacts" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
  { value: "no_answer", label: "Pas de réponse" },
  { value: "callback_today", label: "Rappel aujourd’hui" },
  { value: "no_orders", label: "Aucune commande" },
  { value: "has_email", label: "A une adresse e-mail" },
  { value: "email_consent", label: "Accord marketing e-mail" },
];

function clientOrders(data: CrmData, clientId: string) {
  const ids = new Set(
    data.orderClientLinks
      .filter((link) => link.clientId === clientId)
      .map((link) => link.orderId)
  );
  return data.orders.filter((order) => ids.has(order.id));
}

function orderOutcome(order?: Order) {
  if (!order) return "Aucune commande";
  if (
    order.shipmentStatus === "cancelled" ||
    order.confirmationStatus === "cancelled"
  ) {
    return "Annulée";
  }
  if (order.shipmentStatus === "delivered") return "Livrée";
  if (order.confirmationStatus === "confirmed") return "En attente";
  return "Nouvelle";
}

function isToday(value?: string) {
  if (!value) return false;
  const format = (date: Date) =>
    new Intl.DateTimeFormat("fr-CA", {
      timeZone: "Africa/Casablanca",
      dateStyle: "short",
    }).format(date);
  return format(new Date(value)) === format(new Date());
}

function lastAttempt(data: CrmData, clientId: string) {
  return data.contactAttempts
    .filter((attempt) => attempt.clientId === clientId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
}

export function ClientsCrm() {
  const [data, setData] = useState<CrmData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ClientFilter>("all");
  const [scope, setScope] = useState<"latest" | "any">("latest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [savedList, setSavedList] = useState<SavedListKey | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await fetchCrm());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    return dedupeClients(data.clients).filter((client) => {
      const orders = clientOrders(data, client.id);
      const attempts = data.contactAttempts.filter(
        (attempt) => attempt.clientId === client.id
      );
      const latestAttempt = lastAttempt(data, client.id);
      const exchanges = data.exchanges.filter(
        (exchange) => exchange.clientId === client.id
      );
      const searchable = [
        client.name,
        client.phone,
        client.email,
        client.city,
        client.notes,
        ...orders.map((order) => order.internalNotes),
        ...attempts.map((attempt) => attempt.notes),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (normalized && !searchable.includes(normalized)) return false;

      if (
        savedList !== "all" &&
        !computedListMembership(savedList, orders, exchanges) &&
        !data.savedListPins.some(
          (pin) => pin.clientId === client.id && pin.listKey === savedList
        )
      ) {
        return false;
      }
      if (filter === "delivered") {
        return customerMatchesOrderOutcome(orders, "delivered", scope, from, to);
      }
      if (filter === "cancelled") {
        return customerMatchesOrderOutcome(orders, "cancelled", scope, from, to);
      }
      if (filter === "no_answer") {
        return (
          followUpIsOpen(client, attempts) &&
          latestAttempt?.outcome === "pas_de_reponse"
        );
      }
      if (filter === "callback_today") return isToday(client.nextCallbackAt);
      if (filter === "no_orders") return orders.length === 0;
      if (filter === "has_email") return Boolean(client.email);
      if (filter === "email_consent") return client.marketingEmail;
      return true;
    });
  }, [data, filter, from, query, savedList, scope, to]);

  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardContent>
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nom, e-mail, téléphone, ville ou notes…"
                className="ps-9"
              />
            </div>
            <Select
              value={filter}
              onChange={(value) => setFilter(value as ClientFilter)}
              options={filters}
              icon={Filter}
            />
            <Select
              value={savedList}
              onChange={(value) => setSavedList(value as SavedListKey | "all")}
              options={[
                { value: "all", label: "Toutes les listes" },
                ...SAVED_LIST_KEYS.map((key) => ({
                  value: key,
                  label: listLabels[key],
                })),
              ]}
            />
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Ajouter un client
            </Button>
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>
          {filter === "delivered" || filter === "cancelled" ? (
            <div className="mt-3 flex flex-wrap items-end gap-3 border-t pt-3">
              <Select
                value={scope}
                onChange={(value) => setScope(value as "latest" | "any")}
                options={[
                  { value: "latest", label: "Dernière commande" },
                  { value: "any", label: "Toute commande dans l’historique" },
                ]}
              />
              <label className="text-xs text-muted-foreground">
                Du
                <Input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Au
                <Input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="mt-1"
                />
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Clients identifiés</CardTitle>
          <CardDescription>
            {loading ? "Chargement…" : `${rows.length} profil(s), sans doublon`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-sm">
            <thead>
              <tr className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
                <Th>Client</Th>
                <Th>Ville</Th>
                <Th>Commandes</Th>
                <Th>Valeur totale</Th>
                <Th>Dernière commande</Th>
                <Th>E-mail</Th>
                <Th>Dernière commande (statut)</Th>
                <Th>Statut du contact</Th>
                <Th>Dernier contact</Th>
                <Th>Prochain suivi</Th>
                <Th>Source</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {rows.map((client) => (
                <CustomerRow
                  key={client.id}
                  client={client}
                  data={data!}
                  onUpdated={load}
                />
              ))}
            </tbody>
          </table>
          {!loading && rows.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Aucun contact ne correspond à ces critères.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <AddClientDialog
        open={addOpen}
        setOpen={setAddOpen}
        staff={data?.staff ?? []}
        onCreated={load}
      />
    </div>
  );
}

function CustomerRow({
  client,
  data,
  onUpdated,
}: {
  client: ClientProfile;
  data: CrmData;
  onUpdated: () => void;
}) {
  const orders = clientOrders(data, client.id);
  const latest = latestOrder(orders);
  const attempt = lastAttempt(data, client.id);
  const [email, setEmail] = useState(client.email ?? "");
  const [saving, setSaving] = useState(false);

  async function saveEmail() {
    if (email.trim().toLowerCase() === (client.email ?? "").toLowerCase()) return;
    setSaving(true);
    await fetch("/api/admin/crm", {
      method: "PATCH",
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, email }),
    });
    setSaving(false);
    onUpdated();
  }

  return (
    <tr className="group hover:bg-[#fafbfb]">
      <td className="py-4 pe-4">
        <Link href={`/admin/clients/${client.id}`} className="font-medium hover:underline">
          {client.name}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {client.phone || "Sans téléphone"}
        </p>
      </td>
      <td className="py-4 pe-4">{client.city || "—"}</td>
      <td className="py-4 pe-4">{orders.length}</td>
      <td className="py-4 pe-4 font-medium">
        {mad(orders.reduce((sum, order) => sum + order.totalMad, 0))}
      </td>
      <td className="py-4 pe-4 text-muted-foreground">
        {latest ? new Date(latest.createdAt).toLocaleDateString("fr-MA") : "—"}
      </td>
      <td className="py-4 pe-4">
        <div className="relative w-52">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={saveEmail}
            placeholder="Facultatif"
            className="h-8 text-xs"
          />
          {saving ? (
            <Loader2 className="absolute end-2 top-2 size-3.5 animate-spin" />
          ) : null}
        </div>
      </td>
      <td className="py-4 pe-4">
        <Badge variant="outline">{orderOutcome(latest)}</Badge>
      </td>
      <td className="py-4 pe-4">
        <Badge variant="secondary">{contactStatusLabels[client.contactStatus]}</Badge>
      </td>
      <td className="py-4 pe-4 text-muted-foreground">
        {attempt ? new Date(attempt.createdAt).toLocaleDateString("fr-MA") : "—"}
      </td>
      <td className="py-4 pe-4 text-muted-foreground">
        {client.nextCallbackAt
          ? new Date(client.nextCallbackAt).toLocaleString("fr-MA", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—"}
      </td>
      <td className="py-4 pe-4">{sourceLabels[client.source]}</td>
    </tr>
  );
}

function AddClientDialog({
  open,
  setOpen,
  staff,
  onCreated,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  staff: CrmData["staff"];
  onCreated: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [duplicates, setDuplicates] = useState<ClientProfile[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [lastPayload, setLastPayload] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!open || (!phone.trim() && !email.trim())) {
      setDuplicates([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        duplicates: "1",
        phone,
        email,
      });
      const res = await fetch(`/api/admin/crm?${params}`, {
        headers: adminHeaders(),
      });
      if (res.ok) {
        const json = (await res.json()) as { duplicates: ClientProfile[] };
        setDuplicates(json.duplicates);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [email, open, phone]);

  async function save(event: FormEvent<HTMLFormElement>, force = false) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      action: "create_client",
      force,
      name: form.get("name"),
      phone,
      email,
      city: form.get("city"),
      deliveryAddress: form.get("deliveryAddress"),
      preferredLanguage: form.get("preferredLanguage"),
      source: form.get("source"),
      notes: form.get("notes"),
      assignedStaffId: form.get("assignedStaffId"),
      nextCallbackAt: form.get("nextCallbackAt"),
      marketingEmail: form.get("marketingEmail") === "on",
      marketingWhatsApp: form.get("marketingWhatsApp") === "on",
    };
    setLastPayload(payload);
    await submit(payload);
  }

  async function submit(payload: Record<string, unknown>, force = false) {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { ...adminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, force }),
      });
      const json = (await res.json()) as {
        client?: ClientProfile;
        duplicates?: ClientProfile[];
        error?: string;
      };
      if (res.status === 409 && json.duplicates) {
        setDuplicates(json.duplicates);
        setError("Un profil utilise déjà ce téléphone ou cet e-mail.");
        return;
      }
      if (!res.ok || !json.client) {
        throw new Error(json.error || "Création impossible.");
      }
      setOpen(false);
      setPhone("");
      setEmail("");
      setDuplicates([]);
      onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Création impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Ajouter un client</DialogTitle>
          <DialogDescription>
            Le profil est créé sans commande. Téléphone ou e-mail obligatoire.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom *" name="name" required />
          <Field label="Ville" name="city" />
          <Field
            label="Téléphone"
            name="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Field
            label="E-mail"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {duplicates.length ? (
            <div className="sm:col-span-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 text-orange-700" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    Profil similaire détecté
                  </p>
                  <div className="mt-2 space-y-1">
                    {duplicates.map((client) => (
                      <Link
                        key={client.id}
                        href={`/admin/clients/${client.id}`}
                        className="block text-sm text-orange-800 underline"
                      >
                        Ouvrir {client.name} · {client.phone || client.email}
                      </Link>
                    ))}
                  </div>
                  {lastPayload ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 border-orange-300"
                      onClick={() => submit(lastPayload, true)}
                    >
                      Ajouter quand même
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          <Field label="Adresse de livraison" name="deliveryAddress" className="sm:col-span-2" />
          <label className="space-y-2 text-sm">
            <span>Langue préférée</span>
            <select name="preferredLanguage" className="h-9 w-full rounded-lg border bg-white px-3">
              <option value="fr">Français</option>
              <option value="ar">Arabe</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span>Source</span>
            <select name="source" className="h-9 w-full rounded-lg border bg-white px-3">
              {Object.entries(sourceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span>Commercial assigné</span>
            <select name="assignedStaffId" className="h-9 w-full rounded-lg border bg-white px-3">
              <option value="">Non assigné</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Date de rappel" name="nextCallbackAt" type="datetime-local" />
          <label className="space-y-2 text-sm sm:col-span-2">
            <span>Notes</span>
            <Textarea name="notes" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="marketingEmail" className="size-4" />
            OK e-mail (marketing)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="marketingWhatsApp" className="size-4" />
            OK WhatsApp (marketing)
          </label>
          {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Enregistrer le profil
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FollowUpQueue() {
  const [data, setData] = useState<CrmData | null>(null);
  const [selected, setSelected] = useState<ClientProfile | null>(null);

  async function load() {
    setData(await fetchCrm());
  }
  useEffect(() => {
    load();
  }, []);

  const queue = useMemo(() => {
    if (!data) return [];
    return data.clients
      .filter((client) =>
        followUpIsOpen(
          client,
          data.contactAttempts.filter((attempt) => attempt.clientId === client.id)
        )
      )
      .sort((a, b) => {
        if (!a.nextCallbackAt) return 1;
        if (!b.nextCallbackAt) return -1;
        return new Date(a.nextCallbackAt).getTime() - new Date(b.nextCallbackAt).getTime();
      });
  }, [data]);

  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>File de suivi</CardTitle>
          <CardDescription>
            Rappels ouverts, triés par prochaine date. Aucun statut de commande n’est modifié automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length ? (
            <div className="space-y-2">
              {queue.map((client) => (
                <div key={client.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                    <CalendarClock className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/clients/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {client.phone || client.email} · {contactStatusLabels[client.contactStatus]}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {client.nextCallbackAt
                      ? new Date(client.nextCallbackAt).toLocaleString("fr-MA")
                      : "Date à planifier"}
                  </p>
                  <Button size="sm" onClick={() => setSelected(client)}>
                    Noter une tentative
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-muted-foreground">Aucun suivi ouvert.</p>
          )}
        </CardContent>
      </Card>
      <AttemptDialog
        client={selected}
        setClient={setSelected}
        staff={data?.staff ?? []}
        onSaved={load}
      />
    </div>
  );
}

export function AttemptDialog({
  client,
  setClient,
  staff,
  onSaved,
}: {
  client: ClientProfile | null;
  setClient: (client: ClientProfile | null) => void;
  staff: CrmData["staff"];
  onSaved: () => void;
}) {
  const [outcome, setOutcome] = useState<ContactOutcome>("pas_de_reponse");
  const [pending, setPending] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setPending(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/admin/crm", {
      method: "POST",
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "contact_attempt",
        clientId: client.id,
        outcome,
        notes: form.get("notes"),
        nextCallbackAt: form.get("nextCallbackAt"),
        assignedStaffId: form.get("assignedStaffId"),
      }),
    });
    setPending(false);
    if (res.ok) {
      setClient(null);
      onSaved();
    }
  }

  return (
    <Dialog open={Boolean(client)} onOpenChange={(open) => !open && setClient(null)}>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Noter une tentative</DialogTitle>
          <DialogDescription>
            {client?.name}. « Pas de réponse » garde le suivi ouvert sans toucher aux commandes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="space-y-2 text-sm">
            <span>Résultat</span>
            <select
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as ContactOutcome)}
              className="h-9 w-full rounded-lg border bg-white px-3"
            >
              <option value="contacte">contacté</option>
              <option value="pas_de_reponse">pas de réponse</option>
              <option value="rappel_planifie">rappel planifié</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span>Notes</span>
            <Textarea name="notes" />
          </label>
          {outcome !== "contacte" ? (
            <Field label="Prochain rappel" name="nextCallbackAt" type="datetime-local" />
          ) : null}
          <label className="space-y-2 text-sm">
            <span>Commercial</span>
            <select name="assignedStaffId" className="h-9 w-full rounded-lg border bg-white px-3">
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Enregistrer la tentative
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EmailSignupsAdmin() {
  const [data, setData] = useState<CrmData | null>(null);
  const [query, setQuery] = useState("");
  const [usage, setUsage] = useState("all");
  const [status, setStatus] = useState("all");
  const [language, setLanguage] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [retrying, setRetrying] = useState("");

  async function load() {
    setData(await fetchCrm());
  }
  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const search = query.trim().toLowerCase();
    return data.emailSignups.filter((signup) => {
      if (
        search &&
        !`${signup.email} ${signup.couponCode}`.toLowerCase().includes(search)
      ) return false;
      if (usage === "used" && signup.couponStatus !== "used") return false;
      if (usage === "unused" && signup.couponStatus === "used") return false;
      if (status !== "all" && signup.emailStatus !== status) return false;
      if (language !== "all" && signup.language !== language) return false;
      const time = new Date(signup.createdAt).getTime();
      if (from && time < new Date(`${from}T00:00:00`).getTime()) return false;
      if (to && time > new Date(`${to}T23:59:59.999`).getTime()) return false;
      return true;
    });
  }, [data, from, language, query, status, to, usage]);

  async function retry(signupId: string) {
    setRetrying(signupId);
    await fetch("/api/admin/crm", {
      method: "POST",
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retry_signup_email", signupId }),
    });
    await load();
    setRetrying("");
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="E-mail ou code…" className="ps-9" />
            </div>
            <Select value={usage} onChange={setUsage} options={[
              { value: "all", label: "Tous les coupons" },
              { value: "used", label: "Utilisés" },
              { value: "unused", label: "Non utilisés" },
            ]} />
            <Select value={status} onChange={setStatus} options={[
              { value: "all", label: "Tous les e-mails" },
              { value: "queued", label: "En file" },
              { value: "sent", label: "Envoyé" },
              { value: "failed", label: "Échec" },
            ]} />
            <Select value={language} onChange={setLanguage} options={[
              { value: "all", label: "Toutes les langues" },
              { value: "fr", label: "Français" },
              { value: "ar", label: "Arabe" },
            ]} />
            <Button variant="outline" onClick={load}><RefreshCw className="size-4" />Actualiser</Button>
          </div>
          <div className="mt-3 flex gap-3">
            <Field label="Du" name="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Field label="Au" name="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Inscriptions e-mail & coupons 10 %</CardTitle>
          <CardDescription>{rows.length} inscription(s)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead><tr className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
              <Th>E-mail</Th><Th>Date + langue</Th><Th>Code</Th><Th>Statut coupon</Th>
              <Th>Statut e-mail</Th><Th>Achat lié</Th><Th>Consentement marketing</Th><Th>Action</Th>
            </tr></thead>
            <tbody className="divide-y">
              {rows.map((signup) => (
                <tr key={signup.id}>
                  <td className="py-4 pe-4">
                    <Link href={`/admin/clients/${signup.clientId}`} className="font-medium hover:underline">{signup.email}</Link>
                  </td>
                  <td className="py-4 pe-4 text-muted-foreground">
                    {new Date(signup.createdAt).toLocaleDateString("fr-MA")} · {signup.language.toUpperCase()}
                  </td>
                  <td className="py-4 pe-4 font-mono text-xs">{signup.couponCode}</td>
                  <td className="py-4 pe-4"><Badge variant="outline">
                    {signup.couponStatus === "active" ? "Actif" : signup.couponStatus === "used" ? "Utilisé" : "Expiré"}
                  </Badge></td>
                  <td className="py-4 pe-4"><Badge variant={signup.emailStatus === "failed" ? "destructive" : "secondary"}>
                    {signup.emailStatus === "queued" ? "En file" : signup.emailStatus === "sent" ? "Envoyé" : "Échec"}
                  </Badge></td>
                  <td className="py-4 pe-4">{signup.linkedOrderId || "—"}</td>
                  <td className="py-4 pe-4">{signup.marketingConsent ? "Oui" : "Non"}</td>
                  <td className="py-4">
                    {signup.emailStatus === "failed" ? (
                      <Button size="sm" variant="outline" disabled={retrying === signup.id} onClick={() => retry(signup.id)}>
                        {retrying === signup.id ? <Loader2 className="size-3 animate-spin" /> : <Mail className="size-3" />}
                        Réessayer
                      </Button>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="py-12 text-center text-muted-foreground">Aucune inscription.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: typeof Filter;
}) {
  return (
    <div className="relative">
      {Icon ? <Icon className="absolute start-3 top-2.5 size-4 text-muted-foreground" /> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("h-9 w-full appearance-none rounded-lg border bg-white pe-8 ps-3 text-sm", Icon && "ps-9")}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2.5 top-2.5 size-4 text-muted-foreground" />
    </div>
  );
}

function Field({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.ComponentProps<typeof Input>) {
  return (
    <label className={cn("space-y-2 text-sm", className)}>
      <span>{label}</span>
      <Input {...props} />
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="pb-3 pe-4 text-start font-medium">{children}</th>;
}
