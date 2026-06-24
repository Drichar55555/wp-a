import { NextRequest, NextResponse } from "next/server";
import { verifyEditToken } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const auth = await verifyEditToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const { url, key } = await request.json();
  if (!url || !key) {
    return NextResponse.json(
      { error: "url and key required" },
      { status: 400 }
    );
  }

  const imageCount = await prisma.image.count({
    where: { personId: auth.id, hidden: false },
  });

  if (imageCount >= 4) {
    return NextResponse.json(
      { error: "Maximum 4 images allowed" },
      { status: 409 }
    );
  }

  const maxSort = await prisma.image.aggregate({
    where: { personId: auth.id },
    _max: { sort: true },
  });

  const image = await prisma.image.create({
    data: {
      personId: auth.id,
      url,
      key,
      sort: (maxSort._max.sort ?? -1) + 1,
    },
  });

  return NextResponse.json({ image });
}

export async function DELETE(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const id = request.nextUrl.searchParams.get("id");
  if (!token || !id) {
    return NextResponse.json(
      { error: "token and id required" },
      { status: 400 }
    );
  }

  const auth = await verifyEditToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const image = await prisma.image.findUnique({ where: { id } });
  if (!image || image.personId !== auth.id) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await deleteFromR2(image.key);
  await prisma.image.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
