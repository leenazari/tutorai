export const CATEGORIES = {
  subject_knowledge: "Subject Knowledge",
  practical_judgement: "Practical Judgement",
  process_procedure: "Process & Procedure",
  communication: "Communication",
  safeguarding_ethics: "Safeguarding & Ethics",
  professional_standards: "Professional Standards",
} as const;

export type CategoryId = keyof typeof CATEGORIES;

export const CATEGORY_IDS: CategoryId[] = Object.keys(CATEGORIES) as CategoryId[];

export const RATING_BANDS = {
  not_yet_ready: {
    label: "Not yet ready",
    min: 0,
    max: 20,
    bgLight: "bg-red-100",
    textLight: "text-red-800",
    borderLight: "border-red-200",
    bgDark: "bg-red-900/20",
    textDark: "text-red-200",
    borderDark: "border-red-800/50",
    solid: "bg-red-500",
    teacherAction: "Needs one-to-one intervention",
  },
  developing: {
    label: "Developing",
    min: 21,
    max: 40,
    bgLight: "bg-amber-100",
    textLight: "text-amber-800",
    borderLight: "border-amber-200",
    bgDark: "bg-amber-900/20",
    textDark: "text-amber-200",
    borderDark: "border-amber-800/50",
    solid: "bg-amber-500",
    teacherAction: "Needs targeted re-teaching on specific topics",
  },
  competent: {
    label: "Competent",
    min: 41,
    max: 60,
    bgLight: "bg-yellow-100",
    textLight: "text-yellow-800",
    borderLight: "border-yellow-200",
    bgDark: "bg-yellow-900/20",
    textDark: "text-yellow-200",
    borderDark: "border-yellow-800/50",
    solid: "bg-yellow-500",
    teacherAction: "Can progress, flag for monitoring",
  },
  strong: {
    label: "Strong",
    min: 61,
    max: 80,
    bgLight: "bg-blue-100",
    textLight: "text-blue-800",
    borderLight: "border-blue-200",
    bgDark: "bg-blue-900/20",
    textDark: "text-blue-200",
    borderDark: "border-blue-800/50",
    solid: "bg-blue-500",
    teacherAction: "On track, light touch support",
  },
  excellent: {
    label: "Excellent",
    min: 81,
    max: 100,
    bgLight: "bg-emerald-100",
    textLight: "text-emerald-800",
    borderLight: "border-emerald-200",
    bgDark: "bg-emerald-900/20",
    textDark: "text-emerald-200",
    borderDark: "border-emerald-800/50",
    solid: "bg-emerald-500",
    teacherAction: "Consider using as a peer example",
  },
} as const;

export type Rating = keyof typeof RATING_BANDS;

export const RATING_IDS: Rating[] = Object.keys(RATING_BANDS) as Rating[];

export function percentageToRating(pct: number): Rating {
  if (pct <= 20) return "not_yet_ready";
  if (pct <= 40) return "developing";
  if (pct <= 60) return "competent";
  if (pct <= 80) return "strong";
  return "excellent";
}
