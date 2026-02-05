import { z } from "zod";

export const ageBandSchema = z.enum([
  "UNDER_3_MONTHS",
  "MONTHS_3_12",
  "YEARS_1_12",
  "YEARS_13_64",
  "AGE_65_PLUS",
]);

export const durationUnitSchema = z.enum(["HOURS", "DAYS"]);

export const severitySchema = z.enum(["MILD", "MODERATE", "SEVERE"]);

export const redFlagsSchema = z.object({
  troubleBreathing: z.boolean(),
  chestPain: z.boolean(),
  faintingOrConfusion: z.boolean(),
  severeBleeding: z.boolean(),
  strokeSigns: z.boolean(),
  severeAllergy: z.boolean(),
});

export const fullHealthIntakeSchema = z.object({
  ageBand: ageBandSchema,
  symptoms: z.array(z.string().min(1)).min(1),
  durationValue: z.number().positive(),
  durationUnit: durationUnitSchema,
  severity: severitySchema,
  redFlags: redFlagsSchema,
  freeTextNote: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const partialHealthIntakeSchema = fullHealthIntakeSchema
  .partial({
    ageBand: true,
    symptoms: true,
    durationValue: true,
    durationUnit: true,
    severity: true,
    redFlags: true,
    freeTextNote: true,
    confidence: true,
  })
  .extend({
    redFlags: redFlagsSchema.partial().optional(),
  });

export const partialHealthIntakeResponseSchema = z.object({
  draft: partialHealthIntakeSchema,
});

export type AgeBand = z.infer<typeof ageBandSchema>;
export type DurationUnit = z.infer<typeof durationUnitSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type RedFlags = z.infer<typeof redFlagsSchema>;
export type FullHealthIntake = z.infer<typeof fullHealthIntakeSchema>;
export type PartialHealthIntake = z.infer<typeof partialHealthIntakeSchema>;
