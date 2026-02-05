"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";

type Slot = {
  start: string;
  end: string;
  label: string;
};

type BookingResponse = {
  meetLink: string;
  calendarEventId: string;
};

const SUMMARY_PLACEHOLDER =
  "Symptom check summary pending. Please review patient details.";

function buildSlots(count: number) {
  const slots: Slot[] = [];
  const now = new Date();
  const rounded = new Date(now);
  const nextQuarter = Math.ceil((now.getMinutes() + 1) / 15) * 15;
  rounded.setMinutes(nextQuarter, 0, 0);

  for (let i = 0; i < count; i += 1) {
    const start = new Date(rounded.getTime() + i * 15 * 60 * 1000);
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      label: `${start.toLocaleString()} - ${end.toLocaleTimeString()}`,
    });
  }

  return slots;
}

export function ContactDoctor() {
  const slots = useMemo(() => buildSlots(5), []);
  const [email, setEmail] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(slots[0]?.start ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setResult(null);

    const slot = slots.find((item) => item.start === selectedSlot);
    if (!slot) {
      setStatus("idle");
      setError("Please select an available slot.");
      return;
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          slotStart: slot.start,
          slotEnd: slot.end,
          summary: SUMMARY_PLACEHOLDER,
        }),
      });

      const data = (await response.json()) as BookingResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to book appointment.");
      }

      setResult({ meetLink: data.meetLink, calendarEventId: data.calendarEventId });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Card className="space-y-4 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Available slots</Label>
          <div className="space-y-2 text-sm">
            {slots.map((slot) => (
              <label
                key={slot.start}
                className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2"
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot.start}
                  checked={selectedSlot === slot.start}
                  onChange={() => setSelectedSlot(slot.start)}
                />
                <span>{slot.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Booking..." : "Contact doctor"}
        </Button>
      </form>

      {status === "success" && result ? (
        <Alert variant="success">
          <div className="space-y-2">
            <p className="font-medium">Appointment confirmed.</p>
            <p>
              Meet link:{" "}
              <a
                href={result.meetLink}
                className="underline-offset-4 hover:underline"
              >
                {result.meetLink}
              </a>
            </p>
          </div>
        </Alert>
      ) : null}
    </Card>
  );
}
