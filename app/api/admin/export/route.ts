import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const persons = await prisma.person.findMany({
    orderBy: { createdAt: "asc" },
  });

  const header = "chineseName,englishName,homepage,location,edit";
  const rows = persons.map((p) =>
    [
      p.chineseName || "",
      p.englishName || "",
      `${baseUrl}/u/${p.code}`,
      `${baseUrl}/loc/${p.code}`,
      `${baseUrl}/edit/${p.editToken}`,
    ].join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="owek-export.csv"',
    },
  });
}
