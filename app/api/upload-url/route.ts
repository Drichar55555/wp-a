import { NextRequest, NextResponse } from "next/server";
import { verifyEditToken } from "@/lib/auth";
import { createPresignedUploadUrl, getPublicUrl } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const auth = await verifyEditToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const { contentType } = await request.json();
  if (!contentType) {
    return NextResponse.json(
      { error: "contentType required" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json(
      { error: "Only jpg, png, webp allowed" },
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

  const ext = contentType.split("/")[1] || "webp";
  const key = `${auth.id}/${nanoid()}.${ext}`;

  const putUrl = await createPresignedUploadUrl(key, contentType);
  const publicUrl = getPublicUrl(key);

  return NextResponse.json({ putUrl, publicUrl, key });
}
