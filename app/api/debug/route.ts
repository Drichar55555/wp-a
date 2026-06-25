import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    void prisma;
    return NextResponse.json({ step: "prisma_imported" });
  } catch (e: any) {
    return NextResponse.json({
      error: "prisma_import_failed",
      message: String(e.message ?? e),
      stack: String(e.stack ?? "").split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
