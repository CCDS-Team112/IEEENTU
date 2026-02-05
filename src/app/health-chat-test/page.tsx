"use client";

import { FormEvent, useState } from "react";
import { PartialHealthIntake, partialHealthIntakeResponseSchema } from "@/lib/healthIntakeSchema";
import { getCombinedQuestion, getMissingFields } from "@/lib/missingFields";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const INITIAL_BOT_MESSAGE =
  "Health intake test mode. Tell me what's going on, and I will collect any missing details.";

function mergeDraft(current: PartialHealthIntake, incoming: PartialHealthIntake): PartialHealthIntake {
  return {
    ...current,
    ...incoming,
    redFlags: {
      ...(current.redFlags ?? {}),
      ...(incoming.redFlags ?? {}),
    },
  };
}

export default function HealthChatTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "bot", text: INITIAL_BOT_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<PartialHealthIntake>({});
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [showUrgentWarning, setShowUrgentWarning] = useState(false);

  const appendBot = (text: string) => {
    setMessages((prev) => [...prev, { role: "bot", text }]);
  };

  const updateMissingPrompt = (nextDraft: PartialHealthIntake) => {
    const missing = getMissingFields(nextDraft);
    if (missing.length === 0) {
      if (!awaitingConfirm) {
        setAwaitingConfirm(true);
        appendBot("Review your intake JSON below. Type CONFIRM to submit.");
      }
      return;
    }

    setAwaitingConfirm(false);
    appendBot(getCombinedQuestion(missing));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);

    if (awaitingConfirm) {
      if (text.toUpperCase() === "CONFIRM") {
        setDraft({});
        setAwaitingConfirm(false);
        setShowUrgentWarning(false);
        setMessages([
          { role: "bot", text: "Submitted (test)." },
          { role: "bot", text: INITIAL_BOT_MESSAGE },
        ]);
      } else {
        appendBot("Type CONFIRM to submit, or continue editing details.");
      }
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/health-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText: text,
          currentDraft: draft,
          instruction: "extract missing fields, do not guess, output null/undefined if unknown",
        }),
      });

      if (!response.ok) {
        appendBot("I could not parse that safely. Please try again with any missing details.");
        updateMissingPrompt(draft);
        return;
      }

      const json = await response.json();
      const parsed = partialHealthIntakeResponseSchema.safeParse(json);

      if (!parsed.success) {
        appendBot("The model response was invalid. Please try again with any missing details.");
        updateMissingPrompt(draft);
        return;
      }

      const nextDraft = mergeDraft(draft, parsed.data.draft);
      setDraft(nextDraft);
      const redFlags = nextDraft.redFlags ?? {};
      if (Object.values(redFlags).some((value) => value === true)) {
        setShowUrgentWarning(true);
        appendBot("This could be urgent. Please seek emergency help now.");
      }
      updateMissingPrompt(nextDraft);
    } catch {
      appendBot("Something went wrong while calling the extraction API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-xl border border-border bg-background p-4">
        <h1 className="mb-4 text-xl font-semibold">Health Chat Test</h1>
        <div className="mb-4 h-[420px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {message.text}
            </div>
          ))}
          {isLoading ? (
            <div className="max-w-[85%] rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              Thinking...
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {showUrgentWarning ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            This could be urgent. Please seek emergency help now.
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-background p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Current draft
          </h2>
          <pre className="max-h-[260px] overflow-auto rounded-lg bg-muted/40 p-3 text-xs">
            {JSON.stringify(draft, null, 2)}
          </pre>
        </div>

        {awaitingConfirm ? (
          <div className="rounded-xl border border-border bg-background p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Review JSON
            </h2>
            <pre className="max-h-[260px] overflow-auto rounded-lg bg-muted/40 p-3 text-xs">
              {JSON.stringify(draft, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>
    </main>
  );
}
