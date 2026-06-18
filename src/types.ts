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
  framework: string;
  stage: number;
  lookFor: string;
}

export interface ScenarioStage {
  stage: number;
  title: string;
  openingQuestion: string;
  focus: string;
}

export interface Scenario {
  id: string;
  subject: string;
  topic: string;
  description: string;
  introSpoken: string;
  caseFile: CaseFile;
  stages: ScenarioStage[];
  competencies: Competency[];
  casePlainText: string;
}

export interface CompetencyScore {
  competencyId: string;
  label: string;
  category: CategoryId;
  framework: string;
  stage: number;
  status: "met" | "partial" | "not_met";
  justification: string;
}

export interface StageScore {
  stage: number;
  title: string;
  percentage: number;
  points: number;
  max: number;
}

export interface CategoryScore {
  points: number;
  max: number;
  percentage: number | null;
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
  percentage: number;
  competencyScores: CompetencyScore[];
  stageScores: StageScore[];
  categoryScores: Record<string, CategoryScore>;
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

export interface TranscriptTurn {
  stage: number;
  title: string;
  question: string;
  answer: string;
}

export type Stage =
  | "pick"
  | "welcome"
  | "intro"
  | "ready"
  | "listening"
  | "processing"
  | "scorecard";
