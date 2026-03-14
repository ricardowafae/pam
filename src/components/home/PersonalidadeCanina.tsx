"use client";

import { useState } from "react";
import { PawPrint } from "lucide-react";

const traits = [
  "Amor que não acaba",
  "Mestre do zig e zag",
  "Adora uma travessura",
  'Mestre dos "lambeijos"',
  "Detetive de comida",
  "Patinhas velozes",
];

export default function PersonalidadeCanina() {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handlePawClick = (trait: string, pawIndex: number) => {
    setRatings((prev) => {
      const current = prev[trait] || 0;
      if (current === pawIndex) {
        return { ...prev, [trait]: 0 };
      }
      return { ...prev, [trait]: pawIndex };
    });
  };

  return (
    <section className="bg-primary/5 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Registre Tudo
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Personalidade Canina
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Página dedicada a personalidade única do seu cãozinho. Alguns são
            brincalhões, outros &ldquo;pidões de comida&rdquo; e outros adoram
            correr e fazer zig zag.
            <br />
            Qual desses traços você identifica no seu doguinho?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {traits.map((trait) => {
            const selected = ratings[trait] || 0;
            return (
              <div
                key={trait}
                className="flex items-center justify-between rounded-full bg-white/70 border border-border/40 px-5 py-3"
              >
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {trait}
                </span>
                <div className="flex gap-0.5 ml-3 shrink-0">
                  {[1, 2, 3, 4, 5].map((pawIndex) => (
                    <button
                      key={pawIndex}
                      type="button"
                      onClick={() => handlePawClick(trait, pawIndex)}
                      className="p-0.5 transition-colors"
                      aria-label={`${pawIndex} patinha${pawIndex > 1 ? "s" : ""} para ${trait}`}
                    >
                      <PawPrint
                        className={`size-3.5 transition-colors ${
                          pawIndex <= selected
                            ? "fill-primary/80 text-primary/80"
                            : "fill-primary/20 text-primary/20 hover:fill-primary/40 hover:text-primary/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
