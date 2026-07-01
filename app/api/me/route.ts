import { NextRequest, NextResponse } from "next/server";
import { verifyStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await verifyStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const person = await prisma.person.findUnique({
    where: { id: session.personId },
    select: {
      id: true,
      code: true,
      englishName: true,
      chineseName: true,
      grade: true,
      bio: true,
      avatarUrl: true,
      published: true,
      images: { orderBy: { sort: "asc" } },
    },
  });

  return NextResponse.json({ person, images: person?.images ?? [] });
}

export async function PATCH(_request: NextRequest) {
  const session = await verifyStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await _request.json();
  const { englishName, chineseName, grade, bio, avatarUrl } = body;

  if (bio !== undefined) {
    const codePoints = [...bio].length;
    if (codePoints > 80) {
      return NextResponse.json(
        { error: `Bio must be ≤ 80 characters (got ${codePoints})` },
        { status: 400 }
      );
    }
  }

  const person = await prisma.person.findUnique({
    where: { id: session.personId },
    select: { avatarUrl: true },
  });
  const effectiveAvatarUrl =
    avatarUrl !== undefined ? avatarUrl : person?.avatarUrl;
  const published = !!effectiveAvatarUrl;

  const updated = await prisma.person.update({
    where: { id: session.personId },
    select: {
      id: true,
      code: true,
      englishName: true,
      chineseName: true,
      grade: true,
      bio: true,
      avatarUrl: true,
      published: true,
      images: { orderBy: { sort: "asc" } },
    },
    data: {
      ...(englishName !== undefined && { englishName }),
      ...(chineseName !== undefined && { chineseName }),
      ...(grade !== undefined && { grade }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      published,
    },
  });

  return NextResponse.json({ ok: true, person: updated });
}
