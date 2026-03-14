import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Tutora de Luna",
    text: "O dogbook é simplesmente perfeito. Consegui registrar todos os momentos especiais da Luna desde filhote. A qualidade do material é incrível.",
    rating: 5,
  },
  {
    name: "João Santos",
    role: "Tutor de Thor",
    text: "A sessão de fotos foi uma experiência incrível. O fotógrafo conseguiu capturar a personalidade do Thor de um jeito que nunca imaginei possível.",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Tutora de Mel",
    text: "Comprei a versão infantil para minha filha decorar junto comigo. Virou nosso momento especial de criar memórias juntas.",
    rating: 5,
  },
];

export default function Depoimentos() {
  return (
    <section className="bg-secondary/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Depoimentos
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Histórias de amor
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl bg-white border border-border/50 p-6 space-y-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div>
                <p className="font-serif font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
