import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Coupon, Order, WhatsAppQueueItem } from "@/lib/order";

const DIR =
  process.env.DATA_DIR || path.join(process.cwd(), "data", "store");
const ORDERS_FILE = path.join(DIR, "orders.json");
const COUPONS_FILE = path.join(DIR, "coupons.json");
const QUEUE_FILE = path.join(DIR, "whatsapp-queue.json");

type StoreFile = {
  orders: Order[];
  coupons: Coupon[];
  queue: WhatsAppQueueItem[];
};

let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function load(): Promise<StoreFile> {
  await mkdir(DIR, { recursive: true });
  const [orders, coupons, queue] = await Promise.all([
    readJson<Order[]>(ORDERS_FILE, []),
    readJson<Coupon[]>(COUPONS_FILE, []),
    readJson<WhatsAppQueueItem[]>(QUEUE_FILE, []),
  ]);
  return { orders, coupons, queue };
}

async function save(data: StoreFile) {
  await mkdir(DIR, { recursive: true });
  await Promise.all([
    writeFile(ORDERS_FILE, JSON.stringify(data.orders, null, 2)),
    writeFile(COUPONS_FILE, JSON.stringify(data.coupons, null, 2)),
    writeFile(QUEUE_FILE, JSON.stringify(data.queue, null, 2)),
  ]);
}

export function mutateStore<T>(fn: (data: StoreFile) => T | Promise<T>): Promise<T> {
  return withLock(async () => {
    const data = await load();
    const result = await fn(data);
    await save(data);
    return result;
  });
}

export function readStore(): Promise<StoreFile> {
  return withLock(() => load());
}
