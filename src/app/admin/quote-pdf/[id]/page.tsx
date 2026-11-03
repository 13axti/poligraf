import { notFound } from "next/navigation";
import { QuotePdfView } from "@/components/admin/costs/QuotePdfView";
import { requireAdmin } from "@/lib/admin-auth";
import type { QuoteLine } from "@/lib/costs";
import { getSettings } from "@/lib/settings";
import { PdfToolbar } from "./PdfToolbar";

export const metadata = { title: "Qiymət təklifi" };

export default async function QuotePdf({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: q }, site] = await Promise.all([supabase.from("quotes").select("*").eq("id", id).maybeSingle(), getSettings()]);
  if (!q) notFound();
  return <QuotePdfView q={{ ...q, lines: (q.lines ?? []) as QuoteLine[] }} site={site} toolbar={<PdfToolbar number={q.number} />} />;
}

export const instant = false;
