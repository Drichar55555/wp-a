import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, setAdminCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_IP_ATTEMPTS = 10;

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(`admin:login:ip:${ip}`, MAX_IP_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid request body");
    }
    password = body.password;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const token = await createAdminSession(password);
  if (!token) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(setAdminCookie(token));
  return response;
}
