"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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

export default function ThemesCarousel() {
  const [activeTheme, setActiveTheme] = useState("verao");
  const current = themes.find((t) => t.id === activeTheme)!;

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

        {/* Theme content */}
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
          </div>
        </div>

        {/* Theme tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme.id)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTheme === theme.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-white text-muted-foreground hover:bg-secondary border border-border/50"
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/dogbook">
            <Button size="lg" className="uppercase tracking-wide text-sm font-semibold">
              Comprar Dogbook
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
