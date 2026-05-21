import { Upload } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";

export default async function UploadPage() {
  await requireAuth();

  return (
    <main>
      <PageHeader title="Upload" subtitle="Statement upload comes after the trip and records loop is stable." />
      <section className="px-4">
        <div className="interactive-card rounded-lg border border-black/10 bg-white p-5 shadow-soft">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-mint">
            <Upload size={22} />
          </div>
          <h2 className="text-lg font-semibold">CSV/XLSX Upload</h2>
          <p className="mt-2 text-sm text-ink/65">
            This page is reserved for the next implementation phase: upload, column mapping, rule classification, duplicate checks, and review.
          </p>
        </div>
      </section>
    </main>
  );
}
