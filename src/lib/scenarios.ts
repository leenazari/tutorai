import type { Scenario } from "@/types";

export const SCENARIOS: Record<string, Scenario> = {
  "social-care-safeguarding-01": {
    id: "social-care-safeguarding-01",
    subject: "Social Care",
    topic: "Safeguarding, home visit",
    description:
      "A regular domiciliary care visit reveals concerning signs. Walk through your observations, immediate response, and next steps.",
    introSpoken:
      "Hi, welcome to today's session. You're training in social care, and I've got a home visit scenario for you. Have a look through the case brief on your right. When you're ready, tap the microphone and talk me through your concerns, what you would do in the moment, and the process you would follow from here.",
    questionText:
      "Look at the home visit brief on the right. Talk me through what concerns you, what you would do right now during the visit, and the process you would follow afterward.",
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
        category: "practical_judgement",
        lookFor:
          "Spotted multiple concerning observations: financial indicators (disturbed bank statements, missing groceries), an unknown person claiming family status, behavioural change in the service user (quieter, deflective, 'don't want to cause a fuss').",
      },
      {
        id: "visit_handling",
        label: "Handled the visit appropriately",
        category: "practical_judgement",
        lookFor:
          "Chose NOT to confront or accuse the man, and NOT to lead Edna into disclosure. Kept the visit calm. Ensured Edna was physically safe before leaving. Did not alert a potential perpetrator.",
      },
      {
        id: "reporting_process",
        label: "Followed correct reporting procedure",
        category: "process_procedure",
        lookFor:
          "Would report to line manager or safeguarding lead immediately on leaving. Would complete a safeguarding concern form. Would NOT discuss with third parties or involve family without authorisation.",
      },
      {
        id: "care_act",
        label: "Referenced Care Act 2014 safeguarding duty",
        category: "subject_knowledge",
        lookFor:
          "Mentioned Care Act 2014, section 42, or the local authority's statutory safeguarding duty.",
      },
      {
        id: "mental_capacity",
        label: "Considered Mental Capacity Act",
        category: "subject_knowledge",
        lookFor:
          "Raised Edna's capacity to make decisions about her own safety, given her early-stage dementia. Mentioned Mental Capacity Act, MCA, or capacity assessment.",
      },
      {
        id: "making_safeguarding_personal",
        label: "Applied Making Safeguarding Personal",
        category: "safeguarding_ethics",
        lookFor:
          "Respected Edna's voice, wishes, and autonomy. Did not override her agency. Treated her as an active participant in her own safeguarding, not a passive subject.",
      },
      {
        id: "documentation",
        label: "Emphasised factual documentation",
        category: "process_procedure",
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

  "social-care-dementia-01": {
    id: "social-care-dementia-01",
    subject: "Social Care",
    topic: "Challenging behaviour in dementia care",
    description:
      "A resident with advanced dementia suddenly becomes agitated during personal care. How do you respond in the moment and afterward?",
    introSpoken:
      "Hi, welcome to today's session. You're training in social care, and I've got a care home scenario for you about supporting a resident with dementia. Take a look at the brief on your right. When you're ready, tap the microphone and walk me through how you would handle this.",
    questionText:
      "Look at the incident brief on the right. Walk me through how you respond in the moment, what you are considering, and what you would do after the incident.",
    caseFile: {
      title: "Incident Brief",
      serviceUser: "Mr. Arthur Nesbitt, 76",
      background:
        "Lived in your care home for two years. Advanced Alzheimer's. Widowed three years ago. One daughter visits weekly. Usually quiet and compliant during personal care.",
      history:
        "You are his key worker on the morning shift. You have supported him with personal care many times without incident.",
      observations: [
        "You are helping Arthur change his jumper before lunch, in the communal lounge area.",
        "As you reach to help him pull the jumper off, he suddenly shouts 'Get off me! You're trying to rob me!' and pushes your hand away.",
        "Three other residents are sitting nearby watching. One looks distressed.",
        "Arthur's fists are clenched and his face is red. His eyes look wide and frightened rather than angry.",
        "He has not shown this behaviour before in your time working with him.",
      ],
    },
    competencies: [
      {
        id: "immediate_safety",
        label: "Ensured immediate safety",
        category: "practical_judgement",
        lookFor:
          "Stepped back, gave Arthur physical space, did not continue with the task, ensured other residents were safe and not distressed.",
      },
      {
        id: "communication_approach",
        label: "Used appropriate communication",
        category: "communication",
        lookFor:
          "Calm tone, short simple phrases, eye contact at his level, did not argue or reason with the accusation, reassured him gently.",
      },
      {
        id: "understanding_behaviour",
        label: "Understood the behaviour",
        category: "subject_knowledge",
        lookFor:
          "Recognised the outburst as a symptom of dementia (fear, confusion, pain, disorientation), not a personal attack or deliberate aggression.",
      },
      {
        id: "dignity_and_privacy",
        label: "Protected dignity and privacy",
        category: "safeguarding_ethics",
        lookFor:
          "Noted that personal care was being done in a communal space. Would move somewhere private, protected him from being embarrassed in front of other residents.",
      },
      {
        id: "person_centred_care",
        label: "Applied person-centred principles",
        category: "professional_standards",
        lookFor:
          "Considered what normally works for Arthur, his preferred routines, familiar staff, his care plan, his life history.",
      },
      {
        id: "underlying_causes",
        label: "Considered underlying causes",
        category: "practical_judgement",
        lookFor:
          "Raised possibility of pain, UTI, medication change, hunger, tiredness, recent life event. A sudden change in behaviour in dementia almost always has an underlying cause.",
      },
      {
        id: "reporting_documentation",
        label: "Followed reporting and documentation",
        category: "process_procedure",
        lookFor:
          "Would document the incident factually, inform senior staff, review the care plan with the team, consider whether family or GP should be informed.",
      },
    ],
    casePlainText: `Resident: Arthur Nesbitt, 76. Advanced Alzheimer's. Usually calm during personal care.
Incident: helping him change his jumper in communal lounge. Suddenly shouts "Get off me! You're trying to rob me!" and pushes hand away. Fists clenched, face red, eyes look frightened. Three other residents nearby, one looks distressed. First time he has shown this behaviour.`,
  },

  "nursing-deterioration-01": {
    id: "nursing-deterioration-01",
    subject: "Nursing",
    topic: "Recognising patient deterioration",
    description:
      "A post-operative patient's observations are changing rapidly. What do you see, and what do you do about it?",
    introSpoken:
      "Hi, welcome to today's session. You're training as a nurse, and I've got a clinical scenario for you. Have a good look at the patient brief on your right. When you're ready, tap the microphone and walk me through what you are seeing and how you would respond.",
    questionText:
      "Look at the patient observations on the right. Walk me through what you see, what you would do right now, and the process you would follow.",
    caseFile: {
      title: "Patient Observation Brief",
      serviceUser: "Mr. Daniel Okonkwo, 58",
      background:
        "Day two post-op following a bowel resection for colorectal cancer. Stable overnight. No previous history of cardiac or respiratory disease. Non-smoker. BMI 27.",
      history:
        "You are the nurse caring for him on the ward. Handover at 6am was unremarkable.",
      observations: [
        "It is now 10am and you are doing your observations round.",
        "Respiratory rate is 24 breaths per minute. It was 14 at 6am.",
        "Heart rate is 115 beats per minute. It was 82 at 6am.",
        "Blood pressure is 95 over 60. It was 130 over 85 at 6am.",
        "Temperature is 38.4 degrees. It was 37.1 at 6am.",
        "Daniel says he is 'feeling a bit off' and that his stomach is 'really tender' now. He did not mention this earlier.",
        "His lips appear slightly cyanotic.",
        "NEWS2 score has jumped to 7.",
      ],
    },
    competencies: [
      {
        id: "recognise_deterioration",
        label: "Recognised signs of deterioration",
        category: "practical_judgement",
        lookFor:
          "Identified tachypnoea, tachycardia, hypotension, pyrexia, cyanosis, and new abdominal tenderness as concerning signs of deterioration.",
      },
      {
        id: "news2_awareness",
        label: "Knew NEWS2 implications",
        category: "subject_knowledge",
        lookFor:
          "Understood that a NEWS2 score of 7 triggers urgent clinical review. Did not dismiss any single parameter in isolation.",
      },
      {
        id: "immediate_actions",
        label: "Took appropriate immediate actions",
        category: "practical_judgement",
        lookFor:
          "Stayed with the patient, performed or escalated to an ABCDE assessment, commenced basic interventions (oxygen, IV access, continuous monitoring), did not leave him unattended.",
      },
      {
        id: "escalation",
        label: "Escalated correctly",
        category: "communication",
        lookFor:
          "Bleeped the doctor or called the critical care outreach team. Used SBAR format for handover (Situation, Background, Assessment, Recommendation).",
      },
      {
        id: "clinical_reasoning",
        label: "Demonstrated clinical reasoning",
        category: "subject_knowledge",
        lookFor:
          "Considered likely differentials: sepsis, anastomotic leak, peritonitis, post-op bleeding. All medical emergencies in the post-op context.",
      },
      {
        id: "sepsis_six",
        label: "Applied Sepsis Six awareness",
        category: "subject_knowledge",
        lookFor:
          "Referenced the Sepsis Six pathway: oxygen, blood cultures, IV antibiotics within the first hour, IV fluids, lactate measurement, urine output monitoring.",
      },
      {
        id: "documentation",
        label: "Emphasised clear documentation",
        category: "process_procedure",
        lookFor:
          "Mentioned contemporaneous, factual documentation of observations, actions, and handover, including time-stamped entries.",
      },
    ],
    casePlainText: `Patient: Daniel Okonkwo, 58. Day 2 post-op bowel resection. Stable overnight.
Observations at 10am (6am baseline in brackets):
- Resp rate 24 (14)
- Heart rate 115 (82)
- BP 95/60 (130/85)
- Temp 38.4 (37.1)
- Patient says "feeling a bit off", stomach "really tender"
- Lips slightly cyanotic
- NEWS2 score: 7`,
  },
};

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS[id];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS);
}

export function getCompetencyCategoryMap(scenarioId: string): Record<string, string> {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return {};
  const map: Record<string, string> = {};
  for (const comp of scenario.competencies) {
    map[comp.id] = comp.category;
  }
  return map;
}
