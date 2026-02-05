import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  partialHealthIntakeResponseSchema,
  partialHealthIntakeSchema,
} from "@/lib/healthIntakeSchema";

const requestSchema = z.object({
  userText: z.string().min(1),
  currentDraft: partialHealthIntakeSchema.default({}),
  instruction: z.string().optional(),
});

function stripNulls(value: unknown): unknown {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map(stripNulls).filter((item) => item !== undefined);
  if (typeof value !== "object" || value === undefined) return value;

  const next: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value)) {
    const parsed = stripNulls(field);
    if (parsed !== undefined) next[key] = parsed;
  }
  return next;
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return trimmed;
}

function normalizeDraftPayload(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;

  const payload = value as Record<string, unknown>;
  const draft = payload.draft;
  if (typeof draft !== "string") return value;

  try {
    return { ...payload, draft: JSON.parse(extractJsonText(draft)) };
  } catch {
    return { ...payload, draft: {} };
  }
}

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = JSON.stringify(
      {
        system:
          'Return JSON only with this shape: {"draft": {...}}. Extract only what the user explicitly states. Do not guess. Normalize to allowed enums. If nothing can be extracted, return {"draft": {}}. If the user provides a numeric age (e.g., "17"), map to ageBand by ranges: <3 months => UNDER_3_MONTHS, 3-12 months => MONTHS_3_12, 1-12 years => YEARS_1_12, 13-64 years => YEARS_13_64, 65+ years => AGE_65_PLUS. If the user says "no red flags" or answers "no" when asked about red flags, set all redFlags fields to false.',
        allowedEnums: {
          ageBand: [
            "UNDER_3_MONTHS",
            "MONTHS_3_12",
            "YEARS_1_12",
            "YEARS_13_64",
            "AGE_65_PLUS",
          ],
          durationUnit: ["HOURS", "DAYS"],
          severity: ["MILD", "MODERATE", "SEVERE"],
        },
        examples: [
          {
            userText: "17, 3 days, severe, no",
            output: {
              draft: {
                ageBand: "YEARS_13_64",
                durationValue: 3,
                durationUnit: "DAYS",
                severity: "SEVERE",
                redFlags: {
                  troubleBreathing: false,
                  chestPain: false,
                  faintingOrConfusion: false,
                  severeBleeding: false,
                  strokeSigns: false,
                  severeAllergy: false,
                },
              },
            },
          },
          {
            userText: "fever and cough for 12 hours, mild",
            output: {
              draft: {
                symptoms: ["fever", "cough"],
                durationValue: 12,
                durationUnit: "HOURS",
                severity: "MILD",
              },
            },
          },
        ],
        instruction: input.instruction,
        currentDraft: input.currentDraft,
        userText: input.userText,
      },
      null,
      2,
    );
    const completion = await model.generateContent(prompt);

    const content = completion.response.text();
    if (!content) {
      return Response.json({ error: "No model output." }, { status: 502 });
    }

    const jsonText = extractJsonText(content);
    const parsed = JSON.parse(jsonText);
    const normalized = stripNulls(normalizeDraftPayload(parsed));
    const validated = partialHealthIntakeResponseSchema.safeParse(normalized);

    if (!validated.success) {
      return Response.json(
        { error: "Model output validation failed." },
        { status: 422 },
      );
    }

    return Response.json(validated.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request payload." }, { status: 400 });
    }

    if (error instanceof Error && (error.message.includes("429") || error.message.toLowerCase().includes("quota"))) {
      return Response.json(
        { error: "Gemini quota exceeded or unavailable for this API key.", details: error.message },
        { status: 429 },
      );
    }

    return Response.json(
      { error: "Failed to extract intake fields." },
      { status: 500 },
    );
  }
}
