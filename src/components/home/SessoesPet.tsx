import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, MapPin, Camera, Quote } from "lucide-react";

const packages = [
  {
    name: "Experiência Pocket",
    image: "/images/session-pocket.jpg",
    features: [
      "5 fotos editadas em alta resolução para download",
      "1 hora de sessão em Estúdio",
      "Fotos com até 2 pessoas + pet",
      "Iluminação profissional",
    ],
    href: "/sessoes/pocket",
  },
  {
    name: "Experiência Estúdio",
    image: "/images/session-estudio.jpg",
    features: [
      "20 fotos editadas em alta resolução para download",
      "3 horas de sessão em Estúdio",
      "Fotos com até 3 pessoas + pet",
      "Iluminação profissional",
      "Figurinos e acessórios disponíveis",
      "Dogbook incluso",
    ],
    href: "/sessoes/estudio",
  },
  {
    label: "Estúdio + Ar Livre",
    name: "Experiência Completa",
    image: "/images/session-completa.jpg",
    features: [
      "40 fotos editadas em alta resolução para download",
      "5 horas de sessão (3h estúdio + 2h externo)",
      "Sessão ao ar-livre - Parque do Povo em São Paulo",
      "Fotos com até 5 pessoas + pet",
      "Maquiagem e cabelo (até 2 pessoas)",
      "Figurinos e acessórios disponíveis",
      "Dogbook incluso",
    ],
    href: "/sessoes/completa",
  },
];

export default function SessoesPet() {
  return (
    <section className="bg-secondary/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Fotografia
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Sessões Pet
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Fotografias artísticas que capturam o amor do seu companheiro de
            quatro patas.
          </p>
        </div>

        {/* Photographer - Creative Layout */}
        <div className="mx-auto mb-14 max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/[0.08] via-rose-50 to-primary/[0.04] border border-primary/10">
            <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">
              {/* Photo - Large */}
              <div className="relative min-h-[320px] md:min-h-full">
                <Image
                  src="/images/juliano-lemos.jpg"
                  alt="Juliano Lemos - Fotógrafo Pet"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
                {/* Overlay gradient on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                {/* Name on mobile over image */}
                <div className="absolute bottom-4 left-4 md:hidden">
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                    Fotógrafo
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Juliano Lemos
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center space-y-5">
                {/* Badge + Name - Desktop */}
                <div className="hidden md:block space-y-2">
                  <div className="flex items-center gap-2">
                    <Camera className="size-4 text-primary/60" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                      Fotógrafo
                    </p>
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                    Juliano Lemos
                    <Star className="size-5 fill-amber-400 text-amber-400" />
                  </h3>
                </div>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Fotógrafo a mais de 10 anos, Juliano se especializou em
                  fotografia de alto padrão e seus ensaios já registraram fotos
                  de Lucas Lucco, Alfredo Soares, Bettina Rudolph, Tiago Nigro e
                  Maira Cardi Nigro, Natalia Beauty, entre outros expoentes.
                  Nessa nova jornada, Juliano segue sua linha artística para
                  capturar o amor desses anjos de forma única.
                </p>

                {/* Quote */}
                <div className="relative rounded-xl bg-white/60 border border-primary/10 p-4 md:p-5">
                  <Quote className="absolute -top-2 -left-1 size-6 text-primary/20 rotate-180" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed pl-4">
                    Toda foto carrega um pedaço do tempo. Quando fotografo esses
                    anjos de patas, sinto que a foto carrega também um pedaço de
                    amor.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <MapPin className="size-3.5 text-primary/60" />
                  <span>
                    Fração do Tempo Studio &bull; Pinheiros, São Paulo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="relative flex flex-col rounded-2xl bg-rose-50/60 border border-primary/10 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6 space-y-4">
                {pkg.label && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                    {pkg.label}
                  </p>
                )}
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {pkg.name}
                </h3>
                <ul className="space-y-2 flex-1">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary/50 mt-1.5 shrink-0">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={pkg.href} className="block pt-2">
                  <Button
                    className="w-full gap-2 tracking-wide text-sm font-semibold rounded-full"
                    variant="outline"
                  >
                    Comprar
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
