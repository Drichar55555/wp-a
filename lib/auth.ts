import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_PASSWORD || "change-me-in-production"
);

const COOKIE_NAME = "owk_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8;

export async function createAdminSession(
  password: string
): Promise<string | null> {
  if (password !== process.env.ADMIN_PASSWORD) return null;

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(ADMIN_SECRET);
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, ADMIN_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function setAdminCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function verifyEditToken(
  token: string
): Promise<{ id: string } | null> {
  const person = await prisma.person.findUnique({
    where: { editToken: token },
    select: { id: true },
  });
  return person ?? null;
}
