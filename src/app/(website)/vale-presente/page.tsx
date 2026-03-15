"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Gift,
  Heart,
  Sparkles,
  Star,
  ArrowLeft,
  Clock,
  Check,
  Tag,
  ShieldCheck,
  Ban,
  Users,
  MessageCircle,
  Minus,
  Plus,
  Store,
  Home,
  Gem,
  PartyPopper,
  Briefcase,
  CalendarHeart,
  ShoppingBag,
} from "lucide-react";

/* ─────────── Types ─────────── */

interface VoucherOption {
  label: string;
  value: number;
  isFullDiscount?: boolean;
  /** For full-discount options, the full price of the product */
  fullPrice?: number;
}

interface ProductCard {
  id: string;
  title: string;
  description: string;
  image: string;
  options: VoucherOption[];
  discounts: { min: number; off: number; label: string }[];
}

/* ─────────── Data ─────────── */

const WHY_CARDS = [
  {
    icon: Sparkles,
    title: "Experiência Única",
    description:
      "Cada sessão é personalizada — cenários, temas e cuidados pensados para o pet brilhar.",
  },
  {
    icon: Heart,
    title: "Memórias Eternas",
    description:
      "Fotos profissionais e álbuns artísticos que contam a história de amor entre tutor e pet.",
  },
  {
    icon: Gift,
    title: "Presente Inesquecível",
    description:
      "O tipo de presente que emociona, surpreende e fica guardado para sempre no coração.",
  },
];

const INSPIRATION_CARDS = [
  {
    icon: Store,
    title: "Pet Shops & Veterinárias",
    description:
      "Surpreenda seus melhores clientes com um presente inesquecível. Ideal para fidelizar tutores que frequentam seu estabelecimento.",
  },
  {
    icon: Home,
    title: "Presente em Família",
    description:
      "O marido que deseja surpreender a família com uma sessão fotográfica memorável do pet que todos amam.",
  },
  {
    icon: Gem,
    title: "Noivos & Casais",
    description:
      "Presenteie sua noiva, namorada ou parceiro com uma experiência única — eternizar o pet que faz parte da história do casal.",
  },
  {
    icon: Users,
    title: "Amigos & Familiares",
    description:
      "Conhece alguém apaixonado pelo seu pet? Dê o presente mais emocionante que um tutor pode receber.",
  },
  {
    icon: Briefcase,
    title: "Presentes Corporativos",
    description:
      "Empresas que desejam presentear colaboradores, parceiros ou clientes com algo verdadeiramente original e afetivo.",
  },
  {
    icon: CalendarHeart,
    title: "Datas Especiais",
    description:
      'Aniversários, Natal, Dia dos Namorados ou simplesmente "porque eu te amo" — o vale presente perfeito para qualquer ocasião.',
  },
];

const PRODUCTS: ProductCard[] = [
  {
    id: "dogbook",
    title: "Dogbook",
    description:
      "O álbum personalizado que eterniza os momentos mais especiais do pet em páginas de pura arte.",
    image: "/images/dogbook-cover-closed.jpg",
    options: [
      { label: "R$ 50,00", value: 50 },
      { label: "R$ 100,00", value: 100 },
      { label: "R$ 200,00", value: 200 },
      { label: "100% OFF", value: 490, isFullDiscount: true, fullPrice: 490 },
    ],
    discounts: [
      { min: 5, off: 10, label: "5+ unid. → 10% OFF" },
      { min: 10, off: 15, label: "10+ unid. → 15% OFF" },
      { min: 25, off: 17.5, label: "25+ unid. → 17.5% OFF" },
      { min: 50, off: 20, label: "50+ unid. → 20% OFF" },
    ],
  },
  {
    id: "pocket",
    title: "Sessão Pocket",
    description:
      "Uma sessão fotográfica rápida e encantadora, perfeita para capturar a essência do pet.",
    image: "/images/session-pocket.jpg",
    options: [
      { label: "R$ 100,00", value: 100 },
      { label: "R$ 200,00", value: 200 },
      { label: "R$ 300,00", value: 300 },
      { label: "100% OFF", value: 900, isFullDiscount: true, fullPrice: 900 },
    ],
    discounts: [
      { min: 5, off: 10, label: "5+ unid. → 10% OFF" },
      { min: 10, off: 15, label: "10+ unid. → 15% OFF" },
      { min: 25, off: 17.5, label: "25+ unid. → 17.5% OFF" },
      { min: 50, off: 20, label: "50+ unid. → 20% OFF" },
    ],
  },
  {
    id: "estudio",
    title: "Sessão Estúdio",
    description:
      "Sessão em estúdio profissional com cenários e iluminação controlada para fotos deslumbrantes.",
    image: "/images/session-estudio.jpg",
    options: [
      { label: "R$ 200,00", value: 200 },
      { label: "R$ 500,00", value: 500 },
      { label: "R$ 900,00", value: 900 },
      { label: "100% OFF", value: 3700, isFullDiscount: true, fullPrice: 3700 },
    ],
    discounts: [
      { min: 5, off: 10, label: "5+ unid. → 10% OFF" },
      { min: 10, off: 15, label: "10+ unid. → 15% OFF" },
      { min: 25, off: 20, label: "25+ unid. → 20% OFF" },
      { min: 50, off: 25, label: "50+ unid. → 25% OFF" },
    ],
  },
  {
    id: "completa",
    title: "Sessão Completa",
    description:
      "A experiência completa: estúdio + externas, com produção artística e entrega premium.",
    image: "/images/session-completa.jpg",
    options: [
      { label: "R$ 400,00", value: 400 },
      { label: "R$ 800,00", value: 800 },
      { label: "R$ 1200,00", value: 1200 },
      { label: "100% OFF", value: 4900, isFullDiscount: true, fullPrice: 4900 },
    ],
    discounts: [
      { min: 5, off: 10, label: "5+ unid. → 10% OFF" },
      { min: 10, off: 15, label: "10+ unid. → 15% OFF" },
      { min: 25, off: 20, label: "25+ unid. → 20% OFF" },
      { min: 50, off: 25, label: "50+ unid. → 25% OFF" },
    ],
  },
];

