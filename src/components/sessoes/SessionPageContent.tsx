"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Check,
  Clock,
  ImageIcon,
  MapPin,
  Star,
  ShoppingBag,
} from "lucide-react";
import type { SessionData } from "./session-data";
import { useCart } from "@/hooks/useCart";
import { getPixPrice } from "@/lib/pricing-config";
import { toast } from "sonner";
import type { Product } from "@/types";

export type { SessionData };

const TAB_ITEMS = [
  { slug: "pocket", label: "Pocket" },
  { slug: "estudio", label: "Estúdio" },
  { slug: "completa", label: "Ar-livre + Estúdio" },
] as const;

const HOW_IT_WORKS = [
  "Finalize sua compra pelo site",
  "Entre em sua área logada para agendar a sessão de fotos (entraremos em contato para confirmar)",
  "Traga seu pet e divirta-se na sessão",
  "Receba suas fotos editadas em alta resolução",
];

/* ─────────── Component ─────────── */

interface Props {
  session: SessionData;
  serverInstallments: number;
  serverPixDiscountPct: number;
}

export default function SessionPageContent({ session, serverInstallments, serverPixDiscountPct }: Props) {
  const { addItem } = useCart();
  const router = useRouter();

  // Use server-side values passed as props (fetched from Supabase at render time)
  const installments = serverInstallments;
  const pixPrice = getPixPrice(session.price, serverPixDiscountPct);

  const sessionProduct: Product = {
    id: `sessao-${session.slug}`,
    name: session.title,
    slug: `sessao-${session.slug}`,
    category: "sessao",
    description: session.description,
    base_price: session.price,
    max_installments: installments,
    pix_discount_pct: serverPixDiscountPct,
    image_url: session.image,
    active: true,
    sort_order: 0,
    created_at: "",
    updated_at: "",
  };

  function handleAddToCart() {
    addItem(sessionProduct, 1);
    toast.success(`${session.title} adicionada ao carrinho!`);
  }

  function handleBuyNow() {
    addItem(sessionProduct, 1);
    router.push("/carrinho");
  }

  const installmentValue = (session.price / installments)
    .toFixed(2)
    .replace(".", ",");

  return (
    <div className="pb-0">
      {/* ─── Back link ─── */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
      </div>

      {/* ─── Session Type Tabs ─── */}
      <div className="flex justify-center gap-2 mb-8 px-4">
        {TAB_ITEMS.map((tab) => (
          <div key={tab.slug} className="relative">
            {tab.slug === "completa" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap z-10">
                Em alta
              </span>
            )}
            <Link
              href={`/sessoes/${tab.slug}`}
              className={`inline-block px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.03] active:scale-95 ${
                session.slug === tab.slug
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
            </Link>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          Product Hero (Image + Info)
          ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          {/* ── Left Column: Image + Quick Info + Give Back ── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={session.image}
                alt={session.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Quick Info Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 py-3 text-center">
                <Clock className="size-4 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground">
                  {session.duration}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 py-3 text-center">
                <ImageIcon className="size-4 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground">
                  {session.photosCount}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 py-3 text-center">
                <MapPin className="size-4 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground">
                  {session.location}
                </span>
              </div>
            </div>

            {/* Give Back Banner */}
            <div className="rounded-xl bg-gradient-to-r from-rose-50 to-rose-50/50 p-4 flex items-start gap-3">
              <Heart className="size-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground tracking-wide uppercase">
                  Give Back
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  10% do valor da sua compra é doado para instituições de
                  resgate animal
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Product Info ── */}
          <div className="space-y-5">
            {/* Badge + Title */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-1">
                {session.badge}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                {session.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {session.description}
            </p>

            {/* Price */}
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                R${" "}
                {session.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou até {installments}x de R$ {installmentValue}
              </p>
              <p className="text-sm font-medium text-green-600 mt-0.5">
                No PIX: R${" "}
                {pixPrice.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ({serverPixDiscountPct}% off)
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                className="gap-2 text-sm uppercase tracking-wide font-semibold"
                onClick={handleBuyNow}
              >
                <ShoppingCart className="size-4" />
                Comprar
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-sm uppercase tracking-wide font-semibold"
                onClick={handleAddToCart}
              >
                <Heart className="size-4" />
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* O que está incluso */}
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                O que está incluso
              </h2>
              <ul className="space-y-2.5">
                {session.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Photographer */}
            <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-4">
              <div className="relative size-12 rounded-full overflow-hidden shrink-0">
                <Image
                  src="/images/juliano-lemos.jpg"
                  alt="Juliano Lemos"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Juliano Lemos
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                </p>
                <p className="text-xs text-muted-foreground">
                  Fotógrafo Oficial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Location + How it Works
          ═══════════════════════════════════════════════════ */}
      <section className="mt-12 md:mt-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Localização */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Localização do Estúdio
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  Fração do Tempo Studio
                </p>
                <p>R. Cláudio Soares, 72 - Pinheiros</p>
                <p>São Paulo - SP, 05422-030</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Fácil acesso via metrô Faria Lima ou Oscar Freire
              </p>
            </div>

            {/* Como funciona */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Como funciona?
              </h3>
              <ol className="space-y-3">
                {HOW_IT_WORKS.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
