import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
