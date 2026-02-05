export const AGE_BANDS = [
  { value: "under_3_months", label: "Under 3 months" },
  { value: "3_to_12_months", label: "3 to 12 months" },
  { value: "1_to_12_years", label: "1 to 12 years" },
  { value: "13_to_64", label: "13 to 64" },
  { value: "65_plus", label: "65 plus" },
] as const;

export const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
] as const;

export const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Sore throat",
  "Shortness of breath",
  "Chest pain",
  "Headache",
  "Dizziness",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Abdominal pain",
  "Fatigue",
  "Body aches",
  "Back pain",
  "Joint pain",
  "Rash",
  "Swelling",
  "Burning with urination",
  "Frequent urination",
  "Blood in urine",
  "Nasal congestion",
  "Runny nose",
  "Ear pain",
  "Vision changes",
  "Anxiety",
  "Low mood",
] as const;

export const RED_FLAGS = [
  {
    key: "trouble_breathing",
    label: "Trouble breathing",
    example: "Struggling for air or breathing much faster than usual.",
  },
  {
    key: "chest_pain",
    label: "Chest pain",
    example: "Pressure, squeezing, or pain in the chest.",
  },
  {
    key: "fainting_confusion",
    label: "Fainting or confusion",
    example: "Passing out, severe confusion, or not acting normally.",
  },
  {
    key: "severe_bleeding",
    label: "Severe bleeding",
    example: "Bleeding that will not stop or soaking through bandages.",
  },
  {
    key: "one_sided_weakness",
    label: "One-sided weakness, face droop, or speech trouble",
    example: "Sudden drooping face, weak arm, or slurred speech.",
  },
  {
    key: "severe_allergic_reaction",
    label: "Severe allergic reaction signs",
    example: "Swollen lips/tongue, hives with breathing issues.",
  },
] as const;

export const DURATION_UNITS = ["hours", "days"] as const;

export type AgeBand = (typeof AGE_BANDS)[number]["value"];
export type SeverityLevel = (typeof SEVERITY_OPTIONS)[number]["value"];
export type DurationUnit = (typeof DURATION_UNITS)[number];
export type RedFlagKey = (typeof RED_FLAGS)[number]["key"];

export function createEmptyRedFlags(): Record<RedFlagKey, boolean> {
  return RED_FLAGS.reduce(
    (acc, flag) => {
      acc[flag.key] = false;
      return acc;
    },
    {} as Record<RedFlagKey, boolean>,
  );
}

export function normalizeSymptom(value: string) {
  return value.trim();
}

export function isFeverMentioned(symptoms: string[], freeText: string) {
  const text = `${symptoms.join(" ")} ${freeText}`.toLowerCase();
  return text.includes("fever") || text.includes("temperature");
}

export function findAgeBandLabel(value: string) {
  return AGE_BANDS.find((item) => item.value === value)?.label ?? value;
}

export function findSeverityLabel(value: string) {
  return SEVERITY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function redFlagLabelForKey(key: string) {
  return RED_FLAGS.find((item) => item.key === key)?.label ?? key;
}
