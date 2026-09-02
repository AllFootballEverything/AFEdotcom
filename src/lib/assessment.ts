/**
 * "Are You Ready to Play Abroad?" self-assessment.
 *
 * All copy here is final AFE brand content and must stay verbatim — including
 * the intro's "15 honest questions" (the quiz has 14; the client has been told).
 *
 * Pure data and scoring only, so the same logic runs in the client dialog and
 * in the server route that records a lead. No React, no side effects.
 */

export type CategoryKey =
  | "competitive"
  | "independence"
  | "resilience"
  | "adaptability";

export type Question = {
  /** SCHABO uppercase question text. */
  text: string;
  /** Optional italic clarifier under the question. */
  sub?: string;
};

/** Question order is the scoring index — do not reorder without updating CATEGORIES. */
export const QUESTIONS: Question[] = [
  {
    text: "How confident are you in competing with players who are just as hungry, or hungrier, for your spot?",
    sub: "For example: you are amongst three other trialists fighting for one spot.",
  },
  {
    text: "Do you have the discipline to train on your own consistently without external pressure?",
    sub: "Think about how many days a week you get extra work in, honestly.",
  },
  {
    text: "How comfortable are you living far from family, friends, and your comfort zone for long periods of time?",
  },
  {
    text: "Can you manage loneliness and bounce back when things get tough emotionally?",
    sub: "Do you feel homesick, or do you just miss home? There's a big difference.",
  },
  {
    text: "How comfortable can you be if you don't fully speak the local language?",
  },
  {
    text: "Do you know how to cook healthy meals and manage your nutrition independently?",
  },
  {
    text: "Are you good with your money? Can you manage your finances responsibly (budgeting, saving, handling contracts)?",
  },
  {
    text: "Are you prepared to handle the instability of short-term contracts and sudden moves?",
  },
  {
    text: "When setbacks happen (injuries, being benched, culture shock), can you manage your mental?",
  },
  {
    text: "Do you thrive under the pressure of “make it or go home” situations?",
  },
  {
    text: "Are you willing to sacrifice comfort (living standard, social life, home routines) for the chance to play abroad?",
  },
  {
    text: "Do you see yourself as a student of the game, willing to learn new cultures, languages, and styles of play?",
    sub: "How willing are you to adapt to where you are?",
  },
  {
    text: "Can you keep your emotions steady, not too high on the highs, not too low on the lows?",
    sub: "How balanced are you?",
  },
  {
    text: "Is your motivation to play abroad rooted in passion for growth, not just the idea of the dream of “professional life”?",
  },
];

export const ANSWER_LABELS = [
  "Not at all",
  "Barely",
  "Somewhat",
  "Mostly",
  "100% ready",
] as const;

/**
 * Category → the question indices that feed it. Order matters: ties in the
 * archetype resolve to the first category listed here.
 */
export const CATEGORIES: {
  key: CategoryKey;
  label: string;
  questions: number[];
}[] = [
  { key: "competitive", label: "COMPETITIVE EDGE", questions: [0, 9] },
  { key: "independence", label: "INDEPENDENCE", questions: [1, 5, 6] },
  { key: "resilience", label: "RESILIENCE", questions: [2, 3, 8, 12] },
  {
    key: "adaptability",
    label: "ADAPTABILITY & MINDSET",
    questions: [4, 7, 10, 11, 13],
  },
];

export const ARCHETYPES: Record<
  CategoryKey,
  { name: string; tagline: string; copy: string }
> = {
  competitive: {
    name: "THE COMPETITOR",
    tagline: "You show up to win the spot, not just fill it.",
    copy: "Pressure doesn't shrink you, it sharpens you. You're wired to compete for your place, even when the odds and the room are stacked against you. That edge is rare, and it's the first thing scouts notice.",
  },
  independence: {
    name: "THE SELF-STARTER",
    tagline: "You don't need someone watching to put in the work.",
    copy: "Discipline isn't a problem for you, it's a habit. You train, eat, and manage your life like someone who already knows what it takes. That independence is exactly what gets tested the moment you're on your own abroad.",
  },
  resilience: {
    name: "THE STEADY ONE",
    tagline: "You don't spiral when things get hard. You adjust.",
    copy: "Loneliness, setbacks, distance from home, none of it knocks you off course for long. You've got the emotional footing that a lot of players don't figure out until it's too late.",
  },
  adaptability: {
    name: "THE ADAPTER",
    tagline: "New language, new culture, new style of play. You lean in.",
    copy: "You treat every unfamiliar situation as something to learn from, not survive. That mindset is what actually separates the players who settle in abroad from the ones who spend two years fighting the culture instead of the competition.",
  },
};

export const COPY = {
  eyebrow: "// SELF-ASSESSMENT",
  ctaHeadline: "Are you ready to play abroad?",
  ctaHeadlineAccent: "play abroad?",
  ctaSub:
    "15 honest questions. On the pitch, off the pitch, and in your head. Answer truthfully and we'll show you exactly where you stand.",
  ctaButton: "TAKE THE ASSESSMENT →",
  introHeadline: "ARE YOU READY TO PLAY ABROAD?",
  introParagraph:
    "15 honest questions. On the pitch, off the pitch, and in your head. Answer truthfully and we'll show you exactly where you stand, and what AFE can do for you, your current situation, and the next.",
  introNote:
    "This is a self-assessment, not a verdict. It won't make or break your next opportunity. This is for us to get to know you, just as much as it's for you. Take this as a mirror, not a judge.",
  introButton: "START THE ASSESSMENT",
  emailIntro:
    "Enter your email and we'll send your full results, plus the Playing Abroad Toolkit with checklists and first-90-day tips.",
  emailPlaceholder: "your@email.com",
  emailButton: "SEND MY RESULTS",
  confirmation:
    "You're in. Check your inbox, we're sending your full breakdown and the Playing Abroad Toolkit now.",
} as const;

export const TOTAL_QUESTIONS = QUESTIONS.length;

export type CategoryScore = { key: CategoryKey; label: string; pct: number };

/** pct = round(sum / (count × 5) × 100), per the design's scoring rule. */
export function scoreCategories(answers: number[]): CategoryScore[] {
  return CATEGORIES.map(({ key, label, questions }) => {
    const sum = questions.reduce((total, i) => total + (answers[i] || 0), 0);
    const pct = Math.round((sum / (questions.length * 5)) * 100);
    return { key, label, pct };
  });
}

/** Highest category wins; ties resolve to CATEGORIES order (first listed). */
export function resolveArchetype(scores: CategoryScore[]): CategoryKey {
  return scores.reduce((best, s) => (s.pct > best.pct ? s : best)).key;
}
