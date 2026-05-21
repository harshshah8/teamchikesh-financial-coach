import { CoachChat } from "@/components/CoachChat";
import { PageHeader } from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";

export default async function CoachPage() {
  await requireAuth();
  return (
    <main>
      <PageHeader title="Coach" subtitle="Answers use database totals, not guessed numbers." />
      <CoachChat />
    </main>
  );
}
