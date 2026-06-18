import type { Scenario } from "@/types";

export const SCENARIOS: Record<string, Scenario> = {
  "social-care-safeguarding-01": {
    id: "social-care-safeguarding-01",
    subject: "Social Care",
    topic: "Safeguarding, home visit",
    description:
      "A regular domiciliary care visit reveals concerning signs. Work through your observations, a difficult moment, and the process you follow afterward.",
    introSpoken:
      "Hi, welcome to your assessment. You're training in social care, and this is a safeguarding home visit. There are three stages. I'll set the scene, then we'll work through it together. Have a look at the case brief on your right whenever you need it.",
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
    stages: [
      {
        stage: 1,
        title: "Initial response",
        openingQuestion:
          "Talk me through what concerns you about this visit, and what you would do right now, while you are still in Edna's home.",
        focus:
          "Assess whether the learner spots the safeguarding concerns and handles the visit safely without confronting the suspected perpetrator.",
      },
      {
        stage: 2,
        title: "The situation develops",
        openingQuestion:
          "As you go to leave, Edna takes your hand and says, please don't tell anyone, he's all I've got. What do you do and say?",
        focus:
          "React to what the learner said in stage one. Present the moment where Edna asks them to keep it secret. Probe how they balance her wishes against her safety, whether they consider her mental capacity, and how they communicate without making a promise they cannot keep.",
      },
      {
        stage: 3,
        title: "Process and follow-through",
        openingQuestion:
          "You have now left the house. Walk me through exactly what you do next, who you involve, and in what order.",
        focus:
          "Assess the formal process: who they report to, the safeguarding referral, the legal duty behind it, and how they document what they saw.",
      },
    ],
    competencies: [
      {
        id: "identified_concerns",
        label: "Identified safeguarding concerns",
        category: "practical_judgement",
        framework: "Care Certificate Standard 10 and Care Act 2014 s42",
        stage: 1,
        lookFor:
          "Spotted multiple concerning observations: financial indicators (disturbed bank statements, missing groceries), an unknown person claiming family status, and behavioural change in Edna (quieter, deflective).",
      },
      {
        id: "visit_handling",
        label: "Handled the visit appropriately",
        category: "practical_judgement",
        framework: "Care Certificate Standard 3, Duty of Care",
        stage: 1,
        lookFor:
          "Chose NOT to confront the man and NOT to lead Edna into disclosure. Kept the visit calm and ensured Edna was physically safe before leaving.",
      },
      {
        id: "communication_under_pressure",
        label: "Communicated with care under pressure",
        category: "communication",
        framework: "Care Certificate Standard 6, Communication",
        stage: 2,
        lookFor:
          "Reassured Edna warmly, did NOT make a promise of secrecy they cannot keep, and explained gently that they must help keep her safe.",
      },
      {
        id: "mental_capacity",
        label: "Considered Mental Capacity",
        category: "subject_knowledge",
        framework: "Mental Capacity Act 2005",
        stage: 2,
        lookFor:
          "Raised Edna's capacity to make decisions about her own safety given early-stage dementia. Ideally names the Mental Capacity Act or a capacity assessment.",
      },
      {
        id: "making_safeguarding_personal",
        label: "Applied Making Safeguarding Personal",
        category: "safeguarding_ethics",
        framework: "Care Act 2014 statutory guidance",
        stage: 2,
        lookFor:
          "Respected Edna's voice and wishes, treated her as an active participant, and did not strip her of agency while still acting on the risk.",
      },
      {
        id: "reporting_process",
        label: "Followed correct reporting procedure",
        category: "process_procedure",
        framework: "Care Certificate Standard 10 and employer policy",
        stage: 3,
        lookFor:
          "Would report to line manager or safeguarding lead immediately, complete a safeguarding concern form, and NOT involve family or third parties without authorisation.",
      },
      {
        id: "care_act",
        label: "Referenced the Care Act duty",
        category: "subject_knowledge",
        framework: "Care Act 2014 s42",
        stage: 3,
        lookFor:
          "Named the Care Act 2014, section 42, or the local authority's statutory safeguarding duty as the basis for action.",
      },
      {
        id: "documentation",
        label: "Emphasised factual documentation",
        category: "process_procedure",
        framework: "Care Certificate Standard 14, Handling Information",
        stage: 3,
        lookFor:
          "Mentioned documenting what was seen and heard factually and objectively, avoiding assumptions, and creating a clear record.",
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
      "A resident with advanced dementia becomes agitated during personal care. Handle the moment, the escalation, and what you do afterward.",
    introSpoken:
      "Hi, welcome to your assessment. You're training in social care, and this is a dementia care scenario in a care home. There are three stages. I'll set the scene, then we'll work through it together. The brief is on your right.",
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
    stages: [
      {
        stage: 1,
        title: "In the moment",
        openingQuestion:
          "Arthur has just shouted and pushed your hand away in the lounge. Talk me through what you do and say in the next few moments.",
        focus:
          "Assess immediate safety, giving space, and whether the learner understands the outburst as a symptom of dementia rather than deliberate aggression.",
      },
      {
        stage: 2,
        title: "It escalates",
        openingQuestion:
          "Arthur stands up, still distressed, and the resident next to him starts crying. How do you handle the room now?",
        focus:
          "React to the learner's stage one approach. Add the pressure of a distressed second resident and Arthur on his feet. Probe de-escalation, protecting dignity in a communal space, and calm communication.",
      },
      {
        stage: 3,
        title: "Afterwards",
        openingQuestion:
          "Arthur is settled now. Walk me through what you do after the incident, and what might have caused this change in him.",
        focus:
          "Assess reflection on underlying causes (pain, infection, medication), person-centred follow-up, documentation, and informing the team.",
      },
    ],
    competencies: [
      {
        id: "immediate_safety",
        label: "Ensured immediate safety",
        category: "practical_judgement",
        framework: "Care Certificate Standard 13, Health and Safety",
        stage: 1,
        lookFor:
          "Stepped back, gave Arthur space, stopped the task, and made sure other residents were safe.",
      },
      {
        id: "understanding_behaviour",
        label: "Understood the behaviour",
        category: "subject_knowledge",
        framework: "Care Certificate Standard 9, dementia awareness",
        stage: 1,
        lookFor:
          "Recognised the outburst as fear or confusion driven by dementia, not a personal attack or deliberate aggression.",
      },
      {
        id: "communication_approach",
        label: "Used appropriate communication",
        category: "communication",
        framework: "Care Certificate Standard 6, Communication",
        stage: 2,
        lookFor:
          "Calm tone, short simple reassuring phrases, did not argue with the accusation, got down to his level without crowding him.",
      },
      {
        id: "dignity_privacy",
        label: "Protected dignity and privacy",
        category: "safeguarding_ethics",
        framework: "Care Certificate Standard 7, Privacy and Dignity",
        stage: 2,
        lookFor:
          "Recognised personal care in a communal space is undignified, would move him somewhere private, and protected him from embarrassment in front of others.",
      },
      {
        id: "de_escalation",
        label: "De-escalated safely",
        category: "practical_judgement",
        framework: "NICE NG97, person-centred de-escalation",
        stage: 2,
        lookFor:
          "Reduced stimulation, did not restrain, gave reassurance, and managed the distressed second resident without abandoning Arthur.",
      },
      {
        id: "underlying_causes",
        label: "Considered underlying causes",
        category: "subject_knowledge",
        framework: "Care Certificate Standard 9 and NICE NG97",
        stage: 3,
        lookFor:
          "Raised possible triggers: pain, urinary infection, medication change, hunger, tiredness. A sudden change in dementia behaviour usually has a cause.",
      },
      {
        id: "person_centred",
        label: "Applied person-centred principles",
        category: "professional_standards",
        framework: "Care Certificate Standard 5, Person-Centred Care",
        stage: 3,
        lookFor:
          "Considered Arthur's routines, life history, what normally soothes him, and his care plan.",
      },
      {
        id: "reporting_documentation",
        label: "Followed reporting and documentation",
        category: "process_procedure",
        framework: "Care Certificate Standard 14, Handling Information",
        stage: 3,
        lookFor:
          "Would document the incident factually, inform senior staff, review the care plan, and consider informing family or the GP.",
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
      "A post-operative patient is deteriorating. Recognise it, respond in the moment, then escalate and reason through the cause.",
    introSpoken:
      "Hi, welcome to your assessment. You're training as a nurse, and this is a clinical deterioration scenario, modelled on the kind of station you would meet in your registration exam. There are three stages. The patient brief is on your right.",
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
        "Daniel says he is 'feeling a bit off' and that his stomach is 'really tender' now.",
        "His lips appear slightly cyanotic.",
        "NEWS2 score has jumped to 7.",
      ],
    },
    stages: [
      {
        stage: 1,
        title: "Recognise",
        openingQuestion:
          "You are at Daniel's bedside doing his ten o'clock observations. Talk me through what you are seeing and what concerns you.",
        focus:
          "Assess whether the learner recognises the cluster of abnormal observations as deterioration and understands what a NEWS2 of 7 means.",
      },
      {
        stage: 2,
        title: "Respond",
        openingQuestion:
          "You have your concerns. What do you do right now, in what order, and who do you call?",
        focus:
          "React to the learner's recognition. Probe immediate actions: staying with the patient, ABCDE assessment, basic interventions like oxygen, and escalating using SBAR. They should not leave him alone or delay escalation.",
      },
      {
        stage: 3,
        title: "Escalate and reason",
        openingQuestion:
          "The doctor asks you, over the phone, what you think is going on. What is your clinical reasoning, and what do you make sure happens next?",
        focus:
          "Assess differential reasoning (sepsis, anastomotic leak, peritonitis, bleeding), Sepsis Six awareness, and clear documentation.",
      },
    ],
    competencies: [
      {
        id: "recognise_deterioration",
        label: "Recognised signs of deterioration",
        category: "practical_judgement",
        framework: "NMC Standards of Proficiency and NEWS2",
        stage: 1,
        lookFor:
          "Identified the cluster: raised respiratory rate, tachycardia, low blood pressure, fever, cyanosis, new abdominal tenderness, as deterioration rather than one stray reading.",
      },
      {
        id: "news2_awareness",
        label: "Knew NEWS2 implications",
        category: "subject_knowledge",
        framework: "NEWS2, Royal College of Physicians",
        stage: 1,
        lookFor:
          "Understood that a NEWS2 of 7 is a high score requiring urgent clinical review, and did not dismiss any single parameter in isolation.",
      },
      {
        id: "immediate_actions",
        label: "Took appropriate immediate actions",
        category: "practical_judgement",
        framework: "NMC Code 13 and ABCDE assessment",
        stage: 2,
        lookFor:
          "Stayed with the patient, used or referenced an ABCDE assessment, began basic interventions such as oxygen and repeat monitoring.",
      },
      {
        id: "stay_and_monitor",
        label: "Kept the patient safe",
        category: "professional_standards",
        framework: "NMC Code, preserve safety",
        stage: 2,
        lookFor:
          "Did not leave Daniel unattended, arranged continuous monitoring, and did not try to manage everything alone before escalating.",
      },
      {
        id: "escalation_sbar",
        label: "Escalated correctly using SBAR",
        category: "communication",
        framework: "NMC Code 8 and 9, SBAR handover",
        stage: 2,
        lookFor:
          "Escalated immediately to the doctor or critical care outreach, and used a structured SBAR handover (Situation, Background, Assessment, Recommendation).",
      },
      {
        id: "clinical_reasoning",
        label: "Demonstrated clinical reasoning",
        category: "subject_knowledge",
        framework: "NMC Standards of Proficiency, assessment",
        stage: 3,
        lookFor:
          "Considered likely post-op differentials: sepsis, anastomotic leak, peritonitis, or bleeding, all of which are emergencies in this context.",
      },
      {
        id: "sepsis_six",
        label: "Applied Sepsis Six awareness",
        category: "subject_knowledge",
        framework: "Sepsis Six, UK Sepsis Trust",
        stage: 3,
        lookFor:
          "Referenced the Sepsis Six pathway: oxygen, blood cultures, IV antibiotics, IV fluids, lactate, and urine output monitoring within the first hour.",
      },
      {
        id: "documentation",
        label: "Emphasised clear documentation",
        category: "process_procedure",
        framework: "NMC Code 10, keep clear accurate records",
        stage: 3,
        lookFor:
          "Mentioned contemporaneous, factual, time-stamped recording of observations, actions, and the escalation.",
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
