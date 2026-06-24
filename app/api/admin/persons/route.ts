import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const persons = await prisma.person.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      images: { orderBy: { sort: "asc" } },
    },
  });

  return NextResponse.json({ persons });
}
