"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  Gift,
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Upload,
  PackageCheck,
  Sparkles,
  PawPrint,
  Star,
  Clock,
  Minus,
  Plus,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import type { Product } from "@/types";

/* ─────────── Data ─────────── */

const GALLERY_IMAGES = [
  {
    src: "/images/dogbook-cover-closed.jpg",
    alt: "Dogbook",
  },
  {
    src: "/images/dogbook-open-spread.jpg",
    alt: "Dogbook vista 2",
  },
  {
    src: "/images/dogbook-paw-page.jpg",
    alt: "Dogbook vista 3",
  },
  {
    src: "/images/dogbook-composition.jpg",
    alt: "Dogbook vista 4",
  },
];

const FEATURES = [
  "Capa em linho premium com gravação em baixo-relevo com o nome do seu cão",
  "24 páginas com design artístico exclusivo e sugestões de cenários temáticos para diferentes ocasiões",
  "Espaço criativo para o upload das fotos e para a composição do seu fotolivro",
  "Página especial para registrar a marca da pata do seu aumigo",
  "Espaços reservados para dedicatórias e para descrever as características que tornam seu cãozinho único",
];

const THEMES = [
  {
    id: "verao",
    name: "Verão",
    title: "Tema Verão",
    description:
      "Dias ensolarados e aventuras ao ar livre com seu melhor amigo.",
    image: "/images/theme-summer-realistic.jpg",
  },
  {
    id: "inverno",
    name: "Inverno",
    title: "Tema Inverno",
    description:
      "Momentos aconchegantes em família durante os dias frios e acolhedores.",
    image: "/images/theme-winter-realistic.jpg",
  },
  {
    id: "natal",
    name: "Natal",
    title: "Tema Natal",
    description:
      "Momentos mágicos das festas de fim de ano ao lado do seu melhor amigo.",
    image: "/images/theme-christmas-realistic.jpg",
  },
  {
    id: "anonovo",
    name: "Ano Novo",
    title: "Tema Ano Novo",
    description:
      "Celebre a virada do ano com memórias especiais do seu companheiro.",
    image: "/images/theme-newyear-realistic.jpg",
  },
  {
    id: "caoniversario",
    name: "Cãoniversário",
    title: "Tema Cãoniversário",
    description:
      "Celebre cada ano de vida com páginas especiais para registrar as comemorações do seu pet.",
    image: "/images/theme-birthday-realistic.jpg",
  },
];

const PERSONALITY_TRAITS = [
  "Amor que não acaba",
  "Mestre do zig e zag",
  "Adora uma travessura",
  "Mestre dos \"lambeijos\"",
  "Detetive de comida",
  "Patinhas velozes",
];

const PRICE = 490;
const MAX_INSTALLMENTS = 10;

/* ─────────── Component ─────────── */

const DOGBOOK_PRODUCT: Product = {
  id: "dogbook-1",
  name: "Dogbook",
  slug: "dogbook",
  category: "dogbook",
  description: "Fotolivro artesanal premium",
  base_price: PRICE,
  max_installments: MAX_INSTALLMENTS,
  pix_discount_pct: 5,
  image_url: "/images/dogbook-cover-closed.jpg",
  active: true,
  sort_order: 1,
  created_at: "",
  updated_at: "",
};

