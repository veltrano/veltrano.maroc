"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Loader2,
  MessageCircle,
  NotebookPen,
  Plus,
  Repeat2,
  ShoppingBag,
} from "lucide-react";
import { PRODUCTS, displayName, mad, productBySlug } from "@/data/catalog";
import {
  computedListMembership,
  SAVED_LIST_KEYS,
  type ClientProfile,
  type SavedListKey,
} from "@/lib/crm";
import {
  adminHeaders,
  contactStatusLabels,
  fetchCrm,
  listLabels,
  sourceLabels,
  type CrmData,
} from "@/lib/admin-crm";
import { linePrice } from "@/lib/order";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AttemptDialog } from "@/components/admin-crm";
import { cn } from "@/lib/utils";

type TimelineItem = {
  id: string;
  date: string;
  type: "order" | "attempt" | "exchange" | "note" | "reminder";
  value: unknown;
};

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CrmData | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [attemptOpen, setAttemptOpen] = useState(false);
  const [manualOrderOpen, setManualOrderOpen] = useState(false);

  async function load() {
    setError("");
    try {
      setData(await fetchCrm());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Chargement impossible.");
    }
  }
  useEffect(() => {
    load();
  }, []);

  const client = data?.clients.find((item) => item.id === params.id);
  const orders = useMemo(() => {
    if (!data || !client) return [];
    const ids = new Set(
      data.orderClientLinks
        .filter((link) => link.clientId === client.id)
        .map((link) => link.orderId)
    );
    return data.orders.filter((order) => ids.has(order.id));
  }, [client, data]);
  const exchanges = useMemo(
    () => data?.exchanges.filter((item) => item.clientId === client?.id) ?? [],
    [client?.id, data?.exchanges]
  );
  const attempts = useMemo(
    () =>
      data?.contactAttempts.filter((item) => item.clientId === client?.id) ?? [],
    [client?.id, data?.contactAttempts]
  );
  const timeline = useMemo<TimelineItem[]>(() => {
    if (!data || !client) return [];
    const items: TimelineItem[] = [
      ...orders.map((value) => ({
        id: value.id,
        date: value.createdAt,
        type: "order" as const,
        value,
      })),
      ...attempts.map((value) => ({
        id: value.id,
        date: value.createdAt,
        type: "attempt" as const,
        value,
      })),
      ...exchanges.map((value) => ({
        id: value.id,
        date: value.requestedAt,
        type: "exchange" as const,
        value,
      })),
      ...data.clientNotes
        .filter((value) => value.clientId === client.id)
        .map((value) => ({
          id: value.id,
          date: value.createdAt,
          type: "note" as const,
          value,
        })),
      ...orders
        .filter((order) => order.internalNotes)
        .map((order) => ({
          id: `order-note-${order.id}`,
          date: order.updatedAt ?? order.createdAt,
          type: "note" as const,
          value: {
            body: order.internalNotes,
            author: "Équipe",
            orderId: order.id,
          },
        })),
    ];
    if (client.nextCallbackAt) {
      items.push({
        id: "next-reminder",
        date: client.nextCallbackAt,
        type: "reminder",
        value: client.nextCallbackAt,
      });
    }
    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [attempts, client, data, exchanges, orders]);

  if (!data && !error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f7f8]">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (!data || !client) {
    return (
      <div className="min-h-[70vh] bg-[#f6f7f8] px-4 py-20 text-center">
        <h1 className="font-heading text-3xl">Client introuvable</h1>
        <Link href="/admin" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const delivered = orders.filter((order) => order.shipmentStatus === "delivered");
  const total = orders.reduce((sum, order) => sum + order.totalMad, 0);
  const assigned = data.staff.find((member) => member.id === client.assignedStaffId);

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Clients CRM
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl">{client.name}</h1>
                <Badge variant="secondary">{contactStatusLabels[client.contactStatus]}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {client.phone || "Sans téléphone"} · {client.email || "Sans e-mail"} · {client.city || "Ville non renseignée"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                Modifier le profil
              </Button>
              <Button variant="outline" onClick={() => setAttemptOpen(true)}>
                <MessageCircle className="size-4" />
                Noter un contact
              </Button>
              <Button onClick={() => setManualOrderOpen(true)}>
                <Plus className="size-4" />
                Créer une commande
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Commandes" value={orders.length} />
          <Stat label="Valeur totale" value={mad(total)} />
          <Stat label="Livrées" value={delivered.length} />
          <Stat label="Commercial" value={assigned?.name ?? "Non assigné"} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-5">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ProfileLine label="Téléphone" value={client.phone} />
                <ProfileLine label="E-mail" value={client.email} />
                <ProfileLine label="Ville" value={client.city} />
                <ProfileLine label="Adresse" value={client.deliveryAddress} />
                <ProfileLine label="Langue" value={client.preferredLanguage === "ar" ? "Arabe" : "Français"} />
                <ProfileLine label="Source" value={sourceLabels[client.source]} />
                <ProfileLine label="OK e-mail marketing" value={client.marketingEmail ? "Oui" : "Non"} />
                <ProfileLine label="OK WhatsApp marketing" value={client.marketingWhatsApp ? "Oui" : "Non"} />
                {client.notes ? <p className="rounded-lg bg-muted/50 p-3">{client.notes}</p> : null}
              </CardContent>
            </Card>
            <SavedLists client={client} data={data} orders={orders} exchanges={exchanges} onUpdated={load} />
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Historique du client</CardTitle>
              <CardDescription>Commandes, échanges, contacts, rappels et notes.</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length ? (
                <div className="relative space-y-4 before:absolute before:bottom-4 before:start-[17px] before:top-4 before:w-px before:bg-border">
                  {timeline.map((item) => (
                    <TimelineCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-muted-foreground">Aucun événement.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <EditClientDialog client={editing ? client : null} setOpen={setEditing} data={data} onSaved={load} />
      <AttemptDialog
        client={attemptOpen ? client : null}
        setClient={() => setAttemptOpen(false)}
        staff={data.staff}
        onSaved={load}
      />
      <ManualOrderDialog client={manualOrderOpen ? client : null} setOpen={setManualOrderOpen} onSaved={load} />
    </div>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const icon = {
    order: ShoppingBag,
    attempt: MessageCircle,
    exchange: Repeat2,
    note: NotebookPen,
    reminder: CalendarClock,
  }[item.type];
  const Icon = icon;
  const labels = {
    order: "Commande",
    attempt: "Tentative de contact",
    exchange: "Échange",
    note: "Note",
    reminder: "Prochain rappel",
  };
  return (
    <div className="relative flex gap-4">
      <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-white">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 rounded-xl border bg-white p-4">
        <div className="flex flex-wrap justify-between gap-2">
          <Badge variant="outline">{labels[item.type]}</Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(item.date).toLocaleString("fr-MA")}
          </span>
        </div>
        {item.type === "order" ? <TimelineOrder order={item.value as CrmData["orders"][number]} /> : null}
        {item.type === "attempt" ? (
          <div className="mt-3 text-sm">
            <p className="font-medium">{contactStatusLabels[(item.value as CrmData["contactAttempts"][number]).outcome]}</p>
            <p className="mt-1 text-muted-foreground">{(item.value as CrmData["contactAttempts"][number]).notes || "Aucune note"}</p>
          </div>
        ) : null}
        {item.type === "exchange" ? (
          <div className="mt-3 text-sm">
            <p className="font-medium">{(item.value as CrmData["exchanges"][number]).status === "requested" ? "Demandé" : "Terminé"}</p>
            <p className="mt-1 text-muted-foreground">{(item.value as CrmData["exchanges"][number]).description}</p>
          </div>
        ) : null}
        {item.type === "note" ? (
          <div className="mt-3 text-sm">
            <p>{(item.value as { body: string }).body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(item.value as { author?: string; orderId?: string }).author}
              {(item.value as { orderId?: string }).orderId ? ` · ${(item.value as { orderId?: string }).orderId}` : ""}
            </p>
          </div>
        ) : null}
        {item.type === "reminder" ? (
          <p className="mt-3 text-sm font-medium">
            Prévu le {new Date(item.value as string).toLocaleString("fr-MA")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TimelineOrder({ order }: { order: CrmData["orders"][number] }) {
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading text-lg">{order.id}</p>
          <p className="text-xs text-muted-foreground">
            {order.confirmationStatus ?? "new"} · {order.shipmentStatus ?? "unfulfilled"} · {order.paymentStatus ?? "pending"}
          </p>
        </div>
        <p className="font-medium">{mad(order.totalMad)}</p>
      </div>
      <div className="mt-3 divide-y rounded-lg border">
        {order.lines.map((line) => {
          const product = productBySlug(line.slug);
          return (
            <div key={line.id} className="flex justify-between gap-3 p-2.5 text-xs">
              <span>
                {product ? displayName(product) : line.slug} · taille {line.size}
                {line.sizeB ? `/${line.sizeB}` : ""} × {line.quantity}
              </span>
              <span>{mad(linePrice(line))}</span>
            </div>
          );
        })}
      </div>
      {order.appliedCoupon ? <p className="mt-2 text-xs text-muted-foreground">Coupon utilisé : {order.appliedCoupon}</p> : null}
    </div>
  );
}

function SavedLists({
  client,
  data,
  orders,
  exchanges,
  onUpdated,
}: {
  client: ClientProfile;
  data: CrmData;
  orders: CrmData["orders"];
  exchanges: CrmData["exchanges"];
  onUpdated: () => void;
}) {
  async function toggle(listKey: SavedListKey) {
    await fetch("/api/admin/crm", {
      method: "POST",
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_pin", clientId: client.id, listKey }),
    });
    onUpdated();
  }
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Listes clients</CardTitle>
        <CardDescription>Calculées en direct ou épinglées manuellement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {SAVED_LIST_KEYS.map((key) => {
          const computed = computedListMembership(key, orders, exchanges);
          const pinned = data.savedListPins.some((pin) => pin.clientId === client.id && pin.listKey === key);
          return (
            <button key={key} onClick={() => toggle(key)} className="flex w-full items-center justify-between rounded-lg border p-2.5 text-sm">
              <span>{listLabels[key]}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {computed ? "Automatique" : pinned ? "Épinglé" : "Non"}
                {(computed || pinned) ? <Check className="size-4 text-emerald-600" /> : <Plus className="size-4" />}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function EditClientDialog({ client, setOpen, data, onSaved }: { client: ClientProfile | null; setOpen: (open: boolean) => void; data: CrmData; onSaved: () => void }) {
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    const form = new FormData(event.currentTarget);
    await fetch("/api/admin/crm", {
      method: "PATCH",
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        name: form.get("name"), phone: form.get("phone"), email: form.get("email"),
        city: form.get("city"), deliveryAddress: form.get("deliveryAddress"),
        preferredLanguage: form.get("preferredLanguage"), source: form.get("source"),
        notes: form.get("notes"), assignedStaffId: form.get("assignedStaffId"),
        marketingEmail: form.get("marketingEmail") === "on",
        marketingWhatsApp: form.get("marketingWhatsApp") === "on",
      }),
    });
    setOpen(false);
    onSaved();
  }
  return (
    <Dialog open={Boolean(client)} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-xl">
        <DialogHeader><DialogTitle>Modifier le profil</DialogTitle><DialogDescription>E-mail facultatif, téléphone ou e-mail doit rester renseigné.</DialogDescription></DialogHeader>
        {client ? <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom" name="name" defaultValue={client.name} required />
          <Field label="Téléphone" name="phone" defaultValue={client.phone} />
          <Field label="E-mail" name="email" type="email" defaultValue={client.email} />
          <Field label="Ville" name="city" defaultValue={client.city} />
          <Field label="Adresse" name="deliveryAddress" defaultValue={client.deliveryAddress} className="sm:col-span-2" />
          <label className="space-y-1 text-sm"><span>Langue</span><select name="preferredLanguage" defaultValue={client.preferredLanguage} className="h-9 w-full rounded-lg border bg-white px-3"><option value="fr">Français</option><option value="ar">Arabe</option></select></label>
          <label className="space-y-1 text-sm"><span>Source</span><select name="source" defaultValue={client.source} className="h-9 w-full rounded-lg border bg-white px-3">{Object.entries(sourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="space-y-1 text-sm"><span>Commercial</span><select name="assignedStaffId" defaultValue={client.assignedStaffId} className="h-9 w-full rounded-lg border bg-white px-3"><option value="">Non assigné</option>{data.staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
          <label className="space-y-1 text-sm sm:col-span-2"><span>Notes</span><Textarea name="notes" defaultValue={client.notes} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="marketingEmail" defaultChecked={client.marketingEmail} />OK e-mail (marketing)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="marketingWhatsApp" defaultChecked={client.marketingWhatsApp} />OK WhatsApp (marketing)</label>
          <Button type="submit" className="sm:col-span-2">Enregistrer</Button>
        </form> : null}
      </DialogContent>
    </Dialog>
  );
}

function ManualOrderDialog({ client, setOpen, onSaved }: { client: ClientProfile | null; setOpen: (open: boolean) => void; onSaved: () => void }) {
  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const [pack, setPack] = useState<"single" | "duo">("single");
  const product = productBySlug(slug)!;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/admin/crm", {
      method: "POST",
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_manual_order", clientId: client.id, slug, pack,
        size: form.get("size"), sizeB: form.get("sizeB"), quantity: Number(form.get("quantity") || 1),
      }),
    });
    if (res.ok) { setOpen(false); onSaved(); }
  }
  return (
    <Dialog open={Boolean(client)} onOpenChange={setOpen}>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader><DialogTitle>Créer une commande pour {client?.name}</DialogTitle><DialogDescription>Action séparée du profil, avec les prix Veltrano actuels.</DialogDescription></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="space-y-1 text-sm"><span>Produit</span><select value={slug} onChange={(e) => setSlug(e.target.value)} className="h-9 w-full rounded-lg border bg-white px-3">{PRODUCTS.map((item) => <option key={item.slug} value={item.slug}>{displayName(item)}</option>)}</select></label>
          <label className="space-y-1 text-sm"><span>Pack</span><select value={pack} onChange={(e) => setPack(e.target.value as "single" | "duo")} className="h-9 w-full rounded-lg border bg-white px-3"><option value="single">1 jean · 250 MAD</option><option value="duo">Pack de 2 · 400 MAD</option></select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm"><span>Taille 1</span><select name="size" className="h-9 w-full rounded-lg border bg-white px-3">{product.sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
            {pack === "duo" ? <label className="space-y-1 text-sm"><span>Taille 2</span><select name="sizeB" className="h-9 w-full rounded-lg border bg-white px-3">{product.sizes.map((size) => <option key={size}>{size}</option>)}</select></label> : null}
          </div>
          <Field label="Quantité de packs" name="quantity" type="number" min="1" defaultValue="1" />
          <Button type="submit" className="w-full">Créer la commande</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card className="bg-white"><CardContent><p className="text-xs text-muted-foreground">{label}</p><p className="font-heading mt-2 text-2xl">{value}</p></CardContent></Card>;
}
function ProfileLine({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-0.5">{value || "—"}</p></div>;
}
function Field({ label, className, ...props }: { label: string; className?: string } & React.ComponentProps<typeof Input>) {
  return <label className={cn("space-y-1 text-sm", className)}><span>{label}</span><Input {...props} /></label>;
}
