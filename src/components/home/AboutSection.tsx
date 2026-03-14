import { Heart, Palette, HandHeart } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Memória Afetiva",
    description:
      "Cada página do Dogbook foi pensada para guardar momentos únicos ao lado do seu amigo.",
  },
  {
    icon: Palette,
    title: "Arte & Emoção",
    description:
      "Sessões fotográficas que capturam a essência, a personalidade e o amor de cada doguinho.",
  },
  {
    icon: HandHeart,
    title: "Give Back",
    description:
      "Doamos 10% do valor para abrigos de adoção e de cuidados para que todo doguinho encontre o seu lar.",
  },
];

export default function AboutSection() {
  return (
    <section id="sobre" className="bg-secondary/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Sobre
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Mais do que uma foto,
            <br />
            <span className="text-primary">uma celebração de amor</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white border border-border/50 p-6 md:p-8 text-center space-y-3"
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="size-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-10 text-center">
          <p className="mx-auto max-w-2xl text-muted-foreground italic leading-relaxed">
            &ldquo;Nossos amigos de quatro patas conquistaram um espaço especial
            em nossas famílias. Eles merecem ter suas histórias
            eternizadas.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
