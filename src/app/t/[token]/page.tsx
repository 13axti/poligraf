import { notFound } from "next/navigation";
import { Deck } from "@/components/presentation/Deck";
import { normalizeData } from "@/lib/presentations";
import { sampleData, sampleTitle } from "@/lib/presentation-sample";
import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";

export const metadata = { title: "Təklif", robots: { index: false, follow: false } };

export default async function SharedPresentation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Yalnız lokal işləmədə sınaq təqdimatı (bazaya ehtiyac yoxdur)
  if (token === "demo" && process.env.NODE_ENV !== "production") {
    return <Deck title={sampleTitle} client="Nümunə müştəri" people={230} createdAt="2026-10-29T10:00:00Z" data={sampleData} />;
  }
  if (!supabaseConfigured || !/^[a-f0-9]{24}$/.test(token)) notFound();

  const { data } = await createPublicClient().rpc("get_presentation", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) notFound();

  return <Deck title={row.title} client={row.client} people={row.people} createdAt={row.created_at} data={normalizeData(row.data)} />;
}

export const instant = false;
