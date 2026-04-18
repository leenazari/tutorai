"use client";

import type { Scenario } from "@/types";

type ScenarioPickerProps = {
  scenarios: Scenario[];
  onPick: (s: Scenario) => void;
};

export default function ScenarioPicker(props: ScenarioPickerProps) {
  const scenarios = props.scenarios;
  const onPick = props.onPick;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-brand">
            I
          </div>
          <div>
            <div className="font-display font-semibold text-slate-900 text-sm">
              Interviewa Tutor
            </div>
            <div className="text-xs text-slate-500">Scenario-based training</div>
          </div>
        </div>
        
          href="/teacher"
          className="text-xs text-slate-500 hover:text-slate-900 underline"
        >
          Teacher login
        </a>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-slate-900 mb-3">
              Choose a scenario
            </h1>
            <p className="text-slate-600 text-lg">
              Pick a topic to practice. You will get structured feedback on how
              you did.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scenarios.map(function (scenario) {
              return (
                <button
                  key={scenario.id}
                  onClick={function () {
                    onPick(scenario);
                  }}
                  className="group text-left bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="text-xs uppercase tracking-wider font-bold text-brand mb-3">
                    {scenario.subject}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3 leading-tight">
                    {scenario.topic}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {scenario.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand group-hover:gap-3 transition-all">
                    Start this scenario
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
