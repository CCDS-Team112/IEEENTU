"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/Button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AGE_BANDS,
  COMMON_SYMPTOMS,
  DURATION_UNITS,
  RED_FLAGS,
  SEVERITY_OPTIONS,
  createEmptyRedFlags,
  findAgeBandLabel,
  findSeverityLabel,
  isFeverMentioned,
  normalizeSymptom,
  redFlagLabelForKey,
  type AgeBand,
  type DurationUnit,
  type SeverityLevel,
} from "@/features/symptom-checks/domain/constants";

type IntakeMode = "form" | "ai";

type SymptomFormValues = {
  ageBand: AgeBand | "";
  symptoms: string[];
  freeText: string;
  durationValue: string;
  durationUnit: DurationUnit;
  severity: SeverityLevel | "";
  redFlags: Record<string, boolean>;
  temperatureF: string;
  medsTaken: string;
  knownConditions: string;
  pregnancyStatus: "yes" | "no" | "not_applicable" | "";
};

type SubmissionResult = {
  id: string;
  triage: string;
  guidance: string;
};

const FORM_STEPS = ["Symptoms", "Details", "Safety", "Review"] as const;

function formatDuration(value: string, unit: DurationUnit) {
  if (!value) return "";
  return `${value} ${unit}`;
}

function summaryRow(label: string, value: string | string[] | null) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {Array.isArray(value)
          ? value.length > 0
            ? value.join(", ")
            : "Not provided"
          : value || "Not provided"}
      </p>
    </div>
  );
}

