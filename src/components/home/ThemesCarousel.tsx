"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import type { Product } from "@/types";

const themes = [
  {
    id: "verao",
    label: "Verão",
    collection: "Coleção Especial",
    title: "Tema Verão",
    description:
      "Energia, sol e diversão ao lado do seu melhor amigo de quatro patas.",
    features: ["Páginas ilustradas", "Acabamento premium", "Design exclusivo"],
    image: "/images/theme-summer-realistic.jpg",
  },
  {
    id: "inverno",
    label: "Inverno",
    collection: "Coleção Especial",
    title: "Tema Inverno",
    description:
      "Aconchego e ternura para celebrar os momentos quentinhos ao lado do seu melhor amigo.",
    features: ["Páginas ilustradas", "Acabamento premium", "Design exclusivo"],
    image: "/images/theme-winter-realistic.jpg",
  },
  {
    id: "natal",
    label: "Natal",
    collection: "Coleção Especial",
    title: "Tema Natal",
    description:
      "Momentos mágicos das festas de fim de ano ao lado do seu melhor amigo.",
    features: ["Páginas ilustradas", "Acabamento premium", "Design exclusivo"],
    image: "/images/theme-christmas-realistic.jpg",
  },
  {
    id: "anonovo",
    label: "Ano Novo",
    collection: "Coleção Especial",
    title: "Tema Ano Novo",
    description:
      "Celebre novos começos e brindes especiais com seu companheiro de quatro patas.",
    features: ["Páginas ilustradas", "Acabamento premium", "Design exclusivo"],
    image: "/images/theme-newyear-realistic.jpg",
  },
  {
    id: "caoniversario",
    label: "Cãoniversário",
    collection: "Coleção Especial",
    title: "Tema Cãoniversário",
    description:
      "Celebre o aniversário do seu pet com estilo! Bolo, chapéuzinho e as melhores memórias.",
    features: ["Páginas ilustradas", "Acabamento premium", "Design exclusivo"],
    image: "/images/theme-birthday-realistic.jpg",
  },
];

const DOGBOOK_PRODUCT: Product = {
  id: "dogbook-1",
  name: "Dogbook",
  slug: "dogbook",
  category: "dogbook",
  description: "Fotolivro artesanal premium para pets",
  base_price: 490,
  max_installments: 10,
  pix_discount_pct: 5,
  image_url: "/images/dogbook-cover.jpg",
  active: true,
  sort_order: 0,
  created_at: "",
  updated_at: "",
};

export default function ThemesCarousel() {
  const [activeTheme, setActiveTheme] = useState("verao");
  const current = themes.find((t) => t.id === activeTheme)!;
  const router = useRouter();
  const { addItem } = useCart();

  const handleBuyNow = () => {
    addItem(DOGBOOK_PRODUCT, 1);
    toast.success("Dogbook adicionado ao carrinho!");
    router.push("/carrinho");
  };

  const handleAddToCart = () => {
    addItem(DOGBOOK_PRODUCT, 1);
    toast.success("Dogbook adicionado ao carrinho!");
  };

  return (
    <section className="bg-secondary/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Uma jornada muito especial
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Temas do Dogbook
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Embarca nessa jornada conosco. São diferentes temas para inspirar a
            criatividade e registrar momentos especiais ao longo do ano. Aqui a
            diversão está garantida para o ano todo.
          </p>
        </div>

        {/* Theme content card */}
        <div className="rounded-2xl bg-secondary/40 p-4 md:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Info */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                {current.collection}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                {current.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {current.description}
              </p>
              <ul className="space-y-2">
                {current.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2 uppercase tracking-wide text-sm font-semibold"
                  onClick={handleBuyNow}
                >
                  <ShoppingBag className="size-4" />
                  Comprar Agora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2 uppercase tracking-wide text-sm font-semibold"
                  onClick={handleAddToCart}
                >
                  <Heart className="size-4" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          </div>

          {/* Theme tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.03] active:scale-95 ${
                  activeTheme === theme.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white text-muted-foreground hover:bg-secondary border border-border/50"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
