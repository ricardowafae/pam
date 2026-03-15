import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, ImageIcon, MapPin, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SESSIONS } from "@/components/sessoes/session-data";
import SessionPriceDisplay from "@/components/sessoes/SessionPriceDisplay";

export const metadata: Metadata = {
  title: "Sessões Fotográficas Pet",
  description:
    "Escolha a sessão fotográfica ideal para o seu pet. Pacotes Pocket, Estúdio e Ar-livre + Estúdio com o fotógrafo Juliano Lemos em São Paulo.",
};

export default function SessoesOverviewPage() {
  return (
    <div className="pb-0">
      {/* ── Back link ── */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
      </div>

      {/* ── Header ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
          Sessões Fotográficas
        </p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
          Eternize os melhores momentos com seu pet
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Escolha o pacote ideal para registrar a personalidade e o amor do seu
          companheiro. Todas as sessões incluem fotos em alta resolução editadas
          pelo fotógrafo Juliano Lemos.
        </p>
      </section>

      {/* ── Photographer badge ── */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3 rounded-full bg-secondary/40 px-5 py-2.5">
          <div className="relative size-10 rounded-full overflow-hidden shrink-0">
            <Image
              src="/images/juliano-lemos.jpg"
              alt="Juliano Lemos"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Juliano Lemos
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
            </p>
            <p className="text-xs text-muted-foreground">Fotógrafo Oficial</p>
          </div>
        </div>
      </div>

      {/* ── Session Cards ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {SESSIONS.map((session) => {
            return (
              <div
                key={session.slug}
                className={`relative flex flex-col rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg ${
                  session.highlight
                    ? "border-primary/40 ring-2 ring-primary/20"
                    : "border-border/50"
                }`}
              >
                {/* Highlight badge */}
                {session.highlight && (
                  <span className="absolute top-4 right-4 z-10 text-[10px] font-semibold bg-red-500 text-white px-3 py-1 rounded-full">
                    Em alta
                  </span>
                )}

                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={session.image}
                    alt={session.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-1">
                      {session.badge}
                    </p>
                    <h2 className="font-serif text-xl font-bold text-foreground">
                      {session.title}
                    </h2>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {session.description}
                  </p>

                  {/* Quick info */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border/40 py-2 text-center">
                      <Clock className="size-3.5 text-muted-foreground/60" />
                      <span className="text-[11px] text-muted-foreground">
                        {session.duration}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border/40 py-2 text-center">
                      <ImageIcon className="size-3.5 text-muted-foreground/60" />
                      <span className="text-[11px] text-muted-foreground">
                        {session.photosCount}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border/40 py-2 text-center">
                      <MapPin className="size-3.5 text-muted-foreground/60" />
                      <span className="text-[11px] text-muted-foreground">
                        {session.location}
                      </span>
                    </div>
                  </div>

                  {/* Features (first 3) */}
                  <ul className="space-y-1.5">
                    {session.features.slice(0, 3).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="size-3.5 shrink-0 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {session.features.length > 3 && (
                      <li className="text-xs text-primary/70 pl-5.5">
                        +{session.features.length - 3} itens inclusos
                      </li>
                    )}
                  </ul>

                  {/* Price */}
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-2xl font-bold text-foreground">
                      R${" "}
                      {session.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <SessionPriceDisplay price={session.price} />
                  </div>

                  {/* CTA */}
                  <Link href={`/sessoes/${session.slug}`} className="mt-auto">
                    <Button
                      size="lg"
                      className={`w-full text-sm uppercase tracking-wide font-semibold ${
                        session.highlight ? "" : "variant-outline"
                      }`}
                      variant={session.highlight ? "default" : "outline"}
                    >
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Location + How it Works ── */}
      <section className="mt-12 md:mt-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Localização */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Localização do Estúdio
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  Fração do Tempo Studio
                </p>
                <p>R. Cláudio Soares, 72 - Pinheiros</p>
                <p>São Paulo - SP, 05422-030</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Fácil acesso via metrô Faria Lima ou Oscar Freire
              </p>
            </div>

            {/* Como funciona */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Como funciona?
              </h3>
              <ol className="space-y-3">
                {[
                  "Finalize sua compra pelo site",
                  "Entre em sua área logada para agendar a sessão de fotos (entraremos em contato para confirmar)",
                  "Traga seu pet e divirta-se na sessão",
                  "Receba suas fotos editadas em alta resolução",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
