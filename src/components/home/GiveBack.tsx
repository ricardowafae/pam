import {
  Heart,
  PawPrint,
  HeartHandshake,
  Home,
  Smile,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const entities = [
  { name: "Vida Canina", icon: PawPrint },
  { name: "Adote um Amigo", icon: HeartHandshake },
  { name: "Abrigo Esperança", icon: Home },
  { name: "Patinhas Felizes", icon: Smile },
  { name: "Resgate Animal", icon: ShieldCheck },
];

export default function GiveBack() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header - outside card */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Give Back
            </span>
            <Sparkles className="size-4 text-primary/60" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl max-w-2xl mx-auto">
            Devolvendo o amor que{" "}
            <br className="hidden sm:block" />
            <span className="italic text-primary">
              eles nos dão todos os dias
            </span>
          </h2>

          <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Nossos amigos de quatro patas nos ensinam sobre amor incondicional,
            lealdade e alegria. Agora é a nossa vez de retribuir.
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-b from-rose-50 to-rose-50/30 border border-rose-200/40">
          <div className="p-8 md:p-12 space-y-8 text-center">
            {/* 10% Stat */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Heart
                  className="size-3 text-primary/40"
                  fill="currentColor"
                />
                <span className="font-serif text-5xl md:text-6xl font-bold text-primary/70">
                  10%
                </span>
                <Heart
                  className="size-3 text-primary/40"
                  fill="currentColor"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                das vendas do site é revertida em doação para abrigos e
                organizações de resgate que trabalham incansavelmente para dar
                uma segunda chance a cães abandonados.
              </p>
            </div>

            {/* Separator */}
            <div className="flex justify-center">
              <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
            </div>

            {/* Entities */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                Entidades que apoiamos
              </p>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {entities.map((entity) => (
                  <div
                    key={entity.name}
                    className="flex flex-col items-center gap-2"
                  >
                    <entity.icon className="size-6 text-primary/50" />
                    <span className="text-xs text-muted-foreground">
                      {entity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a
              href="https://wa.me/5511936207631"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="gap-2 uppercase tracking-wide text-sm font-semibold mt-2"
              >
                <Heart className="size-4" fill="currentColor" />
                Faça parte dessa missão
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
