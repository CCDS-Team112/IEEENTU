import { MongoClient } from "mongodb";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "health_records";

if (!uri) {
  console.error("Missing MONGODB_URI in environment.");
  process.exit(1);
}

const shouldReset = process.argv.includes("--reset");

const client = new MongoClient(uri);

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function ensureCollections(db) {
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  const required = ["symptom_checks", "doctor_records", "appointments"];
  for (const name of required) {
    if (!existing.has(name)) {
      await db.createCollection(name);
    }
  }
}

async function resetCollections(db) {
  await Promise.all([
    db.collection("symptom_checks").deleteMany({ user_id: { $in: ["user", "admin", "doctor"] } }),
    db.collection("doctor_records").deleteMany({ user_id: { $in: ["user", "admin", "doctor"] } }),
    db.collection("appointments").deleteMany({ user_id: { $in: ["user", "admin", "doctor"] } }),
  ]);
}

async function seed() {
  await client.connect();
  const db = client.db(dbName);

  await ensureCollections(db);
  if (shouldReset) {
    await resetCollections(db);
  }

  const symptomChecks = db.collection("symptom_checks");
  const doctorRecords = db.collection("doctor_records");
  const appointments = db.collection("appointments");

  await symptomChecks.insertMany([
    {
      user_id: "user",
      date: daysAgo(1),
      top_symptoms: ["Headache", "Fatigue"],
      triage_level: "self-care",
      answers: { duration: "2 days", severity: "moderate" },
      red_flags: [],
      guidance: "Rest and hydrate. Monitor symptoms.",
      ai_summary: "Likely tension-related headache and mild fatigue.",
      created_at: daysAgo(1),
    },
    {
      user_id: "user",
      date: daysAgo(7),
      top_symptoms: ["Cough", "Sore throat"],
      triage_level: "primary-care",
      answers: { duration: "5 days", fever: "no" },
      red_flags: ["Shortness of breath"],
      guidance: "Consider a primary care visit if symptoms persist.",
      ai_summary: "Upper respiratory symptoms with a mild red flag.",
      created_at: daysAgo(7),
    },
  ]);

  await doctorRecords.insertMany([
    {
      user_id: "user",
      visit_date: daysAgo(3),
      doctor_name: "Dr. Nguyen",
      visit_type: "Virtual consult",
      diagnosis_note: "Seasonal allergy flare",
      plan: "Daily antihistamine for 2 weeks",
      prescriptions: ["Cetirizine 10mg"],
      attachments: ["visit-summary.pdf"],
      created_at: daysAgo(3),
    },
    {
      user_id: "user",
      visit_date: daysAgo(14),
      doctor_name: "Dr. Patel",
      visit_type: "In-person",
      diagnosis_note: "Mild dehydration",
      plan: "Increase fluids and rest",
      prescriptions: [],
      attachments: [],
      created_at: daysAgo(14),
    },
  ]);

  await appointments.insertMany([
    {
      user_id: "user",
      date_time: daysAgo(2),
      status: "completed",
      join_url: "https://meet.google.com/abc-defg-hij",
      notes: "Discussed allergy management.",
      created_at: daysAgo(2),
    },
    {
      user_id: "user",
      date_time: daysAgo(-2),
      status: "upcoming",
      join_url: "https://meet.google.com/xyz-uvwx-rst",
      notes: "Follow-up on headaches.",
      created_at: daysAgo(0),
    },
  ]);

  console.log("Seeded health records for user_id: user");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
