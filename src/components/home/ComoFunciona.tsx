import { ShoppingCart, Camera, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    step: "01",
    title: "Compre seu Fotolivro",
    description:
      "Adquira seu Dogbook e tenha acesso à área criativa exclusiva.",
  },
  {
    icon: Camera,
    step: "02",
    title: "Envie suas fotos",
    description:
      "Faça upload das melhores fotos do seu pet no portal do cliente.",
  },
  {
    icon: PackageCheck,
    step: "03",
    title: "Aprove e receba",
    description:
      "Confira o PDF digital, aprove e receba seu fotolivro em casa.",
  },
];

export default function ComoFunciona() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Exclusivo
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Como Funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Crie suas memórias
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl bg-white border border-border/50 p-6 md:p-8 text-center space-y-3"
            >
              <div className="relative mx-auto w-fit">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="size-7 text-primary" />
                </div>
                <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground italic">
            &ldquo;Amor e diversão garantidos para toda a família&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
