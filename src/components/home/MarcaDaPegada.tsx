import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PawPrint, Heart, Sparkles, ShoppingBag } from "lucide-react";

export default function MarcaDaPegada() {
  return (
    <section className="bg-primary/5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-6 md:p-10 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_340px]">
            {/* Content */}
            <div className="space-y-5">
              {/* Badge */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <PawPrint className="size-5 text-primary/60" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                  Registre um momento único
                </p>
              </div>

              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                A marca da pegada
              </h2>

              <p className="text-muted-foreground leading-relaxed">
                Um espaço especial para registrar a patinha do seu pet,
                eternizando uma parte dele para sempre com você.
              </p>

              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  Área especial para registrar a patinha do seu aumigo
                </li>
                <li className="flex items-center gap-2.5">
                  <Heart className="size-4 text-primary shrink-0" />
                  Crie uma memória eterna do seu companheiro
                </li>
              </ul>

              <Link href="/dogbook">
                <Button
                  size="lg"
                  className="gap-2 uppercase tracking-wide text-sm font-semibold mt-2"
                >
                  <ShoppingBag className="size-4" />
                  Comprar Dogbook
                </Button>
              </Link>
            </div>

            {/* Image - reduced size */}
            <div className="relative w-full max-w-[340px] mx-auto lg:mx-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/images/dogbook-paw-page.jpg"
                  alt="Marca da patinha no Dogbook"
                  fill
                  className="object-cover"
                  sizes="380px"
                />
              </div>
              {/* Exclusivo badge */}
              <div className="absolute -bottom-3 -right-3 md:bottom-4 md:right-4">
                <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md">
                  <PawPrint className="size-3.5" />
                  Exclusivo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
