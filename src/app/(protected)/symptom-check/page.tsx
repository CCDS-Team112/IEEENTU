import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/application/getSession";
import { SymptomCheckFlow } from "@/features/symptom-checks/ui/SymptomCheckFlow";

export default async function SymptomCheckPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <SymptomCheckFlow />;
}
