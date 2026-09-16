import { NextResponse } from "next/server";
import { adminAuthorized } from "@/lib/admin-auth";
import { readStore } from "@/lib/store";

export async function GET(req: Request) {
  if (!adminAuthorized(req)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }
  const { orders, queue } = await readStore();
  return NextResponse.json({ orders, queue });
}
