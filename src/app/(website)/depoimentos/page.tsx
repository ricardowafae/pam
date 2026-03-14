import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Depoimentos",
  description:
    "Veja o que nossos clientes dizem sobre o Dogbook e as sessões fotográficas pet da Patas, Amor e Memórias.",
};

const testimonials = [
  { name: "Camila Santos", pet: "Thor", text: "O Dogbook ficou lindo demais! Cada página é uma obra de arte. O Thor ficou ainda mais fofo nas fotos do estúdio. Super recomendo!", rating: 5 },
  { name: "Rafael Oliveira", pet: "Luna", text: "Presente perfeito para quem ama pets. A Luna ganhou um livro de memórias que vou guardar para sempre. Atendimento impecável!", rating: 5 },
  { name: "Juliana Costa", pet: "Mel", text: "A sessão fotográfica foi incrível! O Juliano tem um talento especial com pets. A Mel ficou super à vontade e as fotos ficaram perfeitas.", rating: 5 },
  { name: "Fernando Almeida", pet: "Bob", text: "Comprei 3 Dogbooks para dar de presente e todos ficaram maravilhosos. O desconto progressivo valeu muito a pena!", rating: 5 },
  { name: "Patricia Lima", pet: "Nina", text: "A sessão completa foi a melhor experiência! Fotos ao ar livre e no estúdio, a Nina amou. O Dogbook ficou sensacional.", rating: 5 },
  { name: "Lucas Mendes", pet: "Max", text: "O programa Give Back me conquistou. Saber que parte do valor ajuda outros pets é muito gratificante. E o livro é lindo!", rating: 5 },
];

export default function DepoimentosPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Histórias de Amor
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Cada depoimento é uma história real de amor entre tutor e pet.
            Conheça as experiências de quem já eternizou seus momentos conosco.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-none bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm italic text-muted-foreground">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-serif font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Tutor(a) do {t.pet}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
