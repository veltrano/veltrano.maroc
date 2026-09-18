"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Copy,
  Gift,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  Store,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { displayName, mad, productBySlug } from "@/data/catalog";
import type {
  ConfirmationStatus,
  Coupon,
  Order,
  PaymentStatus,
  ShipmentStatus,
  WhatsAppQueueItem,
} from "@/lib/order";
import { linePrice, lineUnitCount } from "@/lib/order";
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
import { cn } from "@/lib/utils";

type AdminProduct = {
  slug: string;
  name: string;
  fit: "baggy" | "straight";
  colour: string;
  sizes: string[];
  stock: number;
  unitPriceMad: number;
  duoPriceMad: number;
};

type DashboardData = {
  orders: Order[];
  coupons: Coupon[];
  queue: WhatsAppQueueItem[];
  products: AdminProduct[];
  integrations: {
    whatsapp: boolean;
    gmail: boolean;
    googleSheets: boolean;
    analytics: boolean;
  };
  generatedAt: string;
};

type Section =
  | "overview"
  | "orders"
  | "customers"
  | "products"
  | "coupons"
  | "automations";

const confirmationOptions: {
  value: ConfirmationStatus;
  label: string;
}[] = [
  { value: "new", label: "Nouvelle" },
  { value: "awaiting_confirmation", label: "À confirmer" },
  { value: "confirmed", label: "Confirmée" },
  { value: "cancelled", label: "Annulée" },
];

const shipmentOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "unfulfilled", label: "Non préparée" },
  { value: "prepared", label: "Préparée" },
  { value: "dispatched", label: "Expédiée" },
  { value: "out_for_delivery", label: "En livraison" },
  { value: "delivered", label: "Livrée" },
  { value: "failed_attempt", label: "Échec livraison" },
  { value: "returned", label: "Retournée" },
];

const paymentOptions: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "collected", label: "Encaissé" },
  { value: "refunded", label: "Remboursé" },
];

const navigation: {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
}[] = [
  { id: "overview", label: "Vue d’ensemble", icon: LayoutDashboard, group: "Opérations" },
  { id: "orders", label: "Commandes", icon: ClipboardList, group: "Opérations" },
  { id: "customers", label: "Clients CRM", icon: Users, group: "Opérations" },
  { id: "products", label: "Produits & stock", icon: Boxes, group: "Opérations" },
  { id: "coupons", label: "Coupons", icon: Gift, group: "Croissance" },
  { id: "automations", label: "Automatisations", icon: Settings2, group: "Administration" },
];

function confirmationStatus(order: Order): ConfirmationStatus {
  return order.confirmationStatus ?? "new";
}

function shipmentStatus(order: Order): ShipmentStatus {
  return order.shipmentStatus ?? "unfulfilled";
}

function paymentStatus(order: Order): PaymentStatus {
  return order.paymentStatus ?? "pending";
}

function statusLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function sameCasablancaDay(iso: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(iso)) === formatter.format(date);
}

