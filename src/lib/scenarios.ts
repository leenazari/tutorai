
import type { Scenario } from "@/types";

export const SCENARIOS: Record<string, Scenario> = {
  "social-care-safeguarding-01": {
    id: "social-care-safeguarding-01",
    subject: "Social Care",
    topic: "Safeguarding, home visit",
    introSpoken:
      "Hi, welcome to today's session. You're training in social care, and I've got a home visit scenario for you. Have a read through the case brief on your right. When you're ready, tap the microphone and talk me through your concerns, what you would do in the moment, and the process you would follow from here.",
    questionText:
      "Read the home visit brief on the right. Talk me through what concerns you, what you would do right now during the visit, and the process you would follow afterward.",
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
    rubric: `A strong answer should cover:

CONCERNS TO IDENTIFY:
- Potential financial abuse (disturbed bank statements, possibly missing groceries)
- An unknown individual claiming to be family (not mentioned previously in four months)
- Change in service user's behaviour (quieter, deflective, "don't want to cause a fuss" is a recognised indicator of intimidation or coercion)
- Food gone despite recent full shopping (possible theft, coercion, or control)
- Edna's vulnerability given early-stage dementia and isolation

IN THE MOMENT:
- Do NOT confront or accuse the man or mention suspicions to Edna
- Complete the visit calmly so as not to escalate or alert a potential perpetrator
- Have a gentle, open conversation to understand how Edna is feeling without leading her
- Ensure Edna is physically safe before leaving
- Document factually (what was seen and heard, not assumed)

PROCESS AFTERWARD:
- Report concerns to line manager or safeguarding lead immediately upon leaving the property
- Complete a safeguarding concern form
- Understand this falls under Care Act 2014 section 42 (safeguarding duty)
- Local authority adult safeguarding team may need to be contacted
- Police involvement if immediate risk of crime (but safeguarding lead typically decides)
- Do NOT inform third parties or other family members without authorisation
- Consider Mental Capacity Act. Does Edna have capacity to make decisions about her own safety right now?
- Apply Making Safeguarding Personal principles. Edna's voice and wishes matter

RATING GUIDE:
- Developing: spots a few concerns but may jump to confronting or miss the safeguarding procedure
- Good: identifies most concerns and follows proper reporting steps
- Excellent: covers observations, Care Act and MCA framework, Making Safeguarding Personal, AND respects Edna's autonomy`,
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
