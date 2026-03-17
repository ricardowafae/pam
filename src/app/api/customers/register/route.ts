import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/customers/register
 * Registers a new customer (public, no auth required).
 *
 * Body: { personType, name, email, phone, cpf, birthDate,
 *         razaoSocial, nomeFantasia, cnpj,
 *         cep, street, number, complement, neighborhood, city, state, notes }
 * Returns: { success: true, customer } or { success: false, error }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      personType,
      name,
      email,
      phone,
      cpf,
      birthDate,
      razaoSocial,
      nomeFantasia,
      cnpj,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      notes,
    } = body;

    // --- Validate required fields ---
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email e obrigatorio." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Telefone e obrigatorio." },
        { status: 400 }
      );
    }

    if (personType === "PF") {
      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { success: false, error: "Nome e obrigatorio para Pessoa Fisica." },
          { status: 400 }
        );
      }
      if (!cpf || typeof cpf !== "string") {
        return NextResponse.json(
          { success: false, error: "CPF e obrigatorio para Pessoa Fisica." },
          { status: 400 }
        );
      }
    }

    if (personType === "PJ") {
      if (!cnpj || typeof cnpj !== "string") {
        return NextResponse.json(
          { success: false, error: "CNPJ e obrigatorio para Pessoa Juridica." },
          { status: 400 }
        );
      }
      if (!razaoSocial || typeof razaoSocial !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Razao Social e obrigatoria para Pessoa Juridica.",
          },
          { status: 400 }
        );
      }
    }

    // --- Check email uniqueness ---
    const { data: existingEmail } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Ja existe um cadastro com este email.",
        },
        { status: 409 }
      );
    }

    // --- Resolve name for PJ (name is NOT NULL in DB) ---
    const resolvedName =
      personType === "PJ" ? nomeFantasia || razaoSocial : name;

    // --- Insert customer ---
    const { data: customer, error: insertError } = await supabaseAdmin
      .from("customers")
      .insert({
        person_type: personType || "PF",
        name: resolvedName || null,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        cpf: cpf || null,
        birth_date: birthDate || null,
        cnpj: cnpj || null,
        razao_social: razaoSocial || null,
        nome_fantasia: nomeFantasia || null,
        cep: cep || null,
        street: street || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Customer insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Erro ao salvar cadastro." },
        { status: 500 }
      );
    }

    // Create a free photo session (Pocket) for the invited client
    const { error: sessionError } = await supabaseAdmin
      .from("photo_sessions")
      .insert({
        customer_id: customer.id,
        session_type: "pocket",
        status: "agendada",
        payment_status: "gratuita",
      });

    if (sessionError) {
      console.error("Error creating free session:", sessionError);
      // Don't fail registration — session can be created manually later
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer registration error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
