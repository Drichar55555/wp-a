import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyStudentSession } from '@/lib/auth'
import ImageGallery from './ImageGallery'
import FavoriteButton from '@/app/loc/[code]/FavoriteButton'

interface PageProps {
  params: Promise<{ code: string }>
}

const EXHIBITION_QUESTIONS = [
  '你最想住在哪里',
  '你最显著的特点是什么',
  '你最常使用的单词或短语是什么？',
  '你最珍贵的财产是什么',
  '你目前的心境怎样',
  '何时何地让你感觉到最快乐',
  '你最想拥有哪种才能',
  '你认为最完美的幸福是怎样的？',
  '你认为自己最大的成就是什么？',
  '你认为程度最浅的痛苦是什么？',
]

function normalizeAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1].trim().length > 0
    )
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const person = await prisma.person.findUnique({
    where: { code },
    select: { chineseName: true, englishName: true, hidden: true },
  })
  if (!person || person.hidden) return { title: '页面不存在' }
  return { title: `${person.englishName || person.chineseName || code} · My Exhibition` }
}

export default async function ProfilePage({ params }: PageProps) {
  const { code } = await params

  const session = await verifyStudentSession();
  if (!session) {
    redirect('/?next=' + encodeURIComponent('/u/' + code));
  }

  const person = await prisma.person.findUnique({
    where: { code },
    include: {
      images: {
        where: { hidden: false },
        orderBy: { sort: 'asc' },
      },
      location: true,
    },
  })

  if (!person || person.hidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-5">🙈</div>
          <h1 className="text-lg font-semibold text-zinc-900 mb-1.5">
            该页面已隐藏
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            这位同学暂时关闭了个人主页
          </p>
        </div>
      </div>
    )
  }

  if (!person.published && !person.exhibitionCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-5">📝</div>
          <h1 className="text-lg font-semibold text-zinc-900 mb-1.5">
            这位同学还没布置主页
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            等他准备好了再来看看吧
          </p>
        </div>
      </div>
    )
  }

  const displayImages = person.images.filter((img) => !img.hidden);
  const answers = normalizeAnswers(person.exhibitionAnswers)
  const answeredQuestions = EXHIBITION_QUESTIONS.map((question, index) => ({
    question,
    answer: answers[String(index)] || '',
  })).filter((item) => item.answer)
  const displayName = person.englishName || person.chineseName || person.username
  const initials = displayName.slice(0, 1).toUpperCase()

  let initialFavorited = false;
  if (session) {
    const existing = await prisma.favorite.findUnique({
      where: {
        favoriterId_favoriteeId: {
          favoriterId: session.personId,
          favoriteeId: person.id,
        },
      },
    });
    initialFavorited = !!existing;
  }

  const showFavoriteButton =
    session && person && !person.hidden && (person.published || person.exhibitionCompleted) &&
    session.personId !== person.id;

  return (
    <div className="min-h-[100svh] bg-white sm:flex sm:items-center sm:justify-center sm:bg-zinc-200 sm:p-6">
      <div className="min-h-[100svh] w-full bg-white sm:aspect-[430/932] sm:h-[min(calc(100svh-3rem),932px)] sm:min-h-0 sm:w-auto sm:max-w-[calc(100vw-3rem)] sm:overflow-hidden sm:border sm:border-zinc-400">
    <main className="phone-profile-scroll min-h-[100svh] overflow-x-hidden bg-white text-black selection:bg-[#ff4f12] selection:text-white sm:h-full sm:min-h-0 sm:overflow-y-auto sm:overscroll-contain">
      <header className="mx-auto flex w-full items-center justify-between px-5 py-6">
        <Link href="/" className="font-platform text-xl font-bold tracking-[0.04em]">
          MSA · EXHIBITION
        </Link>
        <div className="flex items-center gap-3">
          {showFavoriteButton && (
            <FavoriteButton
              code={person.code}
              name={person.chineseName || person.englishName || code}
              initialFavorited={initialFavorited}
            />
          )}
          <Link
            href={`/loc/${code}`}
            className="flex h-11 items-center gap-2 rounded-full border-2 border-black bg-white px-4 text-sm font-semibold transition-colors hover:bg-black hover:text-white"
            aria-label="查看展位"
            title="查看展位"
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="sr-only">我的展位</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100svh-6rem)] w-full flex-col gap-10 px-5 pb-20 pt-8">
        <div className="relative z-10">
          <p className="font-platform text-sm font-bold uppercase tracking-[0.22em] text-[#ff4f12]">
            Your First Exhibition in MSA
          </p>
          <h1 className="font-platform mt-5 break-words text-[clamp(4rem,20vw,5.5rem)] font-bold leading-[0.78] tracking-[0.015em]">
            {displayName}
          </h1>
          {person.englishName && person.chineseName && (
            <p className="font-qihei mt-6 text-lg font-medium">{person.chineseName}</p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {person.grade && (
              <span className="font-qihei rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">
                {person.grade}
              </span>
            )}
            <span className="font-platform rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-600">
              @{person.username}
            </span>
          </div>
          {person.bio && (
            <p className="font-qihei mt-8 whitespace-pre-line text-base font-normal leading-[1.9] text-zinc-600">
              {person.bio}
            </p>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-[22rem] px-6 py-10">
          <div className="absolute inset-x-10 inset-y-4 rotate-6 rounded-[3.5rem] bg-[#ff4f12]" aria-hidden="true" />
          <div className="relative aspect-[4/5] -rotate-3 overflow-hidden rounded-[3.5rem] border-[8px] border-zinc-100 bg-zinc-50 shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
            {person.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.avatarUrl} alt={`${displayName}的头像`} className="h-full w-full object-cover" />
            ) : displayImages[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImages[0].url} alt={`${displayName}的展览照片`} className="h-full w-full object-cover" />
            ) : (
              <div className="font-platform flex h-full items-center justify-center bg-zinc-100 text-[12rem] font-bold text-zinc-200">
                {initials}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-24 text-white">
        <div className="mx-auto grid w-full gap-20">
          <div>
            <p className="font-platform text-sm font-bold uppercase tracking-[0.2em] text-[#ff4f12]">Who am I?</p>
            <h2 className="font-platform mt-4 break-words text-[clamp(3.5rem,17vw,4.75rem)] font-bold leading-[0.84] tracking-[0.015em]">
              {person.username}.adj
            </h2>
            <p className="font-qihei mt-5 text-sm font-medium text-zinc-400">用几个词，拼出现在的我。</p>
            <div className="mt-10 flex flex-wrap gap-3">
              {(person.selfWords.length > 0 ? person.selfWords : ['仍在认识自己']).map((word) => (
                <span key={word} className="font-qihei rounded-full bg-white px-6 py-3 text-base font-extrabold text-black">
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-platform text-sm font-bold uppercase tracking-[0.2em] text-[#ff4f12]">Habitat.adj</p>
            <h2 className="font-platform mt-4 text-[clamp(3rem,15vw,4.25rem)] font-bold leading-[0.86] tracking-[0.015em]">
              My habitat,<br />my language.
            </h2>
            <p className="font-qihei mt-5 text-sm font-medium text-zinc-400">我生活的地方，也是我的一部分。</p>
            <div className="mt-10 flex flex-wrap gap-3">
              {(person.habitatWords.length > 0 ? person.habitatWords : ['等待描述']).map((word) => (
                <span key={word} className="font-qihei rounded-full border-2 border-zinc-700 px-6 py-3 text-base font-semibold text-white">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {answeredQuestions.length > 0 && (
        <section className="px-5 py-24">
          <div className="mx-auto w-full">
            <div>
              <p className="font-platform text-sm font-bold uppercase tracking-[0.2em] text-[#ff4f12]">Some Questions</p>
              <h2 className="font-platform mt-4 text-[clamp(3.75rem,18vw,5rem)] font-bold leading-[0.8] tracking-[0.015em]">
                A little more<br />about me.
              </h2>
              <p className="font-qihei mt-6 text-sm font-medium text-zinc-500">一些答案，一些关于我的线索。</p>
            </div>

            <div className="mt-16 grid gap-5">
              {answeredQuestions.map((item, index) => (
                <article key={item.question} className="rounded-[2.5rem] bg-zinc-100 p-7">
                  <span className="font-platform text-5xl font-bold text-zinc-300">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="font-qihei mt-10 text-sm font-medium leading-relaxed text-zinc-500">{item.question}</h3>
                  <p className="font-qihei mt-4 whitespace-pre-line text-xl font-semibold leading-relaxed text-black">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {displayImages.length > 0 && (
        <section className="bg-zinc-100 px-5 py-24">
          <div className="mx-auto w-full">
            <p className="font-platform text-sm font-bold uppercase tracking-[0.2em] text-[#ff4f12]">My Gallery</p>
            <h2 className="font-platform mb-12 mt-4 text-[clamp(3.5rem,17vw,4.75rem)] font-bold leading-[0.84] tracking-[0.015em]">Things I see.</h2>
            <ImageGallery images={displayImages.map((img) => ({ id: img.id, url: img.url }))} />
          </div>
        </section>
      )}

      <footer className="flex flex-col items-start justify-between gap-5 border-t border-zinc-200 px-5 py-8">
        <p className="font-platform text-lg font-bold tracking-[0.04em]">{displayName} · MSA 2026</p>
        <Link href="/me" className="font-qihei rounded-full bg-[#ff4f12] px-6 py-3 text-sm font-semibold text-white">设计我的展览</Link>
      </footer>
    </main>
      </div>
    </div>
  )
}