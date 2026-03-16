import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_COMMISSION_RATES,
  type CommissionRates,
} from "@/lib/commission-config";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildPhotographerEmailHtml(rates: CommissionRates): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8f4; padding: 32px; border-radius: 12px;">
      <h1 style="color: #8b5e5e; font-size: 24px; margin-bottom: 8px;">Patas, Amor e Memorias</h1>
      <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Atualizacao de valores de comissao e sessao</p>

      <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 16px;">Precos de Sessao (cobrados do cliente)</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Sessao Pocket</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.sessionPricing.pocket)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Sessao Estudio</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.sessionPricing.estudio)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Sessao Completa</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.sessionPricing.completa)}</td>
          </tr>
        </table>
      </div>

      <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 16px;">Sua Comissao por Sessao</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Sessao Pocket</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.photographer.pocket)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Sessao Estudio</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.photographer.estudio)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Sessao Completa</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.photographer.completa)}</td>
          </tr>
        </table>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
        Estes valores entram em vigor imediatamente para novas sessoes.<br/>
        Comissoes ja geradas permanecem inalteradas.
      </p>
      <p style="color: #999; font-size: 11px; text-align: center;">
        Patas, Amor e Memorias — R. Claudio Soares, 72 - Pinheiros, Sao Paulo
      </p>
    </div>
  `;
}

function buildInfluencerEmailHtml(rates: CommissionRates): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8f4; padding: 32px; border-radius: 12px;">
      <h1 style="color: #8b5e5e; font-size: 24px; margin-bottom: 8px;">Patas, Amor e Memorias</h1>
      <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Atualizacao de valores de comissao</p>

      <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 16px;">Sua Comissao por Venda</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Dogbook</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.influencer.dogbook)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Sessao Pocket</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.influencer.pocket)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; color: #666;">Sessao Estudio</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.influencer.estudio)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Sessao Completa</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5e5e;">R$ ${formatBRL(rates.influencer.completa)}</td>
          </tr>
        </table>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
        Estes valores entram em vigor imediatamente para novas vendas.<br/>
        Comissoes ja geradas permanecem inalteradas.
      </p>
      <p style="color: #999; font-size: 11px; text-align: center;">
        Patas, Amor e Memorias — R. Claudio Soares, 72 - Pinheiros, Sao Paulo
      </p>
    </div>
  `;
}

/**
 * POST /api/commissions/notify
 *
 * Sends email notifications to active photographers or influencers
 * with the current commission rates.
 *
 * Body: { type: "photographer" | "influencer" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body as { type: "photographer" | "influencer" };

    if (type !== "photographer" && type !== "influencer") {
      return NextResponse.json(
        { error: 'Body must include { type: "photographer" | "influencer" }' },
        { status: 400 }
      );
    }

    // Fetch current rates
    const { data: settingsData } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "commission_rates")
      .single();

    const stored = (settingsData?.value || {}) as Partial<CommissionRates>;
    const rates: CommissionRates = {
      influencer: { ...DEFAULT_COMMISSION_RATES.influencer, ...(stored.influencer || {}) },
      photographer: { ...DEFAULT_COMMISSION_RATES.photographer, ...(stored.photographer || {}) },
      sessionPricing: { ...DEFAULT_COMMISSION_RATES.sessionPricing, ...(stored.sessionPricing || {}) },
    };

    // Fetch active partners with emails
    let recipients: { name: string; email: string }[] = [];

    if (type === "photographer") {
      const { data, error } = await supabaseAdmin
        .from("photographers")
        .select("name, email")
        .eq("status", "ativo")
        .not("email", "is", null);

      if (error) throw error;
      recipients = (data || []).filter((r) => r.email);
    } else {
      const { data, error } = await supabaseAdmin
        .from("influencers")
        .select("name, email")
        .eq("status", "ativo")
        .not("email", "is", null);

      if (error) throw error;
      recipients = (data || []).filter((r) => r.email);
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: `Nenhum ${type === "photographer" ? "fotografo" : "influenciador"} ativo com e-mail cadastrado.` },
        { status: 400 }
      );
    }

    // Build email HTML
    const html =
      type === "photographer"
        ? buildPhotographerEmailHtml(rates)
        : buildInfluencerEmailHtml(rates);

    const subject =
      type === "photographer"
        ? "Patas, Amor e Memorias — Atualizacao de Valores de Sessao e Comissao"
        : "Patas, Amor e Memorias — Atualizacao de Valores de Comissao";

    // Try to send via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || "noreply@patasamorememorias.com.br";
    let sent = 0;

    if (resendApiKey) {
      // Send via Resend API
      for (const recipient of recipients) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [recipient.email],
              subject,
              html,
            }),
          });

          if (res.ok) {
            sent++;
          } else {
            console.error(`[notify] Failed to send to ${recipient.email}:`, await res.text());
          }
        } catch (err) {
          console.error(`[notify] Error sending to ${recipient.email}:`, err);
        }
      }
    } else {
      // No email provider — log to commission_notifications table
      console.warn("[notify] RESEND_API_KEY not configured. Logging notification to DB.");

      const { error: insertError } = await supabaseAdmin
        .from("commission_notifications")
        .insert({
          type,
          recipients: recipients.map((r) => ({ name: r.name, email: r.email })),
          rates,
          subject,
          status: "logged",
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        // Table might not exist — create it and retry
        if (insertError.code === "42P01" || insertError.message?.includes("does not exist")) {
          await supabaseAdmin.rpc("exec_sql", {
            sql: `
              CREATE TABLE IF NOT EXISTS commission_notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type TEXT NOT NULL,
                recipients JSONB NOT NULL DEFAULT '[]',
                rates JSONB NOT NULL DEFAULT '{}',
                subject TEXT,
                status TEXT DEFAULT 'logged',
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `,
          });

          await supabaseAdmin.from("commission_notifications").insert({
            type,
            recipients: recipients.map((r) => ({ name: r.name, email: r.email })),
            rates,
            subject,
            status: "logged",
            created_at: new Date().toISOString(),
          });
        } else {
          console.error("[notify] DB log error:", insertError);
        }
      }

      sent = recipients.length;
    }

    return NextResponse.json({ ok: true, sent, total: recipients.length });
  } catch (err: unknown) {
    console.error("[commissions/notify POST]", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
