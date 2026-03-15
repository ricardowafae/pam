import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import InfluencerLandingClient from "./InfluencerLandingClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Props = {
  params: Promise<{ slug: string }>;
};

async function getInfluencerBySlug(slug: string) {
  const { data: influencer } = await supabaseAdmin
    .from("influencers")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .eq("status", "ativo")
    .single();

  if (!influencer) return null;

  // Fetch linked coupon by convention: code = slug without hyphens, uppercased
  const expectedCode = slug.replace(/-/g, "").toUpperCase();
  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("code, discount_value, coupon_type")
    .eq("code", expectedCode)
    .eq("active", true)
    .single();

  return {
    id: influencer.id,
    name: influencer.name,
    slug: influencer.slug,
    couponCode: coupon?.code ?? "",
    discountValue: coupon?.discount_value ?? 0,
    discountType: coupon?.coupon_type ?? "percentual",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const influencer = await getInfluencerBySlug(slug);

  if (!influencer) {
    return { title: "Influenciador nao encontrado" };
  }

  return {
    title: `Indicado por ${influencer.name} - Patas, Amor e Memorias`,
    description: `Dogbooks e sessoes fotograficas para eternizar os melhores momentos com seu pet. Indicacao especial de ${influencer.name}.`,
    openGraph: {
      title: `Patas, Amor e Memorias - Indicado por ${influencer.name}`,
      description: `Fotolivros artesanais e sessoes fotograficas pet. Indicacao de ${influencer.name}.`,
      url: `https://patasamorememorias.com.br/p/${slug}`,
    },
  };
}

export default async function InfluencerLandingPage({ params }: Props) {
  const { slug } = await params;
  const influencer = await getInfluencerBySlug(slug);

  if (!influencer) {
    notFound();
  }

  return (
    <InfluencerLandingClient
      slug={influencer.slug}
      name={influencer.name}
      couponCode={influencer.couponCode}
      discountValue={influencer.discountValue}
      discountType={influencer.discountType}
    />
  );
}