export default function DogbookPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pawRatings, setPawRatings] = useState<Record<string, number>>({});

  const handlePawClick = useCallback((trait: string, rating: number) => {
    setPawRatings((prev) => ({
      ...prev,
      [trait]: prev[trait] === rating ? rating - 1 : rating,
    }));
  }, []);
  const { addItem } = useCart();
  const router = useRouter();

  function handleAddToCart() {
    addItem(DOGBOOK_PRODUCT, quantity);
    toast.success(`${quantity} Dogbook${quantity > 1 ? "s" : ""} adicionado${quantity > 1 ? "s" : ""} ao carrinho!`);
  }

  function handleBuyNow() {
    addItem(DOGBOOK_PRODUCT, quantity);
    router.push("/carrinho");
  }

  const discount = useMemo(() => {
    if (quantity >= 4) return 0.1;
    if (quantity >= 2) return 0.05;
    return 0;
  }, [quantity]);

  const total = useMemo(() => {
    const unitPrice = PRICE * (1 - discount);
    return unitPrice * quantity;
  }, [quantity, discount]);

  const installmentValue = (total / MAX_INSTALLMENTS).toFixed(2).replace(".", ",");

  function handlePrevTheme() {
    setSelectedTheme((prev) => (prev === 0 ? THEMES.length - 1 : prev - 1));
  }

  function handleNextTheme() {
    setSelectedTheme((prev) => (prev === THEMES.length - 1 ? 0 : prev + 1));
  }

  const currentTheme = THEMES[selectedTheme];

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
          SECTION 1: Product Hero (Gallery + Info)
          ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          {/* ── Gallery ── */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={GALLERY_IMAGES[selectedImage].src}
                alt={GALLERY_IMAGES[selectedImage].alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {GALLERY_IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === i
                      ? "border-primary ring-1 ring-primary"
                      : "border-transparent hover:border-primary/30"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>

            {/* ── Give Back Banner (below gallery, left column) ── */}
            <div className="rounded-xl bg-gradient-to-r from-rose-50 to-rose-50/50 p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Heart className="size-5 text-rose-400" />
              </div>
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

            {/* ── Approval notice ── */}
            <div className="rounded-xl border border-border/60 p-4 flex items-start gap-3">
              <Clock className="size-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Após o upload das fotos, você receberá uma versão digital
                criada com muito carinho por nós para aprovação. Após a
                aprovação do Dogbook, não será mais possível editá-lo ou
                solicitar alterações. Produziremos o Dogbook e o
                encaminharemos para os Correios em até 3 dias úteis.
              </p>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-5">
            {/* Badge + Title */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-1">
                Edição Única
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                Dogbook
              </h1>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              Um fotolivro artesanal premium que te convida a uma jornada de
              celebração de cada momento especial ao lado do seu companheiro
              de quatro patas. Design elegante e minimalista, acabamento em
              linho com gravação em baixo-relevo.
            </p>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  R$ {PRICE.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-sm text-muted-foreground">
                  ou até {MAX_INSTALLMENTS}x de R$ {(PRICE / MAX_INSTALLMENTS).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Progressive discount box */}
            <div className="rounded-xl bg-secondary/60 p-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>🎉</span> Desconto Progressivo:
              </p>
              <ul className="mt-1.5 space-y-0.5 text-sm text-muted-foreground">
                <li>• Comprando 2 a 3 → 5% de desconto</li>
                <li>• Comprando 4 ou mais → 10% de desconto</li>
              </ul>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Quantidade</p>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors rounded-l-lg"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="size-4" />
                </button>
                <span className="px-5 py-2 text-sm font-medium min-w-[3rem] text-center border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors rounded-r-lg"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total:</span>
                <div className="text-right">
                  {discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      R$ {(PRICE * quantity).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-foreground">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                  {discount > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-0.5">
                      Voce economiza R$ {((PRICE * quantity) - total).toFixed(2).replace(".", ",")}!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" className="gap-2 text-sm uppercase tracking-wide font-semibold" onClick={handleBuyNow}>
                <ShoppingBag className="size-4" />
                Comprar Agora
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

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Truck className="size-5 text-primary/70" />
                <span className="text-xs text-muted-foreground">
                  Frete Grátis SP
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Shield className="size-5 text-primary/70" />
                <span className="text-xs text-muted-foreground">
                  Garantia 7 dias
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Gift className="size-5 text-primary/70" />
                <span className="text-xs text-muted-foreground">
                  Embalagem Presente
                </span>
              </div>
            </div>

            {/* O que está incluso */}
            <div className="space-y-3 pt-2">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                O que está incluso
              </h2>
              <ul className="space-y-2.5">
                {FEATURES.map((feature) => (
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
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: Como Funciona
          ═══════════════════════════════════════════════════ */}
      <section className="mt-16 md:mt-24 py-16 md:py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70 mb-3">
            Como Funciona
          </p>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground leading-tight">
            Uma jornada de muito amor
            <br />
            que se inicia agora
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="size-16 md:size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="size-7 md:size-8 text-primary/60" />
              </div>
              <p className="text-3xl font-light text-primary/30 mb-2">01</p>
              <h3 className="font-serif font-semibold text-foreground mb-2">
                Adquira o Dogbook
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compre o Dogbook e obtenha acesso imediato à área criativa
                exclusiva.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="size-16 md:size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="size-7 md:size-8 text-primary/60" />
              </div>
              <p className="text-3xl font-light text-primary/30 mb-2">02</p>
              <h3 className="font-serif font-semibold text-foreground mb-2">
                Faça o upload das fotos
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Envie as fotos que deseja eternizar no seu fotolivro
                personalizado.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="size-16 md:size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PackageCheck className="size-7 md:size-8 text-primary/60" />
              </div>
              <p className="text-3xl font-light text-primary/30 mb-2">03</p>
              <h3 className="font-serif font-semibold text-foreground mb-2">
                Aprove e Receba
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Confira o PDF digital, aprove e receba seu fotolivro
                personalizado em casa em até 3 dias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: Temas do Dogbook
          ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70 mb-3">
            Uma Jornada Muito Especial
          </p>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-4">
            Temas do Dogbook
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Embarque nessa jornada conosco. São diferentes temas para inspirar
            a criatividade e registrar momentos especiais ao longo do ano.
            <br />
            Aqui a diversão está garantida para o ano todo.
          </p>

          {/* Theme Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {THEMES.map((theme, i) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(i)}
                className={`px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.03] active:scale-95 ${
                  selectedTheme === i
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>

          {/* Theme Carousel Card */}
          <div className="relative max-w-4xl mx-auto">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevTheme}
              className="absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-all duration-200 ease-out hover:scale-110 active:scale-90"
              aria-label="Tema anterior"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={handleNextTheme}
              className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-all duration-200 ease-out hover:scale-110 active:scale-90"
              aria-label="Próximo tema"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden bg-card shadow-lg border border-border/50">
              {/* Theme Image */}
              <div className="relative aspect-[4/3] md:aspect-auto">
                <Image
                  src={currentTheme.image}
                  alt={currentTheme.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Theme Info */}
              <div className="p-6 md:p-8 flex flex-col items-start justify-center text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-1.5 mb-2">
                  <Sparkles className="size-3.5" />
                  Coleção Especial
                </p>
                <h4 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-3">
                  {currentTheme.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {currentTheme.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                    Páginas ilustradas
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                    Acabamento premium
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                    Design exclusivo
                  </span>
                </div>

                {/* Theme thumbnails row */}
                <div className="grid grid-cols-5 gap-1.5 w-full mb-6">
                  {THEMES.map((t) => (
                    <div
                      key={t.id}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button className="w-full gap-2 uppercase tracking-wide font-semibold" onClick={handleBuyNow}>
                  <ShoppingBag className="size-4" />
                  Comprar Dogbook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4: Upload Flexibility callout
          ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/20 to-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-serif text-lg md:text-xl font-bold text-foreground leading-relaxed">
            Você quem decide quando criar. Compre agora, tenha acesso à área
            criativa e faça o upload das fotos em até 360 dias.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Não tenha pressa, aproveite essa jornada com muito amor!
          </p>
          <p className="text-sm text-primary/70 mt-4 flex items-center justify-center gap-1.5">
            <Clock className="size-4" />
            Você receberá lembretes das datas festivas junto com dicas sobre
            como tirar as melhores fotos!
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 5: Personalidade Canina
          ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70 mb-3">
            Registre Tudo
          </p>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-4">
            Personalidade Canina
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Página dedicada a personalidade única do seu cãozinho. Alguns são
            brincalhões, outros &quot;pidões de comida&quot; e outros adoram
            correr e fazer zig zag. Qual desses traços você identifica no seu
            doguinho?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PERSONALITY_TRAITS.map((trait) => {
              const rating = pawRatings[trait] || 0;
              return (
                <div
                  key={trait}
                  className="flex items-center justify-between rounded-xl bg-secondary/50 px-5 py-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {trait}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i + 1} patinha${i > 0 ? "s" : ""} para ${trait}`}
                        className="group/paw p-0.5 transition-transform duration-150 hover:scale-125 active:scale-95"
                        onClick={() => handlePawClick(trait, i + 1)}
                      >
                        <PawPrint
                          className={`size-4 transition-all duration-200 ${
                            i < rating
                              ? "text-primary fill-primary"
                              : "text-primary/30 group-hover/paw:text-primary/50"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Button
              size="lg"
              className="gap-2 uppercase tracking-wide font-semibold px-10"
              onClick={handleBuyNow}
            >
              <ShoppingBag className="size-4" />
              Comprar Dogbook
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 6: A marca da pegada
          ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/30 to-secondary/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center rounded-2xl bg-secondary/30 p-6 md:p-12">
            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70 flex items-center gap-1.5 mb-3">
                <PawPrint className="size-4" />
                Registre um Momento Único
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                A marca da pegada
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Um espaço especial para registrar a patinha do seu pet,
                eternizando uma parte dele para sempre com você.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5">
                  <PawPrint className="size-4 text-primary/70 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Área especial para registrar a patinha ainda bebê e
                    depois de adulto
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Heart className="size-4 text-primary/70 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Crie uma memória eterna do seu companheiro
                  </p>
                </div>
              </div>

            </div>

            {/* Paw Image */}
            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden max-w-[70%] mx-auto">
              <Image
                src="/images/dogbook-paw-page.jpg"
                alt="Marca da pegada - registro da patinha"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Sparkles className="size-3" />
                  Exclusivo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 7: Final CTA
          ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <PawPrint className="size-8 text-primary/40 mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
            Pronto para eternizar suas memórias?
          </h2>
          <p className="text-muted-foreground mb-8">
            Comece agora a criar o fotolivro mais especial do seu melhor amigo.
          </p>
          <Button
            size="lg"
            className="gap-2 uppercase tracking-wide font-semibold px-10"
            onClick={handleBuyNow}
          >
            <ShoppingBag className="size-4" />
            Comprar Dogbook
          </Button>
        </div>
      </section>
    </div>
  );
}
