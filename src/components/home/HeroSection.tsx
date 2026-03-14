import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-family-dog.jpg"
          alt="Família feliz com seu cachorro"
          fill
          className="object-cover object-right-top md:object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Memórias que eternizam o amor
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Celebre cada momento{" "}
            <span className="text-primary italic">ao lado do seu pet</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fotolivros artesanais e sessões fotográficas exclusivas para
            eternizar o vínculo único entre você e seu companheiro de quatro
            patas.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dogbook">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto uppercase tracking-wide text-sm font-semibold"
              >
                Conhecer o Dogbook
              </Button>
            </Link>
            <Link href="/sessoes">
              <Button
                size="lg"
                className="w-full sm:w-auto uppercase tracking-wide text-sm font-semibold"
              >
                Sessões Fotográficas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="size-5 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
