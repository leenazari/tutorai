"use client";

import { useCallback, useEffect, useState } from "react";
import { RATING_BANDS, CATEGORIES } from "@/lib/categories";
import type { Rating, CategoryId } from "@/lib/categories";

type SessionRow = {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  scenario_id: string;
  scenario_subject: string;
  scenario_topic: string;
  rating: Rating;
  percentage: number;
  total_points: number;
  max_points: number;
  teacher_summary: string | null;
  student_answer: string;
  category_scores: Record<string, { points: number; max: number; percentage: number | null }>;
  created_at: string;
};

type CompetencyScoreRow = {
  id: string;
  competency_id: string;
  label: string;
  category: string;
  status: "met" | "partial" | "not_met";
  points: number;
  justification: string | null;
};

export default function TeacherDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null);
  const [selectedCompetencies, setSelectedCompetencies] = useState<CompetencyScoreRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSessions = useCallback(async (pw: string) => {
    setLoading(true);
    setAuthError("");
    setError("");
    try {
      const response = await fetch("/api/teacher/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (response.status === 401) {
        setAuthError("Incorrect password.");
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Request failed (" + response.status + ")");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
      setAuthed(true);
      try { sessionStorage.setItem("teacher_pw", pw); } catch (e) {}
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError("Could not load dashboard. " + message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("teacher_pw");
      if (stored) {
        setPassword(stored);
        fetchSessions(stored);
      }
    } catch (e) {}
  }, [fetchSessions]);

  const openSession = async (session: SessionRow) => {
    setSelectedSession(session);
    setSelectedCompetencies([]);
    setDetailLoading(true);
    try {
      const response = await fetch("/api/teacher/competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password, sessionId: session.id }),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setSelectedCompetencies(data.competencyScores || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedSession(null);
    setSelectedCompetencies([]);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold bg-brand">
              I
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">Teacher Dashboard</h1>
              <p className="text-xs text-slate-500">Interviewa Tutor</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-5">
            Enter the teacher password to view student sessions and scores.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") fetchSessions(password); }}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
          />
          {authError && <p className="text-red-600 text-sm mb-3">{authError}</p>}
          <button
            onClick={() => fetchSessions(password)}
            disabled={loading || !password}
            className="w-full px-5 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 bg-brand disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign in"}
          </button>
          <p className="text-xs text-slate-500 mt-5 text-center">
            <a href="/" className="underline hover:text-slate-900">Back to student view</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-brand">
            I
          </div>
          <div>
            <div className="font-display font-semibold text-slate-900 text-sm">Teacher Dashboard</div>
            <div className="text-xs text-slate-500">{sessions.length} sessions</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-900 underline">Student view</a>
          <button
            onClick={() => {
              try { sessionStorage.removeItem("teacher_pw"); } catch (e) {}
              setAuthed(false);
              setPassword("");
              setSessions([]);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-2">No sessions yet</h2>
            <p className="text-slate-600 text-sm">Once students complete sessions, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Scenario</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Score</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Rating</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Date</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => openSession(s)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{s.student_name}</div>
                      <div className="text-xs text-slate-500">{s.student_email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-900">{s.scenario_topic}</div>
                      <div className="text-xs text-slate-500">{s.scenario_subject}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{s.percentage}%</div>
                      <div className="text-xs text-slate-500">{s.total_points}/{s.max_points} points</div>
                    </td>
                    <td className="px-5 py-4">
                      <RatingPill rating={s.rating} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-xs text-brand font-semibold">View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          competencies={selectedCompetencies}
          loading={detailLoading}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}

function RatingPill(props: { rating: Rating }) {
  const band = RATING_BANDS[props.rating] ?? RATING_BANDS.developing;
  return (
    <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border " + band.bgLight + " " + band.textLight + " " + band.borderLight}>
      {band.label}
    </span>
  );
}

function SessionDetail(props: {
  session: SessionRow;
  competencies: CompetencyScoreRow[];
  loading: boolean;
  onClose: () => void;
}) {
  const session = props.session;
  const competencies = props.competencies;
  const loading = props.loading;
  const onClose = props.onClose;
  const band = RATING_BANDS[session.rating] ?? RATING_BANDS.developing;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">{session.student_name}</h2>
            <p className="text-sm text-slate-500">
              {session.student_email} - {session.scenario_subject} - {session.scenario_topic}
            </p>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium">
            Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Overall score</div>
              <div className="font-display text-3xl font-bold text-slate-900">{session.percentage}%</div>
              <div className="text-sm text-slate-500">{session.total_points}/{session.max_points} points</div>
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Rating</div>
              <RatingPill rating={session.rating} />
              <div className="text-xs text-slate-600 mt-2 italic">{band.teacherAction}</div>
            </div>
          </div>

          {session.teacher_summary && (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Teacher summary</div>
              <p className="text-slate-800 text-sm leading-relaxed">{session.teacher_summary}</p>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Category breakdown</div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORIES).map(function (entry) {
                const catId = entry[0];
                const catLabel = entry[1];
                const score = session.category_scores ? session.category_scores[catId] : undefined;
                if (!score) {
                  return (
                    <div key={catId} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{catLabel}</div>
                      <div className="text-sm text-slate-400 mt-1">Not assessed</div>
                    </div>
                  );
                }
                return (
                  <div key={catId} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{catLabel}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="font-display text-xl font-bold text-slate-900">{score.percentage}%</div>
                      <div className="text-xs text-slate-500">{score.points}/{score.max}</div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="h-full rounded-full bg-brand" style={{ width: (score.percentage || 0) + "%" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Per-competency breakdown</div>
            {loading ? (
              <p className="text-sm text-slate-500">Loading competencies...</p>
            ) : (
              <div className="space-y-2">
                {competencies.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <StatusDot status={c.status} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 text-sm">{c.label}</span>
                        <span className="text-xs text-slate-500">({CATEGORIES[c.category as CategoryId] || c.category})</span>
                      </div>
                      {c.justification && <p className="text-slate-600 text-xs leading-relaxed">{c.justification}</p>}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 whitespace-nowrap">{c.points}/2</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Student answer</div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-700 text-sm leading-relaxed italic">{session.student_answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot(props: { status: "met" | "partial" | "not_met" }) {
  if (props.status === "met") {
    return <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">+</div>;
  }
  if (props.status === "partial") {
    return <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">~</div>;
  }
  return <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">x</div>;
}
