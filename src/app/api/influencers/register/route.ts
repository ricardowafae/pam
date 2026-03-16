import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generates a URL-safe slug from the given text.
 * Lowercases, removes accents/special chars, replaces spaces with hyphens.
 */
function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

/**
 * Generates a coupon code from a slug.
 * e.g. "camila-pet" -> "CAMILAPET"
 */
function generateCouponCode(slug: string): string {
  return slug.replace(/-/g, "").toUpperCase();
}

/**
 * POST /api/influencers/register
 * Registers a new influencer application.
 *
 * Body: { personType, name, email, phone, cpf, instagram, tiktok, slug,
 *         razaoSocial, nomeFantasia, cnpj, chavePix,
 *         cep, street, number, complement, neighborhood, city, state, bio }
 * Returns: { success: true, influencer } or { success: false, error }
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
      instagram,
      tiktok,
      slug: rawSlug,
      razaoSocial,
      nomeFantasia,
      cnpj,
      chavePix,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      bio,
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

    if (!instagram || typeof instagram !== "string") {
      return NextResponse.json(
        { success: false, error: "Instagram e obrigatorio." },
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

    // --- Generate or sanitize slug ---
    const baseName =
      personType === "PJ" ? nomeFantasia || razaoSocial || email : name || email;
    const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(baseName);

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Nao foi possivel gerar um slug valido." },
        { status: 400 }
      );
    }

    // --- Check slug uniqueness ---
    const { data: existingSlug } = await supabaseAdmin
      .from("influencers")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: `O slug "${slug}" ja esta em uso. Escolha outro.`,
        },
        { status: 409 }
      );
    }

    // --- Check email uniqueness ---
    const { data: existingEmail } = await supabaseAdmin
      .from("influencers")
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

    // --- Insert influencer ---
    const { data: influencer, error: insertError } = await supabaseAdmin
      .from("influencers")
      .insert({
        person_type: personType || "PF",
        name: name || null,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        cpf: cpf || null,
        instagram: instagram || null,
        tiktok: tiktok || null,
        slug,
        razao_social: razaoSocial || null,
        nome_fantasia: nomeFantasia || null,
        cnpj: cnpj || null,
        chave_pix: chavePix || null,
        cep: cep || null,
        street: street || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        bio: bio || null,
        status: "pendente",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Influencer insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Erro ao salvar cadastro." },
        { status: 500 }
      );
    }

    // --- Create default coupon ---
    const couponCode = generateCouponCode(slug);

    const { error: couponError } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: couponCode,
        coupon_type: "percentual",
        discount_value: 10,
        active: false,
      });

    if (couponError) {
      // Log but don't fail the registration — coupon can be created manually
      console.error("Coupon creation error:", couponError);
    }

    return NextResponse.json({
      success: true,
      influencer,
    });
  } catch (error) {
    console.error("Influencer registration error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
