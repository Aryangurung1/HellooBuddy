import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Payment failed", status: "failure" });
}
