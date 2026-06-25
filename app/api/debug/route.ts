import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const result = await prisma.$queryRaw`SELECT 1 as one`;
    return NextResponse.json({ step: "query_ok", result });
  } catch (e: any) {
    return NextResponse.json({
      error: "query_failed",
      message: String(e.message ?? e),
      stack: String(e.stack ?? "").split("\n").slice(0, 8),
    }, { status: 500 });
  }
}
