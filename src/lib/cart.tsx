"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Product } from "@/data/catalog";
import { productBySlug } from "@/data/catalog";
import {
  COUPON_VALUE_MAD,
  setAppliedCode,
  unusedCoupon,
} from "@/lib/coupons";
import {
  cartSubtotal as subtotalOf,
  cartUnitCount as unitCountOf,
  linePrice as priceOf,
  lineUnitCount as unitOf,
  type CartLine,
  type Order,
} from "@/lib/order";

export type { CartLine, Order };

const CART_KEY = "veltrano:cart";
const ORDERS_KEY = "veltrano:orders";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

let cart: CartLine[] = [];
let orders: Order[] = [];
const cartListeners = new Set<() => void>();
const orderListeners = new Set<() => void>();

function emitCart() {
  cartListeners.forEach((l) => l());
}
function emitOrders() {
  orderListeners.forEach((l) => l());
}

function persistCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  emitCart();
}

function persistOrders() {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  emitOrders();
}

if (typeof window !== "undefined") {
  cart = read(CART_KEY, []);
  orders = read(ORDERS_KEY, []);
}

function subscribeCart(fn: () => void) {
  cartListeners.add(fn);
  return () => cartListeners.delete(fn);
}
function subscribeOrders(fn: () => void) {
  orderListeners.add(fn);
  return () => orderListeners.delete(fn);
}

function getCart() {
  return cart;
}
function getOrders() {
  return orders;
}
function getServerSnapshotCart(): CartLine[] {
  return EMPTY_CART;
}
function getServerSnapshotOrders(): Order[] {
  return EMPTY_ORDERS;
}
const EMPTY_CART: CartLine[] = [];
const EMPTY_ORDERS: Order[] = [];

export function lineUnitCount(line: CartLine) {
  return unitOf(line);
}

export function linePrice(line: CartLine) {
  return priceOf(line);
}

export function cartSubtotal(lines: CartLine[]) {
  return subtotalOf(lines);
}

export function cartDiscount(lines: CartLine[], couponCode?: string | null) {
  if (!couponCode) return 0;
  if (typeof window === "undefined") return 0;
  const coupon = unusedCoupon(couponCode);
  if (!coupon) return 0;
  const subtotal = cartSubtotal(lines);
  if (subtotal <= 0) return 0;
  if (coupon.percent) return Math.round(subtotal * (coupon.percent / 100));
  return coupon.amountMad ?? COUPON_VALUE_MAD;
}

export function cartShipping(_lines?: CartLine[]) {
  // Free shipping for supported Moroccan orders — authoritative rule.
  return 0;
}

export function cartTotal(lines: CartLine[], couponCode?: string | null) {
  return Math.max(
    0,
    cartSubtotal(lines) - cartDiscount(lines, couponCode) + cartShipping(lines)
  );
}

export function cartUnitCount(lines: CartLine[]) {
  return unitCountOf(lines);
}

type CartApi = {
  lines: CartLine[];
  orders: Order[];
  add: (input: Omit<CartLine, "id">) => void;
  setQty: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  rememberOrder: (order: Order) => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribeCart, getCart, getServerSnapshotCart);
  const savedOrders = useSyncExternalStore(
    subscribeOrders,
    getOrders,
    getServerSnapshotOrders
  );

  const add = useCallback((input: Omit<CartLine, "id">) => {
    const existing = cart.find(
      (l) =>
        l.slug === input.slug &&
        l.pack === input.pack &&
        l.size === input.size &&
        (l.sizeB ?? "") === (input.sizeB ?? "")
    );
    if (existing) {
      existing.quantity += input.quantity;
    } else {
      cart = [
        ...cart,
        {
          ...input,
          id: `${input.slug}-${input.pack}-${input.size}-${input.sizeB ?? "x"}-${Date.now()}`,
        },
      ];
    }
    persistCart();
  }, []);

  const setQty = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      cart = cart.filter((l) => l.id !== id);
    } else {
      cart = cart.map((l) => (l.id === id ? { ...l, quantity } : l));
    }
    persistCart();
  }, []);

  const remove = useCallback((id: string) => {
    cart = cart.filter((l) => l.id !== id);
    persistCart();
  }, []);

  const clear = useCallback(() => {
    cart = [];
    persistCart();
  }, []);

  const rememberOrder = useCallback((order: Order) => {
    orders = [order, ...orders.filter((o) => o.id !== order.id)];
    persistOrders();
    cart = [];
    persistCart();
    setAppliedCode(null);
  }, []);

  const value = useMemo(
    () => ({
      lines,
      orders: savedOrders,
      add,
      setQty,
      remove,
      clear,
      rememberOrder,
    }),
    [lines, savedOrders, add, setQty, remove, clear, rememberOrder]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function lineProduct(line: CartLine): Product | undefined {
  return productBySlug(line.slug);
}
