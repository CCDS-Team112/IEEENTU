import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type AppointmentRecord = {
  id: string;
  userEmail: string;
  slotStartTime: string;
  slotEndTime: string;
  meetLink: string;
  calendarEventId: string;
  createdTime: string;
  status: "confirmed";
};

type BookingRequest = {
  email?: string;
  slotStart?: string;
  slotEnd?: string;
  summary?: string;
};

async function getGoogleAccessToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth credentials.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as { access_token?: string };
  if (!response.ok || !data.access_token) {
    throw new Error("Unable to fetch Google access token.");
  }

  return data.access_token;
}

async function createCalendarEvent(input: {
  email: string;
  slotStart: string;
  slotEnd: string;
  summary: string;
}) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("Missing GOOGLE_CALENDAR_ID.");
  }

  const accessToken = await getGoogleAccessToken();
  const requestId = crypto.randomUUID();

  const eventResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId,
    )}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "Virtual consultation",
        description: input.summary,
        start: {
          dateTime: input.slotStart,
          timeZone: "UTC",
        },
        end: {
          dateTime: input.slotEnd,
          timeZone: "UTC",
        },
        attendees: [{ email: input.email }],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );

  const eventData = (await eventResponse.json()) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: { entryPointType?: string; uri?: string }[];
    };
  };

  if (!eventResponse.ok || !eventData.id) {
    throw new Error("Google Calendar event creation failed.");
  }

  const meetLink =
    eventData.hangoutLink ??
    eventData.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video",
    )?.uri ??
    "";

  if (!meetLink) {
    throw new Error("Google Meet link missing in event response.");
  }

  return { meetLink, calendarEventId: eventData.id };
}

async function saveAppointment(record: AppointmentRecord) {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "appointments.json");

  await fs.mkdir(dataDir, { recursive: true });

  let existing: AppointmentRecord[] = [];
  try {
    const raw = await fs.readFile(filePath, "utf8");
    existing = JSON.parse(raw) as AppointmentRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  existing.push(record);
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingRequest;
    const email = body.email?.trim();
    const slotStart = body.slotStart?.trim();
    const slotEnd = body.slotEnd?.trim();
    const summary = body.summary?.trim() ?? "Symptom check summary unavailable.";

    if (!email || !slotStart || !slotEnd) {
      return NextResponse.json(
        { error: "Email and slot are required." },
        { status: 400 },
      );
    }

    const { meetLink, calendarEventId } = await createCalendarEvent({
      email,
      slotStart,
      slotEnd,
      summary,
    });

    const record: AppointmentRecord = {
      id: crypto.randomUUID(),
      userEmail: email,
      slotStartTime: slotStart,
      slotEndTime: slotEnd,
      meetLink,
      calendarEventId,
      createdTime: new Date().toISOString(),
      status: "confirmed",
    };

    await saveAppointment(record);

    return NextResponse.json({ meetLink, calendarEventId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
