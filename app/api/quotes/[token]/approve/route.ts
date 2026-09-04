import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status, expires_at")
    .eq("token", token.toUpperCase())
    .single();

  if (!quote) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (new Date(quote.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }
  if (quote.status !== "enviada") {
    return NextResponse.json({ error: "invalid_status" }, { status: 409 });
  }

  await supabase
    .from("quotes")
    .update({ status: "aprobada", responded_at: new Date().toISOString() })
    .eq("id", quote.id);

  await supabase
    .from("quote_events")
    .insert({ quote_id: quote.id, actor: "client", event: "approved" });

  return NextResponse.json({ ok: true });
}
