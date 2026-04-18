import type { CategoryId, Rating } from "@/lib/categories";

export interface CaseFile {
  title: string;
  serviceUser: string;
  background: string;
  history: string;
  observations: string[];
}

export interface Competency {
  id: string;
  label: string;
  category: CategoryId;
  lookFor: string;
}

export interface CompetencyScore {
  competencyId: string;
  label: string;
  status: "met" | "partial" | "not_met";
  justification: string;
}

export interface Scenario {
  id: string;
  subject: string;
  topic: string;
  description: string;
  introSpoken: string;
  questionText: string;
  caseFile: CaseFile;
  competencies: Competency[];
  casePlainText: string;
}

export interface StudentFeedback {
  rating: Rating;
  strengths: string[];
  improvements: string[];
  actionPlan: string[];
  encouragement: string;
  spokenSummary: string;
}

export interface TeacherScoreCard {
  rating: Rating;
  totalPoints: number;
  maxPoints: number;
  competencyScores: CompetencyScore[];
  overallSummary: string;
}

export interface Feedback {
  student: StudentFeedback;
  teacher: TeacherScoreCard;
}

export interface StudentIdentity {
  name: string;
  email: string;
}

export type Stage =
  | "pick"
  | "welcome"
  | "intro"
  | "ready"
  | "listening"
  | "processing"
  | "feedback";