export function SymptomCheckFlow() {
  const [mode, setMode] = useState<IntakeMode>("form");
  const [screen, setScreen] = useState<"intake" | "review" | "result">("intake");
  const [formStep, setFormStep] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const form = useForm<SymptomFormValues>({
    defaultValues: {
      ageBand: "",
      symptoms: [],
      freeText: "",
      durationValue: "",
      durationUnit: "days",
      severity: "",
      redFlags: createEmptyRedFlags(),
      temperatureF: "",
      medsTaken: "",
      knownConditions: "",
      pregnancyStatus: "",
    },
    mode: "onSubmit",
  });

  const values = form.watch();

  const filteredSymptoms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COMMON_SYMPTOMS;
    return COMMON_SYMPTOMS.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const feverMentioned = isFeverMentioned(values.symptoms, values.freeText);

  const aiQuestions = useMemo(() => {
    const base = [
      {
        id: "ageBand",
        title: "Age band",
        helper: "Choose the closest age band.",
      },
      {
        id: "symptoms",
        title: "What symptoms are you having?",
        helper: "Select all that apply and add any notes.",
      },
      {
        id: "duration",
        title: "How long has this been going on?",
        helper: "Provide a duration in hours or days.",
      },
      {
        id: "severity",
        title: "How bad is it?",
        helper: "Choose mild, moderate, or severe.",
      },
      ...RED_FLAGS.map((flag) => ({
        id: `red_${flag.key}`,
        title: flag.label,
        helper: flag.example,
      })),
    ];

    if (feverMentioned) {
      base.push({
        id: "temperature",
        title: "Optional: What is the temperature?",
        helper: "If you have a reading, enter it in Fahrenheit.",
      });
    }

    return base;
  }, [feverMentioned]);

  const currentAiQuestion = aiQuestions[aiStep];

  const resetFlow = (nextMode: IntakeMode) => {
    setMode(nextMode);
    setScreen("intake");
    setFormStep(0);
    setAiStep(0);
    form.clearErrors();
  };

  const toggleSymptom = (symptom: string) => {
    const normalized = normalizeSymptom(symptom);
    const next = values.symptoms.includes(normalized)
      ? values.symptoms.filter((item) => item !== normalized)
      : [...values.symptoms, normalized];
    form.setValue("symptoms", next, { shouldValidate: true });
  };

  const updateRedFlag = (key: string, value: boolean) => {
    form.setValue(`redFlags.${key}` as const, value, { shouldValidate: true });
  };

  const triggerSymptoms = () => form.trigger(["symptoms"]);
  const triggerDetails = () =>
    form.trigger(["ageBand", "durationValue", "durationUnit", "severity"]);
  const triggerDuration = () => form.trigger(["durationValue", "durationUnit"]);
  const triggerSeverity = () => form.trigger(["severity"]);
  const triggerAgeBand = () => form.trigger(["ageBand"]);

  const nextFormStep = async () => {
    if (formStep === 0 && !(await triggerSymptoms())) return;
    if (formStep === 1 && !(await triggerDetails())) return;
    if (formStep >= 2) {
      setScreen("review");
      return;
    }
    setFormStep((prev) => prev + 1);
  };

  const prevFormStep = () => {
    setFormStep((prev) => Math.max(0, prev - 1));
    form.clearErrors();
  };

  const nextAiStep = async () => {
    if (currentAiQuestion?.id === "ageBand" && !(await triggerAgeBand())) return;
    if (currentAiQuestion?.id === "symptoms" && !(await triggerSymptoms())) return;
    if (currentAiQuestion?.id === "duration" && !(await triggerDuration())) return;
    if (currentAiQuestion?.id === "severity" && !(await triggerSeverity())) return;

    if (aiStep >= aiQuestions.length - 1) {
      setScreen("review");
      return;
    }
    setAiStep((prev) => prev + 1);
  };

  const prevAiStep = () => {
    setAiStep((prev) => Math.max(0, prev - 1));
    form.clearErrors();
  };

  const handleSubmit = form.handleSubmit(async (payload) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const response = await fetch("/api/symptom-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          ageBand: payload.ageBand,
          symptoms: payload.symptoms,
          freeText: payload.freeText,
          duration: {
            value: Number(payload.durationValue),
            unit: payload.durationUnit,
          },
          severity: payload.severity,
          redFlags: payload.redFlags,
          vitals: {
            temperatureF: payload.temperatureF
              ? Number(payload.temperatureF)
              : null,
          },
          medsTaken: payload.medsTaken,
          knownConditions: payload.knownConditions,
          pregnancyStatus: payload.pregnancyStatus,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Unable to save symptom check.");
      }

      const data = (await response.json()) as SubmissionResult;
      setResult(data);
      setScreen("result");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit symptom check.";
      form.setError("root", { message });
    } finally {
      setIsSubmitting(false);
    }
  });

  const aiOutput = {
    symptoms: values.symptoms,
    duration: {
      value: Number(values.durationValue || 0),
      unit: values.durationUnit,
    },
    severity: values.severity,
    redFlags: values.redFlags,
    suggestedVitals: feverMentioned ? ["temperature"] : [],
  };

  return (
    <Form {...form}>
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Symptom intake
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Symptom check
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Capture symptoms quickly, review them safely, and get immediate guidance.
          </p>
        </header>

        <section className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "form" ? "primary" : "outline"}
            onClick={() => resetFlow("form")}
          >
            Form intake
          </Button>
          <Button
            type="button"
            variant={mode === "ai" ? "primary" : "outline"}
            onClick={() => resetFlow("ai")}
          >
            AI assist
          </Button>
        </section>

        {screen === "intake" && mode === "form" ? (
          <Card>
            <CardTitle>{FORM_STEPS[formStep]}</CardTitle>
            <CardDescription>
              {formStep === 0 && "Choose symptoms from the list or add a note."}
              {formStep === 1 && "Add duration, severity, and optional details."}
              {formStep === 2 && "Answer quick safety checks."}
            </CardDescription>

            <div className="mt-6 space-y-6">
              {formStep === 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="symptom-search">Search symptoms</Label>
                    <Input
                      id="symptom-search"
                      placeholder="Search common symptoms"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="symptoms"
                    rules={{
                      validate: (value) =>
                        value.length > 0 || "Please select at least one symptom.",
                    }}
                    render={() => (
                      <FormItem>
                        <FormLabel>Main symptoms</FormLabel>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {filteredSymptoms.map((symptom) => (
                            <label
                              key={symptom}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm",
                                values.symptoms.includes(symptom) &&
                                  "border-primary bg-primary/10 text-foreground",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4"
                                checked={values.symptoms.includes(symptom)}
                                onChange={() => toggleSymptom(symptom)}
                              />
                              {symptom}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="freeText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add a note (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Anything else we should know?"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {formStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="ageBand"
                      rules={{
                        validate: (value) =>
                          value ? true : "Please choose an age band.",
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age band</FormLabel>
                          <FormControl>
                            <select
                              className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="" disabled>
                                Select age band
                              </option>
                              {AGE_BANDS.map((band) => (
                                <option key={band.value} value={band.value}>
                                  {band.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="durationValue"
                      rules={{
                        validate: (value) => {
                          const numeric = Number(value);
                          if (!Number.isFinite(numeric) || numeric <= 0) {
                            return "Please enter a positive duration.";
                          }
                          const unit = form.getValues("durationUnit");
                          const durationDays =
                            unit === "days" ? numeric : numeric / 24;
                          if (durationDays > 365) {
                            return "Duration should be less than 365 days.";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                placeholder="0"
                              />
                            </FormControl>
                            <FormField
                              control={form.control}
                              name="durationUnit"
                              render={({ field: unitField }) => (
                                <FormItem>
                                  <FormControl>
                                    <select
                                      className="h-10 w-32 rounded-md border border-border bg-transparent px-3 text-sm"
                                      value={unitField.value}
                                      onChange={unitField.onChange}
                                    >
                                      {DURATION_UNITS.map((unit) => (
                                        <option key={unit} value={unit}>
                                          {unit}
                                        </option>
                                      ))}
                                    </select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="severity"
                    rules={{
                      validate: (value) =>
                        value ? true : "Please choose a severity.",
                    }}
                    render={() => (
                      <FormItem>
                        <FormLabel>Severity</FormLabel>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {SEVERITY_OPTIONS.map((option) => (
                            <label
                              key={option.value}
                              className={cn(
                                "flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm",
                                values.severity === option.value &&
                                  "border-primary bg-primary/10 text-foreground",
                              )}
                            >
                              <span>{option.label}</span>
                              <input
                                type="radio"
                                name="severity"
                                checked={values.severity === option.value}
                                onChange={() =>
                                  form.setValue("severity", option.value, {
                                    shouldValidate: true,
                                  })
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {feverMentioned ? (
                    <FormField
                      control={form.control}
                      name="temperatureF"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="e.g. 101.4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="medsTaken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meds taken (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="List any meds taken"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="knownConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Known conditions (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Asthma, diabetes, etc."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pregnancyStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pregnancy status (optional)</FormLabel>
                        <FormControl>
                          <select
                            className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="not_applicable">Not applicable</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {formStep === 2 ? (
                <div className="space-y-4">
                  {RED_FLAGS.map((flag) => (
                    <FormField
                      key={flag.key}
                      control={form.control}
                      name={`redFlags.${flag.key}` as const}
                      render={() => (
                        <FormItem>
                          <div className="rounded-2xl border border-border px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {flag.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {flag.example}
                                </p>
                              </div>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={Boolean(values.redFlags[flag.key])}
                                  onChange={(event) =>
                                    updateRedFlag(flag.key, event.target.checked)
                                  }
                                />
                                Yes
                              </label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              ) : null}

              {form.formState.errors.root ? (
                <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={prevFormStep}
                disabled={formStep === 0}
              >
                Back
              </Button>
              <Button type="button" onClick={nextFormStep}>
                {formStep >= 2 ? "Review" : "Next"}
              </Button>
            </div>
          </Card>
        ) : null}

        {screen === "intake" && mode === "ai" && currentAiQuestion ? (
          <Card>
            <CardTitle>{currentAiQuestion.title}</CardTitle>
            <CardDescription>{currentAiQuestion.helper}</CardDescription>

            <div className="mt-6 space-y-6">
              {currentAiQuestion.id === "ageBand" ? (
                <FormField
                  control={form.control}
                  name="ageBand"
                  rules={{
                    validate: (value) =>
                      value ? true : "Please choose an age band.",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age band</FormLabel>
                      <FormControl>
                        <select
                          className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="" disabled>
                            Select age band
                          </option>
                          {AGE_BANDS.map((band) => (
                            <option key={band.value} value={band.value}>
                              {band.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {currentAiQuestion.id === "symptoms" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-symptom-search">Search symptoms</Label>
                    <Input
                      id="ai-symptom-search"
                      placeholder="Search common symptoms"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="symptoms"
                    rules={{
                      validate: (value) =>
                        value.length > 0 || "Please select at least one symptom.",
                    }}
                    render={() => (
                      <FormItem>
                        <FormLabel>Main symptoms</FormLabel>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {filteredSymptoms.map((symptom) => (
                            <label
                              key={symptom}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm",
                                values.symptoms.includes(symptom) &&
                                  "border-primary bg-primary/10 text-foreground",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4"
                                checked={values.symptoms.includes(symptom)}
                                onChange={() => toggleSymptom(symptom)}
                              />
                              {symptom}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="freeText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add a note (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Anything else we should know?"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {currentAiQuestion.id === "duration" ? (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="durationValue"
                    rules={{
                      validate: (value) => {
                        const numeric = Number(value);
                        if (!Number.isFinite(numeric) || numeric <= 0) {
                          return "Please enter a positive duration.";
                        }
                        const unit = form.getValues("durationUnit");
                        const durationDays =
                          unit === "days" ? numeric : numeric / 24;
                        if (durationDays > 365) {
                          return "Duration should be less than 365 days.";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="durationUnit"
                            render={({ field: unitField }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <select
                                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
                                    value={unitField.value}
                                    onChange={unitField.onChange}
                                  >
                                    {DURATION_UNITS.map((unit) => (
                                      <option key={unit} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {currentAiQuestion.id === "severity" ? (
                <FormField
                  control={form.control}
                  name="severity"
                  rules={{
                    validate: (value) =>
                      value ? true : "Please choose a severity.",
                  }}
                  render={() => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {SEVERITY_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm",
                              values.severity === option.value &&
                                "border-primary bg-primary/10 text-foreground",
                            )}
                          >
                            <span>{option.label}</span>
                            <input
                              type="radio"
                              name="ai-severity"
                              checked={values.severity === option.value}
                              onChange={() =>
                                form.setValue("severity", option.value, {
                                  shouldValidate: true,
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {currentAiQuestion.id.startsWith("red_") ? (
                <div className="rounded-2xl border border-border px-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    {currentAiQuestion.helper}
                  </p>
                  <div className="mt-3 flex gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={currentAiQuestion.id}
                        checked={
                          Boolean(
                            values.redFlags[
                              currentAiQuestion.id.replace("red_", "")
                            ],
                          )
                        }
                        onChange={() =>
                          updateRedFlag(
                            currentAiQuestion.id.replace("red_", ""),
                            true,
                          )
                        }
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={currentAiQuestion.id}
                        checked={
                          !values.redFlags[
                            currentAiQuestion.id.replace("red_", "")
                          ]
                        }
                        onChange={() =>
                          updateRedFlag(
                            currentAiQuestion.id.replace("red_", ""),
                            false,
                          )
                        }
                      />
                      No
                    </label>
                  </div>
                </div>
              ) : null}

              {currentAiQuestion.id === "temperature" ? (
                <FormField
                  control={form.control}
                  name="temperatureF"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (F)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="e.g. 101.4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : null}

              {form.formState.errors.root ? (
                <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={prevAiStep}
                disabled={aiStep === 0}
              >
                Back
              </Button>
              <Button type="button" onClick={nextAiStep}>
                {aiStep >= aiQuestions.length - 1 ? "Review" : "Next"}
              </Button>
            </div>
          </Card>
        ) : null}

        {screen === "review" ? (
          <Card>
            <CardTitle>Review your answers</CardTitle>
            <CardDescription>
              Confirm the details before we generate guidance.
            </CardDescription>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {summaryRow("Age band", findAgeBandLabel(values.ageBand))}
              {summaryRow("Main symptoms", values.symptoms)}
              {summaryRow("Free text note", values.freeText || null)}
              {summaryRow(
                "Duration",
                formatDuration(values.durationValue, values.durationUnit) || null,
              )}
              {summaryRow("Severity", findSeverityLabel(values.severity))}
              {summaryRow(
                "Red flags",
                Object.entries(values.redFlags)
                  .filter(([, value]) => value)
                  .map(([key]) => redFlagLabelForKey(key)),
              )}
              {summaryRow(
                "Temperature",
                values.temperatureF ? `${values.temperatureF} F` : null,
              )}
              {summaryRow("Meds taken", values.medsTaken || null)}
              {summaryRow("Known conditions", values.knownConditions || null)}
              {summaryRow(
                "Pregnancy status",
                values.pregnancyStatus || "Not provided",
              )}
            </div>

            {mode === "ai" ? (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  AI structured output
                </p>
                <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-muted p-4 text-xs text-muted-foreground">
                  {JSON.stringify(aiOutput, null, 2)}
                </pre>
              </div>
            ) : null}

            {form.formState.errors.root ? (
              <p className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setScreen("intake")}
              >
                Edit
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Card>
        ) : null}

        {screen === "result" && result ? (
          <Card>
            <CardTitle>Next steps</CardTitle>
            <CardDescription>
              Guidance based on your symptom check.
            </CardDescription>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Triage category
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {result.triage}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Guidance
                </p>
                <p className="mt-1 text-sm text-foreground">{result.guidance}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/health-records/symptom-checks/${result.id}`}>
                <Button type="button">View saved record</Button>
              </Link>
              <Link href="/health-records">
                <Button type="button" variant="outline">
                  Go to health records
                </Button>
              </Link>
            </div>
          </Card>
        ) : null}
      </div>
    </Form>
  );
}
