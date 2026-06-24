import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { createUniqueCode, createUniqueEditToken } from "@/lib/code";
import { prisma } from "@/lib/prisma";

interface ImportRow {
  englishName?: string;
  chineseName: string;
  grade?: string;
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = (await request.json()) as { rows: ImportRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows array required" }, { status: 400 });
  }

  const created: { chineseName: string; code: string; editToken: string }[] =
    [];

  for (const row of rows) {
    if (!row.chineseName) continue;

    const code = await createUniqueCode();
    const editToken = await createUniqueEditToken();

    const person = await prisma.person.create({
      data: {
        code,
        editToken,
        englishName: row.englishName || null,
        chineseName: row.chineseName,
        grade: row.grade || null,
        location: {
          create: {
            code,
            name: row.chineseName,
            grade: row.grade || null,
            room: "",
            seat: "",
          },
        },
      },
    });

    created.push({
      chineseName: person.chineseName!,
      code: person.code,
      editToken: person.editToken,
    });
  }

  return NextResponse.json({ created });
}