function relativeWaiting(iso: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  );
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} j`;
}

function StatusSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-9 w-full appearance-none rounded-lg border border-border bg-white pe-8 ps-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-2.5 size-4 text-muted-foreground" />
      </div>
    </label>
  );
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [error, setError] = useState("");
  const [needsKey, setNeedsKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<ConfirmationStatus | "all">("all");

  function authHeaders(secret?: string): HeadersInit {
    const value =
      secret ?? sessionStorage.getItem("veltrano:admin-secret") ?? "";
    return value ? { "x-admin-secret": value } : {};
  }

  async function load(secret?: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: authHeaders(secret),
        cache: "no-store",
      });
      if (res.status === 401) {
        setNeedsKey(true);
        setData(null);
        setError("Clé admin requise.");
        return;
      }
      const json = (await res.json()) as DashboardData & { error?: string };
      if (!res.ok) throw new Error(json.error || "Chargement impossible.");
      setData(json);
      setNeedsKey(false);
      if (secret) sessionStorage.setItem("veltrano:admin-secret", secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("veltrano:admin-secret") ?? "";
    setKey(saved);
    load(saved || undefined);
    // Initial authorization check only; subsequent refreshes are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateOrder(
    orderId: string,
    patch: Partial<
      Pick<
        Order,
        | "confirmationStatus"
        | "shipmentStatus"
        | "paymentStatus"
        | "internalNotes"
      >
    >
  ) {
    setSavingId(orderId);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, ...patch }),
      });
      const json = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !json.order) {
        throw new Error(json.error || "Mise à jour impossible.");
      }
      setData((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((order) =>
                order.id === orderId ? json.order! : order
              ),
            }
          : current
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setSavingId("");
    }
  }

  function onUnlock(event: FormEvent) {
    event.preventDefault();
    load(key.trim());
  }

  const orders = useMemo(() => data?.orders ?? [], [data?.orders]);
  const metrics = useMemo(() => {
    const today = orders.filter((order) => sameCasablancaDay(order.createdAt));
    const awaiting = orders.filter((order) =>
      ["new", "awaiting_confirmation"].includes(confirmationStatus(order))
    );
    const delivered = orders.filter(
      (order) => shipmentStatus(order) === "delivered"
    );
    const deliveredSales = delivered.reduce(
      (sum, order) => sum + order.totalMad,
      0
    );
    const pendingMoney = orders
      .filter(
        (order) =>
          shipmentStatus(order) === "delivered" &&
          paymentStatus(order) === "pending"
      )
      .reduce((sum, order) => sum + order.totalMad, 0);
    return { today, awaiting, delivered, deliveredSales, pendingMoney };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (
        orderFilter !== "all" &&
        confirmationStatus(order) !== orderFilter
      ) {
        return false;
      }
      if (!normalized) return true;
      return [
        order.id,
        order.name,
        order.phone,
        order.city,
        order.address,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [orders, orderFilter, query]);

  const customers = useMemo(() => {
    const byPhone = new Map<
      string,
      { name: string; phone: string; city: string; orders: Order[] }
    >();
    orders.forEach((order) => {
      const phone = order.phone.replace(/\s+/g, "");
      const current = byPhone.get(phone) ?? {
        name: order.name,
        phone: order.phone,
        city: order.city,
        orders: [],
      };
      current.orders.push(order);
      byPhone.set(phone, current);
    });
    return [...byPhone.values()].sort(
      (a, b) =>
        new Date(b.orders[0].createdAt).getTime() -
        new Date(a.orders[0].createdAt).getTime()
    );
  }, [orders]);

  if (needsKey) {
    return (
      <div className="min-h-[75vh] bg-[#f6f7f8] px-4 py-16">
        <Card className="mx-auto max-w-md bg-white">
          <CardHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#172336] text-white">
              <Store className="size-5" />
            </div>
            <CardTitle className="text-2xl">Administration Veltrano</CardTitle>
            <CardDescription>
              Entre la clé définie dans ADMIN_SECRET pour accéder aux opérations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onUnlock}>
              <Label htmlFor="admin-key">Clé admin</Label>
              <Input
                id="admin-key"
                type="password"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full">
                Ouvrir le dashboard
              </Button>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f7f8]">
        <div className="text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-[#172336]" />
          <p className="mt-3 text-sm text-muted-foreground">
            Chargement des opérations…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-[#172033]">
      <div className="mx-auto flex max-w-[1480px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-e border-[#e5e8eb] bg-white p-5 lg:block">
          <div className="flex items-center gap-3 border-b border-[#eceef0] pb-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#172336] text-white">
              <Store className="size-5" />
            </div>
            <div>
              <p className="font-heading text-lg leading-none">Veltrano</p>
              <p className="mt-1 text-xs text-muted-foreground">Centre de pilotage</p>
            </div>
          </div>
          <nav className="mt-5 space-y-5">
            {["Opérations", "Croissance", "Administration"].map((group) => (
              <div key={group}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group}
                </p>
                <div className="space-y-1">
                  {navigation
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSection(item.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                            section === item.id
                              ? "bg-[#172336] font-medium text-white"
                              : "text-[#566171] hover:bg-[#f2f4f6] hover:text-[#172033]"
                          )}
                        >
                          <Icon className="size-4" />
                          {item.label}
                          {item.id === "orders" && metrics.awaiting.length > 0 ? (
                            <span className="ms-auto rounded-full bg-[#d96f32] px-2 py-0.5 text-[10px] text-white">
                              {metrics.awaiting.length}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#e5e8eb] bg-white px-4 py-4 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Administration
                </p>
                <h1 className="font-heading mt-1 text-2xl sm:text-3xl">
                  {navigation.find((item) => item.id === section)?.label}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {data ? (
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Mis à jour{" "}
                    {new Date(data.generatedAt).toLocaleTimeString("fr-MA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => load()}
                  disabled={loading}
                >
                  <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                  Actualiser
                </Button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs",
                      section === item.id
                        ? "border-[#172336] bg-[#172336] text-white"
                        : "border-[#dfe3e7] bg-white"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-7">
              <AlertCircle className="size-4" />
              {error}
            </div>
          ) : null}

          <div className="p-4 sm:p-7">
            {section === "overview" && data ? (
              <Overview
                data={data}
                metrics={metrics}
                onOpenOrders={() => setSection("orders")}
              />
            ) : null}
            {section === "orders" && data ? (
              <Orders
                orders={filteredOrders}
                query={query}
                setQuery={setQuery}
                filter={orderFilter}
                setFilter={setOrderFilter}
                savingId={savingId}
                updateOrder={updateOrder}
              />
            ) : null}
            {section === "customers" ? (
              <Customers customers={customers} />
            ) : null}
            {section === "products" && data ? (
              <Products products={data.products} orders={orders} />
            ) : null}
            {section === "coupons" && data ? (
              <Coupons
                coupons={data.coupons}
                authHeaders={authHeaders}
                onCreated={(coupon) =>
                  setData((current) =>
                    current
                      ? { ...current, coupons: [coupon, ...current.coupons] }
                      : current
                  )
                }
              />
            ) : null}
            {section === "automations" && data ? (
              <Automations data={data} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof ShoppingBag;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[#e2e5e8] bg-white p-4 text-start shadow-[0_1px_2px_rgba(10,20,30,0.03)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-heading mt-2 text-3xl">{value}</p>
        </div>
        <div className={cn("flex size-9 items-center justify-center rounded-lg", accent)}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{detail}</p>
    </button>
  );
}

function Overview({
  data,
  metrics,
  onOpenOrders,
}: {
  data: DashboardData;
  metrics: {
    today: Order[];
    awaiting: Order[];
    delivered: Order[];
    deliveredSales: number;
    pendingMoney: number;
  };
  onOpenOrders: () => void;
}) {
  const recent = data.orders.slice(0, 5);
  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-heading text-xl">Aujourd’hui à Casablanca</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Données issues des commandes réellement enregistrées.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Commandes reçues"
          value={metrics.today.length}
          detail="Créées aujourd’hui"
          icon={ShoppingBag}
          accent="bg-blue-50 text-blue-700"
          onClick={onOpenOrders}
        />
        <MetricCard
          label="À confirmer"
          value={metrics.awaiting.length}
          detail="Action équipe requise"
          icon={AlertCircle}
          accent="bg-orange-50 text-orange-700"
          onClick={onOpenOrders}
        />
        <MetricCard
          label="Livrées"
          value={metrics.delivered.length}
          detail="Toutes périodes"
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
          onClick={onOpenOrders}
        />
        <MetricCard
          label="Ventes livrées"
          value={mad(metrics.deliveredSales)}
          detail="Marchandise après remises"
          icon={CircleDollarSign}
          accent="bg-violet-50 text-violet-700"
        />
        <MetricCard
          label="Encaissement à suivre"
          value={mad(metrics.pendingMoney)}
          detail="Livrée, paiement en attente"
          icon={Package}
          accent="bg-slate-100 text-slate-700"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>File d’actions</CardTitle>
            <CardDescription>
              Les commandes les plus anciennes à traiter en premier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.awaiting.length ? (
              <div className="space-y-2">
                {metrics.awaiting.slice(0, 6).map((order) => (
                  <button
                    key={order.id}
                    onClick={onOpenOrders}
                    className="flex w-full items-center gap-3 rounded-lg border border-[#eceef0] p-3 text-start hover:bg-[#f8f9fa]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                      <MessageCircle className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {order.name} · {order.city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.id} · en attente depuis {relativeWaiting(order.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">{mad(order.totalMad)}</Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-50 p-5 text-center">
                <CheckCircle2 className="mx-auto size-6 text-emerald-700" />
                <p className="mt-2 text-sm font-medium text-emerald-900">
                  Aucune commande à confirmer
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>{data.orders.length} commande(s) au total</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <div className="divide-y divide-[#eceef0]">
                {recent.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{order.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.id} · {order.city}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-medium">{mad(order.totalMad)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {statusLabel(confirmationOptions, confirmationStatus(order))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune commande enregistrée.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {!data.integrations.analytics ? (
        <div className="flex gap-3 rounded-xl border border-dashed border-[#cbd1d7] bg-white p-4">
          <WifiOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Visiteurs non affichés</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Aucun compte analytics n’est connecté. Le dashboard n’invente pas de trafic.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Orders({
  orders,
  query,
  setQuery,
  filter,
  setFilter,
  savingId,
  updateOrder,
}: {
  orders: Order[];
  query: string;
  setQuery: (value: string) => void;
  filter: ConfirmationStatus | "all";
  setFilter: (value: ConfirmationStatus | "all") => void;
  savingId: string;
  updateOrder: (
    id: string,
    patch: Partial<
      Pick<
        Order,
        | "confirmationStatus"
        | "shipmentStatus"
        | "paymentStatus"
        | "internalNotes"
      >
    >
  ) => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-[#e2e5e8] bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Référence, client, téléphone, ville…"
            className="ps-9"
          />
        </div>
        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as ConfirmationStatus | "all")
          }
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
        >
          <option value="all">Toutes les confirmations</option>
          {confirmationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              saving={savingId === order.id}
              updateOrder={updateOrder}
            />
          ))
        ) : (
          <Card className="bg-white">
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune commande ne correspond à cette recherche.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  saving,
  updateOrder,
}: {
  order: Order;
  saving: boolean;
  updateOrder: (
    id: string,
    patch: Partial<
      Pick<
        Order,
        | "confirmationStatus"
        | "shipmentStatus"
        | "paymentStatus"
        | "internalNotes"
      >
    >
  ) => void;
}) {
  const [notes, setNotes] = useState(order.internalNotes ?? "");
  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-[#eceef0]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{order.id}</CardTitle>
              <Badge
                variant={
                  confirmationStatus(order) === "confirmed"
                    ? "default"
                    : confirmationStatus(order) === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {statusLabel(confirmationOptions, confirmationStatus(order))}
              </Badge>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            </div>
            <CardDescription className="mt-1">
              {new Date(order.createdAt).toLocaleString("fr-MA", {
                timeZone: "Africa/Casablanca",
              })}
            </CardDescription>
          </div>
          <p className="font-heading text-2xl">{mad(order.totalMad)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Client
                </p>
                <p className="mt-1 font-medium">{order.name}</p>
                <a
                  href={`tel:${order.phone}`}
                  className="mt-1 block text-sm text-[#35567d] underline-offset-2 hover:underline"
                >
                  {order.phone}
                </a>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Livraison
                </p>
                <p className="mt-1 text-sm">{order.address}</p>
                <p className="text-sm text-muted-foreground">{order.city}</p>
              </div>
            </div>
            {order.notes ? (
              <p className="mt-3 rounded-lg bg-[#f6f7f8] p-3 text-sm">
                <span className="font-medium">Note client :</span> {order.notes}
              </p>
            ) : null}
            <div className="mt-4 divide-y divide-[#eceef0] rounded-lg border border-[#eceef0]">
              {order.lines.map((line) => {
                const product = productBySlug(line.slug);
                return (
                  <div key={line.id} className="flex items-center gap-3 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/products/${line.slug}/01.jpg`}
                      alt=""
                      className="size-12 rounded-md bg-white object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium capitalize">
                        {product ? displayName(product) : line.slug.replace(/-/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {line.pack === "duo" ? "Pack de 2" : "1 jean"} ·{" "}
                        {line.pack === "duo"
                          ? `tailles ${line.size}/${line.sizeB}`
                          : `taille ${line.size}`}{" "}
                        · {lineUnitCount(line)} pièce(s)
                      </p>
                    </div>
                    <p className="text-sm font-medium">{mad(linePrice(line))}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>Sous-total {mad(order.subtotalMad)}</span>
              {order.discountMad ? (
                <span>Remise −{mad(order.discountMad)}</span>
              ) : null}
              <span>
                WhatsApp :{" "}
                {order.whatsapp?.status === "sent"
                  ? "envoyé"
                  : order.whatsapp?.status === "failed"
                    ? "échec"
                    : "en file"}
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-[#f8f9fa] p-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <StatusSelect
                label="Confirmation"
                value={confirmationStatus(order)}
                options={confirmationOptions}
                disabled={saving}
                onChange={(value) =>
                  updateOrder(order.id, { confirmationStatus: value })
                }
              />
              <StatusSelect
                label="Livraison"
                value={shipmentStatus(order)}
                options={shipmentOptions}
                disabled={saving}
                onChange={(value) =>
                  updateOrder(order.id, { shipmentStatus: value })
                }
              />
              <StatusSelect
                label="Paiement"
                value={paymentStatus(order)}
                options={paymentOptions}
                disabled={saving}
                onChange={(value) =>
                  updateOrder(order.id, { paymentStatus: value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`notes-${order.id}`}>Notes internes</Label>
              <Textarea
                id={`notes-${order.id}`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Résultat de l’appel, prochain suivi…"
                className="bg-white"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={saving || notes === (order.internalNotes ?? "")}
                onClick={() => updateOrder(order.id, { internalNotes: notes })}
              >
                Enregistrer la note
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Customers({
  customers,
}: {
  customers: {
    name: string;
    phone: string;
    city: string;
    orders: Order[];
  }[];
}) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Clients identifiés</CardTitle>
        <CardDescription>
          Regroupés par téléphone fourni dans les commandes.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {customers.length ? (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b text-start text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 text-start font-medium">Client</th>
                <th className="pb-3 text-start font-medium">Ville</th>
                <th className="pb-3 text-start font-medium">Commandes</th>
                <th className="pb-3 text-start font-medium">Valeur totale</th>
                <th className="pb-3 text-start font-medium">Dernière commande</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {customers.map((customer) => (
                <tr key={customer.phone}>
                  <td className="py-4">
                    <p className="font-medium">{customer.name}</p>
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      {customer.phone}
                    </a>
                  </td>
                  <td className="py-4">{customer.city}</td>
                  <td className="py-4">{customer.orders.length}</td>
                  <td className="py-4 font-medium">
                    {mad(
                      customer.orders.reduce(
                        (sum, order) => sum + order.totalMad,
                        0
                      )
                    )}
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {new Date(customer.orders[0].createdAt).toLocaleDateString(
                      "fr-MA"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-10 text-center text-muted-foreground">
            Les clients apparaîtront après leur première commande.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Products({
  products,
  orders,
}: {
  products: AdminProduct[];
  orders: Order[];
}) {
  const reservedBySlug = new Map<string, number>();
  orders
    .filter(
      (order) =>
        confirmationStatus(order) !== "cancelled" &&
        !["delivered", "returned"].includes(shipmentStatus(order))
    )
    .forEach((order) =>
      order.lines.forEach((line) =>
        reservedBySlug.set(
          line.slug,
          (reservedBySlug.get(line.slug) ?? 0) + lineUnitCount(line)
        )
      )
    );
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#dfe3e7] bg-white p-4 text-sm text-muted-foreground">
        Le catalogue actuel stocke un total par produit, pas encore par taille. Les
        réservations ci-dessous sont calculées depuis les commandes actives.
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const reserved = reservedBySlug.get(product.slug) ?? 0;
          const available = Math.max(0, product.stock - reserved);
          return (
            <Card key={product.slug} className="bg-white">
              <CardContent>
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/products/${product.slug}/01.jpg`}
                    alt=""
                    className="h-24 w-20 rounded-lg object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {product.fit === "baggy" ? "Baggy" : "Coupe droite"}
                    </p>
                    <h3 className="font-heading mt-1 text-lg capitalize">
                      {product.colour}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tailles {product.sizes.join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#f6f7f8] p-2">
                    <p className="text-[10px] uppercase text-muted-foreground">
                      En stock
                    </p>
                    <p className="mt-1 font-medium">{product.stock}</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-2">
                    <p className="text-[10px] uppercase text-orange-700">Réservé</p>
                    <p className="mt-1 font-medium">{reserved}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <p className="text-[10px] uppercase text-emerald-700">
                      Disponible
                    </p>
                    <p className="mt-1 font-medium">{available}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Coupons({
  coupons,
  authHeaders,
  onCreated,
}: {
  coupons: Coupon[];
  authHeaders: () => HeadersInit;
  onCreated: (coupon: Coupon) => void;
}) {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("50");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function createCoupon(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ code, amountMad: Number(amount) }),
      });
      const json = (await res.json()) as { coupon?: Coupon; error?: string };
      if (!res.ok || !json.coupon) {
        throw new Error(json.error || "Création impossible.");
      }
      onCreated(json.coupon);
      setMessage(`Code ${json.coupon.code} créé.`);
      setCode("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Création impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Card className="h-fit bg-white">
        <CardHeader>
          <CardTitle>Créer un coupon</CardTitle>
          <CardDescription>
            Code fixe en MAD, validé côté serveur et utilisable une seule fois.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createCoupon} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Code</Label>
              <Input
                id="coupon-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="VELTRANO50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-amount">Montant (MAD)</Label>
              <Input
                id="coupon-amount"
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Gift className="size-4" />}
              Créer le code
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Codes existants</CardTitle>
          <CardDescription>{coupons.length} code(s) enregistré(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length ? (
            <div className="divide-y divide-[#eceef0]">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-semibold">{coupon.code}</code>
                      <button
                        type="button"
                        title="Copier"
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Créé le {new Date(coupon.createdAt).toLocaleDateString("fr-MA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{mad(coupon.amountMad)}</span>
                    <Badge variant={coupon.usedAt ? "secondary" : "outline"}>
                      {coupon.usedAt ? "Utilisé" : "Disponible"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-muted-foreground">
              Aucun coupon enregistré.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Automations({ data }: { data: DashboardData }) {
  const integrations = [
    {
      name: "WhatsApp commandes",
      connected: data.integrations.whatsapp,
      description: data.integrations.whatsapp
        ? "Un fournisseur Meta ou Twilio est configuré."
        : `${data.queue.length} message(s) en file, non envoyé(s).`,
    },
    {
      name: "Alertes Gmail",
      connected: data.integrations.gmail,
      description: data.integrations.gmail
        ? "Identifiants Gmail détectés."
        : "Aucun identifiant Gmail configuré.",
    },
    {
      name: "Google Sheets",
      connected: data.integrations.googleSheets,
      description: data.integrations.googleSheets
        ? "Feuille et compte de service détectés."
        : "Aucune feuille de destination configurée.",
    },
    {
      name: "Analytics site",
      connected: data.integrations.analytics,
      description: data.integrations.analytics
        ? "Propriété GA4 détectée."
        : "Aucune propriété analytics connectée.",
    },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.name} className="bg-white">
            <CardContent>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    integration.connected
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {integration.connected ? (
                    <Wifi className="size-4" />
                  ) : (
                    <WifiOff className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{integration.name}</h3>
                    <Badge variant={integration.connected ? "default" : "secondary"}>
                      {integration.connected ? "Connecté" : "À configurer"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.queue.length ? (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>File WhatsApp</CardTitle>
            <CardDescription>
              Ces messages n’ont pas été marqués comme envoyés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.queue.slice(0, 10).map((item) => (
                <details
                  key={item.id}
                  className="rounded-lg border border-[#eceef0] p-3"
                >
                  <summary className="cursor-pointer text-sm font-medium">
                    {item.orderId} · {item.to}
                  </summary>
                  <p className="mt-2 text-xs text-muted-foreground">{item.reason}</p>
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-[#f6f7f8] p-3 font-sans text-xs">
                    {item.body}
                  </pre>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
