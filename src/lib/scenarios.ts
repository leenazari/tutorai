import type { Scenario } from "@/types";

export const SCENARIOS: Record<string, Scenario> = {
  "social-care-safeguarding-01": {
    id: "social-care-safeguarding-01",
    subject: "Social Care",
    topic: "Safeguarding, home visit",
    introSpoken:
      "Hi, welcome to today's session. You're training in social care, and I've got a home visit scenario for you. Have a look through the case brief on your right. When you're ready, tap the microphone and talk me through your concerns, what you would do in the moment, and the process you would follow from here.",
    questionText:
      "look at the home visit brief on the right. Talk me through what concerns you, what you would do right now during the visit, and the process you would follow afterward.",
    caseFile: {
      title: "Home Visit Brief",
      serviceUser: "Mrs. Edna Whitmore, 82",
      background:
        "Lives alone in her own home. Early-stage dementia diagnosed six months ago. Her son lives in Scotland and visits twice a year. No other family recorded.",
      history:
        "On your regular weekly domiciliary care caseload for the last four months. Usually cheerful, likes to chat, always offers a cup of tea.",
      observations: [
        "Her care notebook has been moved from its usual place on the sideboard.",
        "Three opened bank statement envelopes are on the kitchen table. Edna usually keeps all post in the sideboard drawer.",
        "A younger man was just leaving the house as you arrived. He introduced himself as 'her grandson, helping with errands'. Edna has never mentioned a grandson in four months.",
        "Edna is quieter than usual. When you asked how her week had been, she looked toward the door and said 'I don't want to cause a fuss'.",
        "The fridge and cupboards are almost bare. You helped stock them with a full shop last Thursday.",
      ],
    },
    competencies: [
      {
        id: "identified_concerns",
        label: "Identified safeguarding concerns",
        lookFor:
          "Spotted multiple concerning observations: financial indicators (disturbed bank statements, missing groceries), an unknown person claiming family status, behavioural change in the service user (quieter, deflective, 'don't want to cause a fuss').",
      },
      {
        id: "visit_handling",
        label: "Handled the visit appropriately",
        lookFor:
          "Chose NOT to confront or accuse the man, and NOT to lead Edna into disclosure. Kept the visit calm. Ensured Edna was physically safe before leaving. Did not alert a potential perpetrator.",
      },
      {
        id: "reporting_process",
        label: "Followed correct reporting procedure",
        lookFor:
          "Would report to line manager or safeguarding lead immediately on leaving. Would complete a safeguarding concern form. Would NOT discuss with third parties or involve family without authorisation.",
      },
      {
        id: "care_act",
        label: "Referenced Care Act 2014 safeguarding duty",
        lookFor:
          "Mentioned Care Act 2014, section 42, or the local authority's statutory safeguarding duty.",
      },
      {
        id: "mental_capacity",
        label: "Considered Mental Capacity Act",
        lookFor:
          "Raised Edna's capacity to make decisions about her own safety, given her early-stage dementia. Mentioned Mental Capacity Act, MCA, or capacity assessment.",
      },
      {
        id: "making_safeguarding_personal",
        label: "Applied Making Safeguarding Personal",
        lookFor:
          "Respected Edna's voice, wishes, and autonomy. Did not override her agency. Treated her as an active participant in her own safeguarding, not a passive subject.",
      },
      {
        id: "documentation",
        label: "Emphasised factual documentation",
        lookFor:
          "Mentioned documenting what was seen and heard, sticking to facts, avoiding assumptions, creating a clear record.",
      },
    ],
    casePlainText: `Service user: Mrs. Edna Whitmore, 82. Lives alone. Early-stage dementia. Four months of weekly domiciliary care visits.
Observations this visit:
- Care notebook moved from normal place
- 3 bank statement envelopes open on kitchen table (usually in sideboard)
- Unknown younger man leaving house on arrival, said he was "her grandson" (never previously mentioned in 4 months)
- Edna quieter than usual, said "I don't want to cause a fuss"
- Fridge and cupboards almost bare despite full shop last Thursday`,
  },
};

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS[id];
}

export function getDefaultScenario(): Scenario {
  return SCENARIOS["social-care-safeguarding-01"];
}
