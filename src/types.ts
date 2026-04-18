
export interface CaseFile {
  title: string;
  serviceUser: string;
  background: string;
  history: string;
  observations: string[];
}

export interface Scenario {
  id: string;
  subject: string;
  topic: string;
  introSpoken: string;
  questionText: string;
  caseFile: CaseFile;
  rubric: string;
  casePlainText: string;
}

export interface Feedback {
  strengths: string[];
  missed: string[];
  suggestion: string;
  followUp: string;
  rating: "developing" | "good" | "excellent";
  spokenSummary: string;
}

export type Stage =
  | "welcome"
  | "intro"
  | "ready"
  | "listening"
  | "processing"
  | "feedback";