const RULES = [
  {
    icon: Clock,
    title: "Validade de 360 dias",
    description:
      "Os vale-presentes podem ser utilizados em até 360 dias após a data de aquisição. Bastante tempo para planejar a experiência perfeita.",
  },
  {
    icon: Check,
    title: "Disponível após a confirmação",
    description:
      "Assim que o pagamento for confirmado, os vales ficam disponíveis imediatamente na área do cliente no portal, prontos para serem compartilhados.",
  },
  {
    icon: Gift,
    title: "Presenteie qualquer pessoa",
    description:
      "Basta compartilhar o código exclusivo do vale com a pessoa presenteada. Ela poderá utilizá-lo diretamente no site ao realizar sua compra.",
  },
  {
    icon: ShieldCheck,
    title: "Código único e seguro",
    description: "Cada vale possui um código alfanumérico exclusivo.",
  },
  {
    icon: Tag,
    title: "Uso integral por pedido",
    description:
      "Cada vale presente é válido para um único uso e sempre compatível com o produto correspondente.",
  },
  {
    icon: Ban,
    title: "Não cumulativo com promoções",
    description:
      "Os vale-presentes não são acumuláveis com cupons de desconto ou promoções vigentes.",
  },
];

/* ─────────── Helpers ─────────── */

function getDiscountPct(
  totalQty: number,
  discounts: { min: number; off: number; label: string }[]
): number {
  let pct = 0;
  for (const d of discounts) {
    if (totalQty >= d.min) pct = d.off;
  }
  return pct;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/* ─────────── Product Card Component ─────────── */

function ProductVoucherCard({
  product,
  quantities,
  onQuantityChange,
}: {
  product: ProductCard;
  quantities: number[];
  onQuantityChange: (optionIndex: number, qty: number) => void;
}) {
  const totalQty = quantities.reduce((a, b) => a + b, 0);
  const subtotalRaw = product.options.reduce(
    (sum, opt, i) => sum + opt.value * quantities[i],
    0
  );
  const discountPct = getDiscountPct(totalQty, product.discounts);
  const discountAmount = Math.round(subtotalRaw * (discountPct / 100));
  const subtotalFinal = subtotalRaw - discountAmount;

  return (
    <div className="rounded-2xl border border-border/60 bg-white overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        {/* Image */}
        <div className="relative min-h-[240px] md:min-h-full">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          {/* Discount badge */}
          {discountPct > 0 && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                % {discountPct}% OFF (combo {totalQty}+)
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Title & Description */}
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              {product.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product.description}
            </p>
          </div>

          {/* Options */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-3">
              Opções de Vale-Presente (cupons de desconto)
            </p>
            <div className="space-y-2">
              {product.options.map((opt, i) => (
                <div
                  key={opt.label}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 border transition-all ${
                    quantities[i] > 0
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/40 bg-secondary/30"
                  }`}
                >
                  <div>
                    <span className="text-lg font-bold text-foreground">
                      {opt.label}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {opt.isFullDiscount
                        ? "desconto máximo"
                        : "cupom de desconto"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onQuantityChange(i, Math.max(0, quantities[i] - 1))
                      }
                      className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors"
                      aria-label="Diminuir"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {quantities[i]}
                    </span>
                    <button
                      onClick={() => onQuantityChange(i, quantities[i] + 1)}
                      className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors"
                      aria-label="Aumentar"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal */}
          {totalQty > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3 border border-border/30">
              <span className="text-sm text-muted-foreground">
                Subtotal ({totalQty} vale{totalQty > 1 ? "s" : ""})
              </span>
              <div className="text-right">
                {discountPct > 0 && (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs text-muted-foreground line-through">
                      {formatBRL(subtotalRaw)}
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      -{discountPct}%
                    </span>
                  </div>
                )}
                <span className="text-lg font-bold text-foreground">
                  {formatBRL(subtotalFinal)}
                </span>
              </div>
            </div>
          )}

          {/* Volume Discounts */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="size-3.5 text-primary/60" />
              <span className="text-xs font-semibold text-foreground">
                Descontos por quantidade:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.discounts.map((d) => (
                <span
                  key={d.label}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    totalQty >= d.min
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/50 bg-secondary/30 text-muted-foreground"
                  }`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */

export default function ValePresentePage() {
  // quantities[productIdx][optionIdx]
  const [allQuantities, setAllQuantities] = useState<number[][]>(
    PRODUCTS.map((p) => p.options.map(() => 0))
  );

  const handleQuantityChange = useCallback(
    (productIdx: number, optionIdx: number, qty: number) => {
      setAllQuantities((prev) => {
        const next = prev.map((arr) => [...arr]);
        next[productIdx][optionIdx] = qty;
        return next;
      });
    },
    []
  );

  // Grand total calculation
  const grandTotal = useMemo(() => {
    let totalQtyAll = 0;
    let totalValueAll = 0;
    let totalDiscountAll = 0;

    PRODUCTS.forEach((product, pIdx) => {
      const quantities = allQuantities[pIdx];
      const totalQty = quantities.reduce((a, b) => a + b, 0);
      const subtotalRaw = product.options.reduce(
        (sum, opt, i) => sum + opt.value * quantities[i],
        0
      );
      const discountPct = getDiscountPct(totalQty, product.discounts);
      const discountAmount = Math.round(subtotalRaw * (discountPct / 100));

      totalQtyAll += totalQty;
      totalValueAll += subtotalRaw;
      totalDiscountAll += discountAmount;
    });

    return {
      qty: totalQtyAll,
      raw: totalValueAll,
      discount: totalDiscountAll,
      final: totalValueAll - totalDiscountAll,
    };
  }, [allQuantities]);

  return (
    <div className={grandTotal.qty > 0 ? "pb-24 lg:pb-0" : "pb-0"}>
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

      {/* ═══════════════════════════════════════════════════
          Section 1: Hero
          ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">
            <Gift className="size-3.5" />
            Vale Presente Exclusivo
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Presenteie com{" "}
            <span className="text-primary">Amor</span>
          </h1>

          <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Dê a alguém especial a oportunidade de eternizar os momentos mais
            preciosos com seu pet. Um presente que se transforma em memórias para
            toda a vida.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <a href="#catalogo">
              <Button
                size="lg"
                className="gap-2 text-sm uppercase tracking-wide font-semibold w-full sm:w-auto"
              >
                <Gift className="size-4 text-primary-foreground" />
                Escolher Vale Presente
              </Button>
            </a>
            <a href="#como-funciona">
              <Button
                size="lg"
                variant="outline"
                className="text-sm uppercase tracking-wide font-semibold w-full sm:w-auto"
              >
                Como Funciona
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 2: Por que presentear?
          ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
              Por que presentear?
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Mais do que um presente, uma experiência
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Nossos vale-presentes abrem as portas para sessões fotográficas
              profissionais e álbuns artísticos que transformam o amor pelo pet
              em arte palpável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border/50 bg-white p-6 text-center space-y-3"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <card.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 3: Inspiração
          ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
              Inspiração
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Quem você vai surpreender?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Seja para uso pessoal, corporativo ou para presentear alguém
              especial — nossos vales se adaptam a qualquer ocasião.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INSPIRATION_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white border border-border/50 p-5 space-y-3"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <card.icon className="size-4.5 text-primary" />
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 4: Catálogo
          ═══════════════════════════════════════════════════ */}
      <section id="catalogo" className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
              Catálogo
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Escolha o Vale Presente ideal
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Selecione o tipo de experiência e o valor desejado. Compras em
              maior quantidade garantem descontos progressivos exclusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Left: Product cards */}
            <div className="space-y-6">
              {PRODUCTS.map((product, pIdx) => (
                <ProductVoucherCard
                  key={product.id}
                  product={product}
                  quantities={allQuantities[pIdx]}
                  onQuantityChange={(optIdx, qty) =>
                    handleQuantityChange(pIdx, optIdx, qty)
                  }
                />
              ))}
            </div>

            {/* Right: Sticky floating total panel */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 shadow-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-5 text-primary" />
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Resumo
                    </h3>
                  </div>

                  {grandTotal.qty > 0 ? (
                    <>
                      {/* Per-product breakdown */}
                      <div className="space-y-2">
                        {PRODUCTS.map((product, pIdx) => {
                          const quantities = allQuantities[pIdx];
                          const totalQty = quantities.reduce((a, b) => a + b, 0);
                          if (totalQty === 0) return null;
                          const subtotalRaw = product.options.reduce(
                            (sum, opt, i) => sum + opt.value * quantities[i],
                            0
                          );
                          const discountPct = getDiscountPct(totalQty, product.discounts);
                          const discountAmt = Math.round(subtotalRaw * (discountPct / 100));
                          const subtotalFinal = subtotalRaw - discountAmt;
                          return (
                            <div
                              key={product.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {product.title}{" "}
                                <span className="text-xs">
                                  ({totalQty}x)
                                </span>
                              </span>
                              <span className="font-medium text-foreground">
                                {formatBRL(subtotalFinal)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-primary/20 pt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {grandTotal.qty} vale{grandTotal.qty > 1 ? "s" : ""}
                          </span>
                          {grandTotal.discount > 0 && (
                            <span className="line-through text-xs">
                              {formatBRL(grandTotal.raw)}
                            </span>
                          )}
                        </div>
                        {grandTotal.discount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium">
                              Desconto
                            </span>
                            <span className="text-green-600 font-semibold">
                              -{formatBRL(grandTotal.discount)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-serif font-bold text-foreground">
                            Total
                          </span>
                          <span className="text-2xl font-bold text-foreground">
                            {formatBRL(grandTotal.final)}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full gap-2 uppercase tracking-wide text-sm font-semibold"
                      >
                        <ShoppingBag className="size-4" />
                        Finalizar Compra
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Gift className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Selecione seus vales presentes ao lado
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Fixed bottom bar (shows only on mobile when items selected) */}
          {grandTotal.qty > 0 && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary/30 bg-primary/5 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {grandTotal.qty} vale{grandTotal.qty > 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    {grandTotal.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatBRL(grandTotal.raw)}
                      </span>
                    )}
                    <span className="text-xl font-bold text-foreground">
                      {formatBRL(grandTotal.final)}
                    </span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="gap-2 uppercase tracking-wide text-sm font-semibold shrink-0"
                >
                  <ShoppingBag className="size-4" />
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 5: Como Funciona
          ═══════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-12 md:py-16 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
              Como funciona
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Regras & Informações
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Tudo o que você precisa saber sobre nossos vale-presentes, de forma
              clara e transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RULES.map((rule) => (
              <div
                key={rule.title}
                className="rounded-2xl bg-white border border-border/50 p-5 space-y-3"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <rule.icon className="size-4.5 text-primary" />
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  {rule.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 6: Give Back
          ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-2xl border border-rose-200/60 bg-gradient-to-b from-rose-50 to-rose-50/30 p-8 md:p-10 space-y-4">
            <Heart className="size-8 text-rose-400 mx-auto" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Cada presente salva uma vida
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              10% do valor de cada vale presente vendido é doado para
              instituições de resgate animal. Ao presentear alguém com amor,
              você também ajuda quem mais precisa.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 7: Compras Corporativas
          ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-4">
          <Sparkles className="size-6 text-primary/50 mx-auto" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Compras Corporativas
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Para pedidos em grande volume ou personalizações exclusivas para sua
            empresa, entre em contato pelo WhatsApp. Condições especiais para
            compras acima de 50 unidades.
          </p>
          <a
            href="https://wa.me/5511936207631?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20vale-presentes%20corporativos."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="text-sm uppercase tracking-wide font-semibold mt-2 gap-2"
            >
              <MessageCircle className="size-4 text-foreground" />
              Fale Conosco no WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
