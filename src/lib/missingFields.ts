import type { PartialHealthIntake, RedFlags } from "@/lib/healthIntakeSchema";

export const RED_FLAG_ORDER: Array<keyof RedFlags> = [
  "troubleBreathing",
  "chestPain",
  "faintingOrConfusion",
  "severeBleeding",
  "strokeSigns",
  "severeAllergy",
];

export type MissingField =
  | "ageBand"
  | "symptoms"
  | "duration"
  | "severity"
  | "redFlags";

export function getMissingFields(draft: PartialHealthIntake): MissingField[] {
  const missing: MissingField[] = [];

  if (!draft.ageBand) missing.push("ageBand");
  if (!draft.symptoms || draft.symptoms.length === 0) missing.push("symptoms");
  if (!draft.durationValue || !draft.durationUnit) missing.push("duration");
  if (!draft.severity) missing.push("severity");

  const redFlags: Partial<RedFlags> = draft.redFlags ?? {};
  const hasMissingRedFlag = RED_FLAG_ORDER.some((key) => typeof redFlags[key] !== "boolean");
  if (hasMissingRedFlag) missing.push("redFlags");

  return missing;
}

export function getCombinedQuestion(missing: MissingField[]): string {
  const prompts: Record<MissingField, string> = {
    ageBand: "Your age (number is fine).",
    symptoms: "Your main symptoms.",
    duration: "How long it has been happening (e.g., 12 hours or 3 days).",
    severity: "Severity (mild, moderate, or severe).",
    redFlags:
      "Any red flags: trouble breathing, chest pain, fainting/confusion, severe bleeding, stroke signs, severe allergy (answer yes/no for each if possible).",
  };

  const lines = missing.map((item) => `- ${prompts[item]}`);
  return `I still need the following. You can answer in one message:\n${lines.join("\n")}`;
}
