import { NextRequest, NextResponse } from "next/server";
import { verifyStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

const MAX_USERNAME_LENGTH = 40;
const MAX_NAME_LENGTH = 40;
const MAX_GRADE_LENGTH = 20;
const MAX_BIO_LENGTH = 80;
const MAX_EXHIBITION_WORDS = 5;
const MAX_EXHIBITION_WORD_LENGTH = 20;
const MAX_EXHIBITION_ANSWER_LENGTH = 300;

function codePointLength(value: string) {
  return [...value].length;
}

function validateOptionalText(
  value: unknown,
  field: string,
  maxLength: number
) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    return `${field} must be a string`;
  }

  const length = codePointLength(value);
  if (length > maxLength) {
    return `${field} must be ≤ ${maxLength} characters (got ${length})`;
  }

  return null;
}

function isValidAvatarUrl(value: string) {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return !!base && value.startsWith(`${base}/`) && !value.includes("?");
}

function isValidWordList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_EXHIBITION_WORDS &&
    value.every(
      (word) =>
        typeof word === "string" &&
        codePointLength(word.trim()) > 0 &&
        codePointLength(word.trim()) <= MAX_EXHIBITION_WORD_LENGTH
    )
  );
}

function isValidExhibitionAnswers(
  value: unknown
): value is Record<string, string> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length <= 10 &&
    Object.values(value).every(
      (answer) =>
        typeof answer === "string" &&
        codePointLength(answer) <= MAX_EXHIBITION_ANSWER_LENGTH
    )
  );
}

export async function GET() {
  const session = await verifyStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const person = await prisma.person.findUnique({
    where: { id: session.personId },
    select: {
      id: true,
      code: true,
      username: true,
      englishName: true,
      chineseName: true,
      grade: true,
      bio: true,
      avatarUrl: true,
      habitatWords: true,
      selfWords: true,
      exhibitionAnswers: true,
      exhibitionCompleted: true,
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

  let body: Record<string, unknown>;
  try {
    const parsed = await _request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid request body");
    }
    body = parsed;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const {
    username,
    englishName,
    chineseName,
    grade,
    bio,
    avatarUrl,
    habitatWords,
    selfWords,
    exhibitionAnswers,
    exhibitionCompleted,
  } = body;

  const normalizedUsername =
    typeof username === "string" ? username.trim() : username;
  if (
    normalizedUsername !== undefined &&
    (typeof normalizedUsername !== "string" ||
      codePointLength(normalizedUsername) < 2 ||
      codePointLength(normalizedUsername) > MAX_USERNAME_LENGTH ||
      /[\s/]/u.test(normalizedUsername))
  ) {
    return NextResponse.json(
      { error: "用户名需为 2–40 个字符，且不能包含空格或斜杠" },
      { status: 400 }
    );
  }

  for (const [value, field, maxLength] of [
    [englishName, "englishName", MAX_NAME_LENGTH],
    [chineseName, "chineseName", MAX_NAME_LENGTH],
    [grade, "grade", MAX_GRADE_LENGTH],
    [bio, "bio", MAX_BIO_LENGTH],
  ] as const) {
    const error = validateOptionalText(value, field, maxLength);
    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }
  }

  if (habitatWords !== undefined && !isValidWordList(habitatWords)) {
    return NextResponse.json(
      { error: "habitatWords must contain at most 5 words of 20 characters" },
      { status: 400 }
    );
  }
  if (selfWords !== undefined && !isValidWordList(selfWords)) {
    return NextResponse.json(
      { error: "selfWords must contain at most 5 words of 20 characters" },
      { status: 400 }
    );
  }
  if (
    exhibitionAnswers !== undefined &&
    !isValidExhibitionAnswers(exhibitionAnswers)
  ) {
    return NextResponse.json(
      { error: "Invalid exhibition answers" },
      { status: 400 }
    );
  }
  if (
    exhibitionCompleted !== undefined &&
    typeof exhibitionCompleted !== "boolean"
  ) {
    return NextResponse.json(
      { error: "exhibitionCompleted must be a boolean" },
      { status: 400 }
    );
  }

  const normalizedAvatarUrl = avatarUrl === "" ? null : avatarUrl;
  if (
    normalizedAvatarUrl !== undefined &&
    normalizedAvatarUrl !== null &&
    (typeof normalizedAvatarUrl !== "string" ||
      !isValidAvatarUrl(normalizedAvatarUrl))
  ) {
    return NextResponse.json(
      { error: "avatarUrl must be an R2 public URL or null" },
      { status: 400 }
    );
  }

  const person = await prisma.person.findUnique({
    where: { id: session.personId },
    select: { avatarUrl: true, exhibitionCompleted: true },
  });
  const effectiveAvatarUrl =
    normalizedAvatarUrl !== undefined ? normalizedAvatarUrl : person?.avatarUrl;
  const effectiveExhibitionCompleted =
    exhibitionCompleted !== undefined
      ? exhibitionCompleted
      : person?.exhibitionCompleted;
  const published = !!effectiveAvatarUrl || !!effectiveExhibitionCompleted;

  try {
    const updated = await prisma.person.update({
      where: { id: session.personId },
      select: {
        id: true,
        code: true,
        username: true,
        englishName: true,
        chineseName: true,
        grade: true,
        bio: true,
        avatarUrl: true,
        habitatWords: true,
        selfWords: true,
        exhibitionAnswers: true,
        exhibitionCompleted: true,
        published: true,
        images: { orderBy: { sort: "asc" } },
      },
      data: {
        ...(normalizedUsername !== undefined && { username: normalizedUsername }),
        ...(englishName !== undefined && { englishName }),
        ...(chineseName !== undefined && { chineseName }),
        ...(grade !== undefined && { grade }),
        ...(bio !== undefined && { bio }),
        ...(normalizedAvatarUrl !== undefined && {
          avatarUrl: normalizedAvatarUrl,
        }),
        ...(habitatWords !== undefined && {
          habitatWords: habitatWords.map((word) => word.trim()),
        }),
        ...(selfWords !== undefined && {
          selfWords: selfWords.map((word) => word.trim()),
        }),
        ...(exhibitionAnswers !== undefined && { exhibitionAnswers }),
        ...(exhibitionCompleted !== undefined && { exhibitionCompleted }),
        published,
      },
    });

    return NextResponse.json({ ok: true, person: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "这个用户名已经被使用，请换一个" },
        { status: 409 }
      );
    }
    throw error;
  }
}
