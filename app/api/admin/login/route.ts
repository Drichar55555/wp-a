import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, setAdminCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password) {
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
