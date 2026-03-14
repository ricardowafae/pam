"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

/* ─────────── Voucher option type ─────────── */

interface VoucherOption {
  label: string;
  value: number;
  isFullDiscount?: boolean;
}

interface ProductCard {
  id: string;
  title: string;
  description: string;
  options: VoucherOption[];
  discounts: { qty: string; off: string }[];
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
    options: [
      { label: "R$ 50,00", value: 50 },
      { label: "R$ 100,00", value: 100 },
      { label: "R$ 200,00", value: 200 },
      { label: "100% OFF", value: 0, isFullDiscount: true },
    ],
    discounts: [
      { qty: "5+ unid.", off: "10% OFF" },
      { qty: "10+ unid.", off: "15% OFF" },
      { qty: "25+ unid.", off: "17.5% OFF" },
      { qty: "50+ unid.", off: "20% OFF" },
    ],
  },
  {
    id: "pocket",
    title: "Sessão Pocket",
    description:
      "Uma sessão fotográfica rápida e encantadora, perfeita para capturar a essência do pet.",
    options: [
      { label: "R$ 100,00", value: 100 },
      { label: "R$ 200,00", value: 200 },
      { label: "R$ 300,00", value: 300 },
      { label: "100% OFF", value: 0, isFullDiscount: true },
    ],
    discounts: [
      { qty: "5+ unid.", off: "10% OFF" },
      { qty: "10+ unid.", off: "15% OFF" },
      { qty: "25+ unid.", off: "17.5% OFF" },
      { qty: "50+ unid.", off: "20% OFF" },
    ],
  },
  {
    id: "estudio",
    title: "Sessão Estúdio",
    description:
      "Sessão em estúdio profissional com cenários e iluminação controlada para fotos deslumbrantes.",
    options: [
      { label: "R$ 200,00", value: 200 },
      { label: "R$ 500,00", value: 500 },
      { label: "R$ 900,00", value: 900 },
      { label: "100% OFF", value: 0, isFullDiscount: true },
    ],
    discounts: [
      { qty: "5+ unid.", off: "10% OFF" },
      { qty: "10+ unid.", off: "15% OFF" },
      { qty: "25+ unid.", off: "20% OFF" },
      { qty: "50+ unid.", off: "25% OFF" },
    ],
  },
  {
    id: "completa",
    title: "Sessão Completa",
    description:
      "A experiência completa: estúdio + externas, com produção artística e entrega premium.",
    options: [
      { label: "R$ 400,00", value: 400 },
      { label: "R$ 800,00", value: 800 },
      { label: "R$ 1200,00", value: 1200 },
      { label: "100% OFF", value: 0, isFullDiscount: true },
    ],
    discounts: [
      { qty: "5+ unid.", off: "10% OFF" },
      { qty: "10+ unid.", off: "15% OFF" },
      { qty: "25+ unid.", off: "20% OFF" },
      { qty: "50+ unid.", off: "25% OFF" },
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

/* ─────────── Voucher Quantity Counter ─────────── */

function QuantityCounter() {
  const [qty, setQty] = useState(0);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setQty(Math.max(0, qty - 1))}
        className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Diminuir"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-medium">{qty}</span>
      <button
        onClick={() => setQty(qty + 1)}
        className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Aumentar"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/* ─────────── Product Card Component ─────────── */

function ProductVoucherCard({ product }: { product: ProductCard }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 md:p-6 space-y-4">
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
        <div className="space-y-2.5">
          {product.options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5"
            >
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {opt.label}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {opt.isFullDiscount ? "desconto máximo" : "cupom de desconto"}
                </span>
              </div>
              <QuantityCounter />
            </div>
          ))}
        </div>
      </div>

      {/* Volume Discounts */}
      <div className="rounded-xl bg-green-50/70 p-3">
        <p className="text-xs font-semibold text-green-700 mb-1.5">
          Descontos por quantidade:
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {product.discounts.map((d) => (
            <span key={d.qty} className="text-xs text-green-600">
              {d.qty} → {d.off}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */

export default function ValePresentePage() {
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
          Section 3: Inspiração - Quem você vai surpreender?
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
          Section 4: Catálogo - Escolha o Vale Presente
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCTS.map((product) => (
              <ProductVoucherCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 5: Como Funciona - Regras
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
              Cada presente salva uma vida 🐾
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
            href="https://wa.me/5511971053445?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20vale-presentes%20corporativos."
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
