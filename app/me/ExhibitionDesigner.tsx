"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

interface ExhibitionPerson {
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
}

interface ExhibitionDesignerProps {
  person: ExhibitionPerson;
}

type ProfileForm = {
  username: string;
  englishName: string;
  chineseName: string;
  grade: string;
  bio: string;
  avatarUrl: string;
};

const HABITAT_WORDS = [
  "舒适",
  "热闹",
  "安静",
  "自由",
  "拥挤",
  "温暖",
  "流动",
  "熟悉",
  "开放",
];
const SELF_WORDS = [
  "好奇",
  "温柔",
  "勇敢",
  "慢热",
  "幽默",
  "敏感",
  "松弛",
  "认真",
  "浪漫",
];
const WORD_TRACK_STEPS = [74, 68, 79, 71, 76, 69, 80, 72];
const WORD_POOL_EDGE_SPACE = 64;

function getWordTrackTop(slot: number) {
  let top = WORD_POOL_EDGE_SPACE;
  for (let index = 0; index < slot; index += 1) {
    top += WORD_TRACK_STEPS[index % WORD_TRACK_STEPS.length];
  }
  return top;
}
const QUESTIONS = [
  "你最想住在哪里",
  "你最显著的特点是什么",
  "你最常使用的单词或短语是什么？",
  "你最珍贵的财产是什么",
  "你目前的心境怎样",
  "何时何地让你感觉到最快乐",
  "你最想拥有哪种才能",
  "你认为最完美的幸福是怎样的？",
  "你认为自己最大的成就是什么？",
  "你认为程度最浅的痛苦是什么？",
];

const WHO_AM_I = 2;
const CARD_INVITE = 3;
const SELF_INTRO = 4;
const SELF_PICK = 5;
const SELF_RESULT = 6;
const HABITAT_INTRO = 7;
const HABITAT_PICK = 8;
const HABITAT_RESULT = 9;
const QUESTIONS_TITLE = 10;
const QUESTIONNAIRE_INTRO = 11;
const QUESTION_START = 12;
const QUESTION_END = QUESTION_START + QUESTIONS.length;
const FINAL_PREVIEW = QUESTION_END;

const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

function ArrowIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v15m0 0 6-6m-6 6-6-6" />
    </svg>
  );
}

function Brand({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layoutId="section-brand"
      transition={spring}
      className="font-platform pointer-events-none fixed right-5 top-5 z-30 text-right sm:right-10 sm:top-8"
    >
      <p className="text-[clamp(1.35rem,3vw,2.3rem)] font-black tracking-[0.01em] text-zinc-200">
        {children}
      </p>
    </motion.div>
  );
}

function ContinueButton({
  onClick,
  label = "继续",
  disabled = false,
  wide = false,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <motion.button
      layoutId="continue-button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={spring}
      className={`${
        wide ? "h-14 min-w-44 rounded-full px-8 text-base" : "h-12 w-12 rounded-full"
      } font-qihei flex items-center justify-center bg-[#ff4f12] font-semibold text-white shadow-[0_10px_30px_rgba(255,79,18,0.2)] outline-none transition-colors focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300 disabled:shadow-none`}
      aria-label={label}
    >
      {wide ? label : <ArrowIcon />}
    </motion.button>
  );
}

function SceneShell({
  children,
  sceneKey,
  className = "",
}: {
  children: React.ReactNode;
  sceneKey: string;
  className?: string;
}) {
  return (
    <section
      data-scene={sceneKey}
      className={`absolute inset-0 min-h-[100svh] overflow-y-auto bg-white px-5 py-20 sm:px-10 ${className}`}
    >
      {children}
    </section>
  );
}

