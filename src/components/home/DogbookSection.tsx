import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DogbookSection() {
  return (
    <section id="dogbook" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            O Fotolivro
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Dogbook
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Um fotolivro artesanal feito com amor para celebrar cada momento
            especial ao lado do seu companheiro de quatro patas.
          </p>
        </div>

        {/* Dogbook showcase image */}
        <div className="relative mx-auto max-w-4xl aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="/images/dogbook-open-spread.jpg"
            alt="Dogbook aberto mostrando páginas internas"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        {/* Features text */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Acabamento premium em linho, com gravação em baixo-relevo. Páginas
            com design artísticos e impressão de alta qualidade.
          </p>
        </div>
      </div>
    </section>
  );
}
