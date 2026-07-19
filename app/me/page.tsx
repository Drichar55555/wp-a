import { redirect } from "next/navigation";
import { verifyStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExhibitionDesigner from "./ExhibitionDesigner";

interface PageImage {
  id: string;
  url: string;
  sort: number;
}

interface PagePerson {
  id: string;
  code: string;
  username: string;
  englishName: string | null;
  chineseName: string | null;
  grade: string | null;
  bio: string | null;
  avatarUrl: string | null;
  habitatWords: string[];
  selfWords: string[];
  exhibitionAnswers: Record<string, string>;
  exhibitionCompleted: boolean;
  images: PageImage[];
}

function normalizeAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] =>
      typeof entry[1] === "string"
    )
  );
}

export default async function MePage() {
  const session = await verifyStudentSession();
  if (!session) {
    redirect("/?next=/me");
  }

  const person = await prisma.person.findUnique({
    where: { id: session.personId },
    include: {
      images: {
        where: { hidden: false },
        orderBy: { sort: "asc" },
      },
    },
  });

  if (!person) {
    redirect("/?next=/me");
  }

  const personData: PagePerson = {
    id: person.id,
    code: person.code,
    username: person.username,
    englishName: person.englishName,
    chineseName: person.chineseName,
    grade: person.grade,
    bio: person.bio,
    avatarUrl: person.avatarUrl,
    habitatWords: person.habitatWords,
    selfWords: person.selfWords,
    exhibitionAnswers: normalizeAnswers(person.exhibitionAnswers),
    exhibitionCompleted: person.exhibitionCompleted,
    images: person.images.map((img) => ({
      id: img.id,
      url: img.url,
      sort: img.sort,
    })),
  };

  return <ExhibitionDesigner person={personData} />;
}