function IntroScene({
  sceneKey,
  title,
  subtitle,
  brand,
  onNext,
}: {
  sceneKey: string;
  title: string;
  subtitle: string;
  brand?: string;
  onNext: () => void;
}) {
  return (
    <SceneShell sceneKey={sceneKey}>
      <button
        type="button"
        onClick={onNext}
        className="absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-black"
        aria-label={`继续：${title}`}
      />
      {brand && <Brand>{brand}</Brand>}
      <div className="pointer-events-none relative z-20 mx-auto flex min-h-[calc(100svh-10rem)] max-w-6xl flex-col items-end justify-center text-right">
        <motion.h1
          layoutId="hero-title"
          transition={spring}
          className="font-platform max-w-5xl text-[clamp(3.8rem,10vw,9rem)] font-black leading-[0.86] tracking-[0.015em] text-black"
        >
          {title}
        </motion.h1>
        <motion.p
          layoutId="hero-subtitle"
          transition={spring}
          className="font-qihei mt-5 max-w-3xl text-xs font-medium text-black sm:text-base"
        >
          {subtitle}
        </motion.p>
      </div>
      <div className="pointer-events-none fixed bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 sm:bottom-10">
        <span className="font-qihei text-xs font-semibold text-zinc-300">点击任意位置继续</span>
      </div>
    </SceneShell>
  );
}

