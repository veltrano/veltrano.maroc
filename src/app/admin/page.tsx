"use client";

import { FormEvent, useEffect, useState } from "react";
import { displayName, mad, productBySlug } from "@/data/catalog";
import type { Order, WhatsAppQueueItem } from "@/lib/order";
import { linePrice } from "@/lib/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function whatsappLabel(order: Order) {
  if (order.whatsapp?.status === "sent") return "WhatsApp envoyé";
  if (order.whatsapp?.status === "failed") return "WhatsApp en échec (file)";
  return "WhatsApp en file (non envoyé)";
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [queue, setQueue] = useState<WhatsAppQueueItem[]>([]);
  const [needsKey, setNeedsKey] = useState(false);

  async function load(secret?: string) {
    setError("");
    const headers: HeadersInit = {};
    if (secret) headers["x-admin-secret"] = secret;
    const res = await fetch("/api/admin/orders", { headers });
    if (res.status === 401) {
      setNeedsKey(true);
      setOrders(null);
      setError("Clé admin requise.");
      return;
    }
    if (!res.ok) {
      setError("Impossible de charger les commandes.");
      return;
    }
    const json = (await res.json()) as { orders: Order[]; queue: WhatsAppQueueItem[] };
    setOrders(json.orders);
    setQueue(json.queue ?? []);
    setNeedsKey(false);
    if (secret) sessionStorage.setItem("veltrano:admin-secret", secret);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("veltrano:admin-secret") ?? "";
    if (saved) setKey(saved);
    load(saved || undefined);
  }, []);

  function onUnlock(e: FormEvent) {
    e.preventDefault();
    load(key.trim());
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Équipe</p>
      <h1 className="font-heading mt-2 text-4xl">Commandes</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Toutes les commandes enregistrées côté serveur. Appelle le client pour confirmer
        livraison et paiement.
      </p>

      {needsKey ? (
        <form className="mt-8 max-w-sm space-y-2" onSubmit={onUnlock}>
          <Label htmlFor="admin-key">Clé admin</Label>
          <div className="flex gap-2">
            <Input
              id="admin-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="h-10"
            />
            <Button type="submit">Ouvrir</Button>
          </div>
        </form>
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {orders && orders.length === 0 ? (
        <p className="mt-12 text-muted-foreground">Aucune commande pour l’instant.</p>
      ) : null}

      {orders && orders.length > 0 ? (
        <ul className="mt-10 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-2xl">{order.id}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("fr-MA")}
                </p>
              </div>
              <p className="mt-3 text-sm">
                <span className="font-medium">{order.name}</span>
                <span className="text-muted-foreground"> · {order.phone}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.address}, {order.city}
              </p>
              {order.notes ? (
                <p className="mt-1 text-sm">Notes : {order.notes}</p>
              ) : null}
              <ul className="mt-4 space-y-1 text-sm">
                {order.lines.map((line) => {
                  const product = productBySlug(line.slug);
                  return (
                    <li key={line.id} className="flex justify-between gap-4">
                      <span>
                        {product ? displayName(product) : line.slug.replace(/-/g, " ")}
                      </span>
                      <span>
                        {line.pack === "duo" ? "pack de 2" : "1 jean"} × {line.quantity} ·{" "}
                        {line.pack === "duo"
                          ? `tailles ${line.size}/${line.sizeB}`
                          : `taille ${line.size}`}{" "}
                        · {mad(linePrice(line))}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span>Sous-total {mad(order.subtotalMad)}</span>
                {order.discountMad ? <span>Coupon −{mad(order.discountMad)}</span> : null}
                <span className="font-medium">Total {mad(order.totalMad)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Coupon offert : {order.rewardCoupon}
                {order.appliedCoupon ? ` · code utilisé ${order.appliedCoupon}` : ""}
              </p>
              <p className="mt-2 text-sm">{whatsappLabel(order)}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {queue.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-2xl">File WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages prêts à partir dès que les identifiants API sont configurés. Non envoyés.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {queue.map((item) => (
              <li key={item.id} className="rounded-xl border border-border p-4">
                <p className="font-medium">
                  {item.orderId} · {item.to}
                </p>
                <p className="mt-1 text-muted-foreground">{item.reason}</p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-xs">{item.body}</pre>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
