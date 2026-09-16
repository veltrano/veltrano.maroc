import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { orders } = await readStore();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