function WordPicker({
  title,
  subtitle,
  brand,
  words,
  selected,
  onSelectedChange,
  onDone,
}: {
  title: string;
  subtitle: string;
  brand: string;
  words: string[];
  selected: string[];
  onSelectedChange: (words: string[]) => void;
  onDone: () => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState("");
  const [poolWords, setPoolWords] = useState(() =>
    Array.from(new Set([...words, ...selected])),
  );
  const [wordSlots, setWordSlots] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Array.from(new Set([...words, ...selected]))
        .filter((word) => !selected.includes(word))
        .map((word, index) => [word, index]),
    ),
  );
  const [selectedSources, setSelectedSources] = useState<Record<string, number>>({});

  function selectWord(word: string, sourceIndex: number) {
    if (!selected.includes(word) && selected.length < 5) {
      setSelectedSources((current) => ({ ...current, [word]: sourceIndex }));
      onSelectedChange([...selected, word]);
    }
  }

  function removeWord(word: string) {
    setWordSlots((current) => {
      if (current[word] !== undefined) return current;
      const nextSlot = Math.max(-1, ...Object.values(current)) + 1;
      return { ...current, [word]: nextSlot };
    });
    onSelectedChange(selected.filter((item) => item !== word));
  }

  function addCustom() {
    const value = custom.trim();
    if (!value || [...value].length > 20) return;
    setPoolWords((current) =>
      current.includes(value) ? current : [...current, value],
    );
    setWordSlots((current) => {
      if (current[value] !== undefined) return current;
      const nextSlot = Math.max(-1, ...Object.values(current)) + 1;
      return { ...current, [value]: nextSlot };
    });
    setCustom("");
    setShowCustom(false);
  }

  const availableWords = poolWords.filter((word) => !selected.includes(word));
  const highestSlot = Math.max(
    0,
    ...availableWords.map((word) => wordSlots[word] ?? 0),
  );
  const poolHeight = Math.max(
    352,
    getWordTrackTop(highestSlot) + WORD_POOL_EDGE_SPACE,
  );

  return (
    <SceneShell sceneKey={`${brand}-picker`}>
      <Brand>{brand}</Brand>
      <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-7xl flex-col pb-24 sm:pb-0">
        <header className="grid min-w-0 gap-8 pt-1 sm:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] sm:items-start">
          <div className="min-w-0 max-w-xl">
            <p className="font-qihei text-xs font-medium text-zinc-300 sm:text-sm">这些是学长学姐给自己的形容，如果你觉得符合自己可以</p>
            <p className="font-qihei mt-1 text-base font-extrabold">点击选择</p>
            <p className="font-qihei text-sm font-medium text-zinc-300">当然你也可以</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {showCustom ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    addCustom();
                  }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    autoFocus
                    value={custom}
                    maxLength={20}
                    onChange={(event) => setCustom(event.target.value)}
                    placeholder="输入你的词"
                    aria-label="新词条"
                    className="font-qihei h-12 w-44 rounded-full border-2 border-black px-5 text-base font-medium outline-none focus:ring-4 focus:ring-orange-100"
                  />
                  <button
                    type="submit"
                    disabled={!custom.trim()}
                    className="font-qihei h-12 rounded-full bg-black px-6 text-sm font-semibold text-white outline-none focus-visible:ring-4 focus-visible:ring-zinc-300"
                  >
                    放入词条池
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustom("");
                      setShowCustom(false);
                    }}
                    aria-label="取消创建词条"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-2xl font-medium text-zinc-400 outline-none hover:bg-zinc-100 hover:text-black focus-visible:ring-4 focus-visible:ring-zinc-200"
                  >
                    ×
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="font-qihei h-12 rounded-full bg-[#ff4f12] px-7 text-base font-extrabold text-white outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-orange-200 active:scale-95"
                >
                  创建词条
                </button>
              )}
              <span className="font-platform text-base font-black">{selected.length}/5</span>
            </div>

            <motion.div
              layout
              className="selected-word-strip mt-5 flex min-h-11 w-full max-w-full flex-nowrap items-start gap-2 overflow-x-auto pb-2 sm:w-max sm:max-w-none sm:overflow-visible"
              aria-label={`已选择 ${selected.length} 个词条`}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {selected.map((word) => (
                  <motion.div
                    layoutId={`${brand}-word-${word}-${selectedSources[word] ?? 0}`}
                    key={word}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={spring}
                    className="font-qihei flex h-11 shrink-0 items-center rounded-full bg-zinc-200 pl-4 text-sm font-extrabold text-zinc-600 shadow-[0_8px_24px_rgba(161,161,170,0.18)] sm:text-base"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => removeWord(word)}
                      aria-label={`取消选择 ${word}`}
                      className="ml-0.5 flex h-11 w-11 items-center justify-center rounded-full text-xl leading-none text-zinc-400 outline-none hover:bg-zinc-300 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-500"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
          <div className="pt-2 text-right sm:pt-10">
            <span className="sr-only">{title}</span>
            <motion.h1
              layoutId="question-title"
              transition={spring}
              className="font-qihei ml-auto max-w-lg text-[clamp(1.45rem,3vw,2.35rem)] font-extrabold leading-tight tracking-normal"
            >
              {subtitle}
            </motion.h1>
          </div>
        </header>

        <div
          className="relative -mx-5 my-auto min-h-[22rem] overflow-hidden py-8 sm:-mx-10 sm:min-h-[25rem]"
          aria-label="自由滚动词条池"
          style={{ height: `${poolHeight}px` }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-28" />
          <AnimatePresence initial={false}>
            {availableWords.map((word) => {
              const wordIndex = poolWords.indexOf(word);
              const duration = 15 + ((wordIndex * 5) % 13);
              const delay = -(3 + ((wordIndex * 4.25) % duration));
              const horizontalOffset = (wordIndex * 17) % 43;
              const slot = wordSlots[word] ?? 0;
              const trackTop = getWordTrackTop(slot);
              const widthClass =
                wordIndex % 3 === 0
                  ? "w-[34vw] sm:w-48"
                  : wordIndex % 3 === 1
                    ? "w-[28vw] sm:w-36"
                    : "w-[40vw] sm:w-56";
              return (
                <motion.div
                  key={word}
                  className="exhibition-word-track pointer-events-none absolute inset-0"
                  data-direction={wordIndex % 2 === 0 ? "forward" : "reverse"}
                  style={{
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {[0, 1, 2, 3].map((copyIndex) => (
                    <div
                      key={copyIndex}
                      className="absolute -translate-y-1/2 px-4 sm:px-8"
                      style={{
                        left: `${horizontalOffset + copyIndex * 50}vw`,
                        top: `${trackTop}px`,
                      }}
                    >
                      <motion.button
                        layoutId={`${brand}-word-${word}-${copyIndex}`}
                        type="button"
                        onClick={(event) => {
                          const track = event.currentTarget.closest<HTMLElement>(".exhibition-word-track");
                          if (track) track.style.animationPlayState = "paused";
                          selectWord(word, copyIndex);
                        }}
                        disabled={selected.length >= 5}
                        aria-label={`选择词条 ${word}，副本 ${copyIndex + 1}`}
                        initial={{ opacity: 0, x: 30, scale: 0.85 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -30, scale: 0.85 }}
                        whileHover={{ y: -3, scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        transition={spring}
                        className={`font-qihei pointer-events-auto h-14 shrink-0 truncate rounded-full px-5 text-base font-extrabold text-zinc-600 outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-40 sm:px-8 sm:text-lg ${widthClass} ${
                          wordIndex % 3 === 1 ? "bg-zinc-100" : "bg-zinc-200"
                        }`}
                      >
                        {word}
                      </motion.button>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-7 right-5 z-20 sm:bottom-10 sm:right-10">
        <ContinueButton onClick={onDone} label="我选好了" disabled={selected.length === 0} wide />
      </div>
    </SceneShell>
  );
}

function ResultScene({
  brand,
  words,
  onNext,
}: {
  brand: string;
  words: string[];
  onNext: () => void;
}) {
  return (
    <SceneShell sceneKey={`${brand}-result`}>
      <Brand>{brand}</Brand>
      <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-6xl flex-col items-end justify-center text-right">
        <motion.div layoutId={`word-${words[0]}`} transition={spring} className="max-w-full">
          <h1 className="break-words text-[clamp(4rem,12vw,10rem)] font-black leading-[0.84] tracking-normal text-black">
            {words[0] || "Unknown"}.adj
          </h1>
        </motion.div>
        <motion.p
          layoutId="result-label"
          transition={spring}
          className="mt-7 max-w-3xl text-sm font-medium text-black sm:text-lg"
        >
          {words.join(" · ")} · 形容词
        </motion.p>
      </div>
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 sm:bottom-10">
        <ContinueButton onClick={onNext} label="继续" />
      </div>
    </SceneShell>
  );
}

function QuestionnaireScene({
  index,
  value,
  onChange,
  onNext,
  onBack,
  saving = false,
}: {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  saving?: boolean;
}) {
  return (
    <SceneShell sceneKey={`question-${index}`}>
      <Brand>Some Questions</Brand>
      <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-5xl flex-col items-center justify-center">
        <motion.div
          layoutId="question-card"
          transition={spring}
          className="w-full max-w-2xl rounded-[2.8rem] border-[7px] border-zinc-200 bg-zinc-50 p-7 sm:p-12"
        >
          <div className="mb-7 flex items-start justify-between gap-4">
            <motion.label
              layoutId="question-label"
              htmlFor={`question-${index}`}
              className="font-qihei text-base font-extrabold leading-relaxed text-black sm:text-lg"
            >
              {QUESTIONS[index]}
            </motion.label>
            <span className="shrink-0 text-xs font-black text-zinc-300">{index + 1}/{QUESTIONS.length}</span>
          </div>
          <textarea
            id={`question-${index}`}
            value={value}
            maxLength={300}
            onChange={(event) => onChange(event.target.value)}
            placeholder="写下你的答案，也可以先跳过"
            className="font-qihei min-h-48 w-full resize-none rounded-[2rem] border-0 bg-zinc-100 p-6 text-sm font-medium leading-relaxed text-black outline-none placeholder:text-zinc-300 focus:ring-4 focus:ring-orange-100 sm:min-h-56 sm:text-base"
          />
        </motion.div>
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="h-12 rounded-full px-5 text-sm font-bold text-zinc-400 outline-none hover:text-black focus-visible:ring-2 focus-visible:ring-black"
          >
            上一题
          </button>
          <ContinueButton
            onClick={onNext}
            label={
              saving
                ? "保存中"
                : index === QUESTIONS.length - 1
                  ? "完成问卷"
                  : "下一题"
            }
            disabled={saving}
          />
        </div>
      </div>
    </SceneShell>
  );
}

function NameCardGraphic({
  form,
  editing = false,
  onChange,
}: {
  form: ProfileForm;
  editing?: boolean;
  onChange?: (form: ProfileForm) => void;
}) {
  return (
    <motion.div
      layoutId="name-card"
      transition={spring}
      className="relative aspect-[1.55/1] w-full max-w-2xl overflow-hidden rounded-[2.7rem] border-[7px] border-zinc-200 bg-zinc-50"
    >
      <div className="absolute inset-0 grid grid-cols-[0.38fr_0.62fr] items-center gap-5 p-8 sm:gap-10 sm:p-12">
        <div className="aspect-square overflow-hidden rounded-[1.5rem] border-[6px] border-zinc-200 bg-white">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.avatarUrl} alt="个人头像" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-black text-zinc-200">
              {(form.englishName || form.chineseName || form.username).slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-black">姓名:</p>
          {editing ? (
            <motion.input
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              value={form.chineseName}
              maxLength={40}
              onChange={(event) => onChange?.({ ...form, chineseName: event.target.value })}
              placeholder="你的名字"
              aria-label="姓名"
              className="font-qihei mt-1 h-10 w-full rounded-full border-2 border-transparent bg-white px-4 text-sm font-medium text-black outline-none focus:border-[#ff4f12] sm:h-12 sm:text-base"
            />
          ) : (
            <p className="mt-1 truncate rounded-full bg-zinc-100 px-4 py-2 text-sm font-black text-black">
              {form.chineseName || "你的名字"}
            </p>
          )}
          <p className="mt-5 text-xs font-black text-black">用户名:</p>
          {editing ? (
            <motion.input
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              value={form.username}
              maxLength={40}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => onChange?.({ ...form, username: event.target.value })}
              placeholder="username"
              aria-label="用户名"
              className="font-platform mt-1 h-10 w-full rounded-full border-2 border-transparent bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#ff4f12] sm:h-12 sm:text-base"
            />
          ) : (
            <p className="mt-1 truncate rounded-full bg-zinc-100 px-4 py-2 text-sm font-black text-black">
              {form.username || "你的用户名"}
            </p>
          )}
          <p className="mt-1 text-[10px] font-bold text-zinc-300">
            {editing ? "修改后将使用新用户名登录" : "自己给自己的名字"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CardInviteScene({
  form,
  onChange,
  onDone,
}: {
  form: ProfileForm;
  onChange: (form: ProfileForm) => void;
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const usernameValid = form.username.trim().length >= 2 && !/[\s/]/u.test(form.username);
  const nameValid = form.chineseName.trim().length > 0;

  return (
    <SceneShell sceneKey="card-invite">
      <Brand>Who am I ?</Brand>
      <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-5xl flex-col items-center justify-center">
        <div
          data-testid="name-card-pop"
          className={`exhibition-card-stack relative w-[82%] max-w-3xl sm:w-full ${editing ? "is-editing" : ""}`}
        >
          <div
            data-testid="name-card-bottom"
            className={`exhibition-card-bottom absolute inset-5 rounded-[3rem] bg-zinc-200 ${editing ? "is-editing" : ""}`}
          />
          <div
            data-testid="name-card-top"
            className={`exhibition-card-top relative ${editing ? "is-editing" : ""}`}
          >
            <NameCardGraphic form={form} editing={editing} onChange={onChange} />
          </div>
        </div>
        <AnimatePresence mode="wait">
          {!editing ? (
            <motion.button
              key="edit"
              layoutId="edit-card-button"
              type="button"
              onClick={() => setEditing(true)}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.72 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: reduceMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 240, damping: 14, delay: 1.52 },
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.92,
                transition: { duration: 0.18 },
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="mt-8 rounded-full bg-[#ff4f12] px-8 py-3 text-lg font-black text-white outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              编辑名片
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <ContinueButton
                onClick={() => {
                  onChange({
                    ...form,
                    username: form.username.trim(),
                    chineseName: form.chineseName.trim(),
                  });
                  onDone();
                }}
                label="我填好了"
                disabled={!usernameValid || !nameValid}
                wide
              />
              <p className="font-qihei text-xs font-medium text-zinc-300">
                姓名和用户名都需要填写 · 用户名至少 2 个字符且不能包含空格
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}

function FinalPreview({
  form,
  username,
  habitatWords,
  selfWords,
  code,
  onRestart,
}: {
  form: ProfileForm;
  username: string;
  habitatWords: string[];
  selfWords: string[];
  code: string;
  onRestart: () => void;
}) {
  return (
    <SceneShell sceneKey="final-preview">
      <Brand>My Exhibition</Brand>
      <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <motion.p layoutId="result-label" transition={spring} className="text-sm font-black uppercase tracking-[0.22em] text-[#ff4f12]">
            Design complete
          </motion.p>
          <motion.h1 layoutId="hero-title" transition={spring} className="mt-4 text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.86] tracking-[0.015em]">
            This is<br />your space.
          </motion.h1>
          <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-zinc-500">
            你的形容词、问卷与名片已经保存。这里是展览页面的第一张草图，之后还可以继续回来修改。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/u/${code}`}
              className="rounded-full bg-[#ff4f12] px-6 py-3 text-sm font-black text-white outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              查看个人主页
            </Link>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full border-2 border-black px-6 py-3 text-sm font-black outline-none transition-colors hover:bg-black hover:text-white focus-visible:ring-4 focus-visible:ring-zinc-300"
            >
              重新设计
            </button>
          </div>
        </div>
        <motion.div layoutId="exhibition-phone" transition={spring} className="mx-auto w-full max-w-sm rounded-[3rem] border-8 border-zinc-100 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="overflow-hidden rounded-[2.2rem] bg-zinc-50">
            <div className="aspect-[4/3] bg-zinc-100">
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt="个人头像" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl font-black text-zinc-200">
                  {(form.englishName || form.chineseName || username).slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="text-xs font-black text-[#ff4f12]">{habitatWords.join(" · ")}</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">{form.englishName || form.chineseName || username}</h2>
              <p className="mt-2 text-sm font-medium text-zinc-500">{form.bio || "你的第一场 MSA 展览"}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {selfWords.map((word) => (
                  <span key={word} className="rounded-full bg-black px-3 py-1.5 text-xs font-black text-white">{word}.adj</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SceneShell>
  );
}

export default function ExhibitionDesigner({ person }: ExhibitionDesignerProps) {
  const reduceMotion = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [habitatWords, setHabitatWords] = useState(person.habitatWords || []);
  const [selfWords, setSelfWords] = useState(person.selfWords || []);
  const [answers, setAnswers] = useState<Record<string, string>>(person.exhibitionAnswers || {});
  const [form, setForm] = useState<ProfileForm>({
    username: "",
    englishName: person.englishName || "",
    chineseName: "",
    grade: person.grade || "",
    bio: person.bio || "",
    avatarUrl: person.avatarUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const questionIndex =
    scene >= QUESTION_START && scene < QUESTION_END
      ? scene - QUESTION_START
      : -1;
  const progress = useMemo(() => Math.round((scene / FINAL_PREVIEW) * 100), [scene]);

  function next() {
    setScene((current) => Math.min(FINAL_PREVIEW, current + 1));
  }

  async function saveAndFinish() {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          englishName: form.englishName || null,
          chineseName: form.chineseName || null,
          grade: form.grade || null,
          bio: form.bio || null,
          avatarUrl: form.avatarUrl || null,
          habitatWords,
          selfWords,
          exhibitionAnswers: answers,
          exhibitionCompleted: true,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "保存失败，请稍后再试");
      }
      setScene(FINAL_PREVIEW);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-white text-black selection:bg-[#ff4f12] selection:text-white">
      <div className="fixed left-0 top-0 z-50 h-1 bg-zinc-100" style={{ width: "100%" }} aria-hidden="true">
        <motion.div className="h-full bg-[#ff4f12]" animate={{ width: `${progress}%` }} transition={spring} />
      </div>
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={scene}
            data-scene-transition={scene}
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: "0%" }}
            exit={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
            transition={reduceMotion ? { duration: 0.12 } : { duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0"
          >
          {scene === 0 && (
            <IntroScene
              sceneKey="opening"
              title="Your First Exhibition in MSA"
              subtitle=""
              onNext={next}
            />
          )}
          {scene === 1 && (
            <SceneShell sceneKey="path-choice">
              <Brand>Your first Exhibition in MSA</Brand>
              <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-5xl items-center gap-12 sm:grid-cols-2">
                <div className="text-center opacity-30" aria-disabled="true">
                  <h2 className="text-[clamp(2.8rem,6vw,5rem)] font-black tracking-[0.015em]">Explore</h2>
                  <p className="mt-2 text-2xl font-black">The Exhibition</p>
                  <p className="mt-5 text-sm font-bold">如果你想看看学长学姐的展览？</p>
                  <span className="mt-6 inline-block rounded-full border-2 border-zinc-300 px-4 py-2 text-xs font-black">即将开放</span>
                </div>
                <motion.button
                  layoutId="design-path"
                  type="button"
                  onClick={next}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  className="group text-center outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                >
                  <h2 className="text-[clamp(2.8rem,6vw,5rem)] font-black tracking-[0.015em]">Design</h2>
                  <p className="mt-2 text-2xl font-black">Your Exhibition</p>
                  <p className="mt-5 text-sm font-bold">设计属于自己在探月的第一个展览吧！</p>
                  <span className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4f12] text-white transition-transform group-hover:translate-y-1">
                    <ArrowIcon />
                  </span>
                </motion.button>
              </div>
            </SceneShell>
          )}
          {scene === HABITAT_INTRO && (
            <IntroScene
              sceneKey="habitat-intro"
              brand="Habitat.adj"
              title="Describe Your Habitat"
              subtitle="你会用什么词形容自己的生活环境？"
              onNext={next}
            />
          )}
          {scene === HABITAT_PICK && (
            <WordPicker
              title="Describe Your Habitat"
              subtitle="你会用什么词形容自己的生活环境？"
              brand="Habitat.adj"
              words={HABITAT_WORDS}
              selected={habitatWords}
              onSelectedChange={setHabitatWords}
              onDone={next}
            />
          )}
          {scene === HABITAT_RESULT && <ResultScene brand="Habitat.adj" words={habitatWords} onNext={next} />}
          {scene === QUESTIONS_TITLE && (
            <IntroScene sceneKey="questions-title" title="Some Questions" subtitle="一些问题" onNext={next} />
          )}
          {scene === QUESTIONNAIRE_INTRO && (
            <IntroScene
              sceneKey="questionnaire-intro"
              brand="Some Questions"
              title="The Proust Questionnaire"
              subtitle="部分普鲁斯特问卷"
              onNext={next}
            />
          )}
          {questionIndex >= 0 && (
            <QuestionnaireScene
              index={questionIndex}
              value={answers[String(questionIndex)] || ""}
              onChange={(value) => setAnswers((current) => ({ ...current, [String(questionIndex)]: value }))}
              onNext={
                questionIndex === QUESTIONS.length - 1
                  ? saveAndFinish
                  : next
              }
              onBack={() => setScene((current) => Math.max(QUESTION_START, current - 1))}
              saving={saving}
            />
          )}
          {scene === WHO_AM_I && (
            <IntroScene sceneKey="who-am-i" title="Who am I ?" subtitle="我是谁？" onNext={next} />
          )}
          {scene === CARD_INVITE && <CardInviteScene form={form} onChange={setForm} onDone={next} />}
          {scene === SELF_INTRO && (
            <IntroScene
              sceneKey="self-intro"
              brand={`${form.username}.adj`}
              title="Describe Yourself"
              subtitle="你会用什么词形容自己？"
              onNext={next}
            />
          )}
          {scene === SELF_PICK && (
            <WordPicker
              title="Describe Yourself"
              subtitle="你会用什么词形容自己？"
              brand={`${form.username}.adj`}
              words={SELF_WORDS}
              selected={selfWords}
              onSelectedChange={setSelfWords}
              onDone={next}
            />
          )}
          {scene === SELF_RESULT && (
            <SceneShell sceneKey="self-result">
              <Brand>{form.username}.adj</Brand>
              <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-6xl flex-col items-end justify-center text-right">
                <motion.div layoutId={`word-${selfWords[0]}`} transition={spring}>
                  <h1 className="text-[clamp(4rem,12vw,10rem)] font-black leading-[0.84] tracking-normal">
                    {form.username}.adj
                  </h1>
                </motion.div>
                <p className="mt-6 text-sm font-medium">{selfWords.join(" · ")} · 形容词</p>
              </div>
              <div className="fixed bottom-7 left-1/2 -translate-x-1/2 sm:bottom-10">
                <ContinueButton onClick={next} label="继续" wide />
              </div>
            </SceneShell>
          )}
          {scene === FINAL_PREVIEW && (
            <FinalPreview
              form={form}
              username={form.username}
              habitatWords={habitatWords}
              selfWords={selfWords}
              code={person.code}
              onRestart={() => setScene(0)}
            />
          )}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
      {saveError && (
        <p
          role="alert"
          className="fixed bottom-24 left-1/2 z-[60] w-[min(90vw,32rem)] -translate-x-1/2 rounded-full bg-red-50 px-5 py-3 text-center text-sm font-bold text-red-700 shadow-sm"
        >
          {saveError}
        </p>
      )}
      <span className="sr-only" role="status" aria-live="polite">设计进度 {progress}%</span>
    </main>
  );
}
