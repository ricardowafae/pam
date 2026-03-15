import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock influencer data - in production this would come from DB
const mockInfluencers: Record<string, { name: string; slug: string }> = {
  "camila-pets": { name: "Camila Pets", slug: "camila-pets" },
  "pet-lovers": { name: "Pet Lovers SP", slug: "pet-lovers" },
  "mundo-pet": { name: "Mundo Pet", slug: "mundo-pet" },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const influencer = mockInfluencers[slug];
  const name = influencer?.name ?? slug;

  return {
    title: `Indicado por ${name}`,
    description: `Dogbooks e sessoes fotograficas para eternizar os melhores momentos com seu pet. Indicacao especial de ${name}.`,
    openGraph: {
      title: `Patas, Amor e Memorias - Indicado por ${name}`,
      description: `Fotolivros artesanais e sessoes fotograficas pet. Indicacao de ${name}.`,
      url: `https://patasamorememorias.com.br/p/${slug}`,
    },
  };
}

export default async function InfluencerLandingPage({ params }: Props) {
  const { slug } = await params;
  const influencer = mockInfluencers[slug];
  const name = influencer?.name ?? slug;

  return (
    <div className="min-h-screen bg-background">
      {/* Influencer Banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <Heart className="size-4 text-primary" />
          <span className="text-foreground">
            Indicado por{" "}
            <strong className="text-primary">{name}</strong>
          </span>
          <Heart className="size-4 text-primary" />
        </div>
      </div>

      {/* Simplified Home Content Placeholder */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="size-6 text-primary" />
            <span className="font-serif text-lg font-bold text-primary">
              Patas, Amor e Memorias
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#dogbook" className="hover:text-foreground transition-colors">
              Dogbook
            </Link>
            <Link href="#sessoes" className="hover:text-foreground transition-colors">
              Sessoes
            </Link>
            <Link href="#depoimentos" className="hover:text-foreground transition-colors">
              Depoimentos
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Eternize os melhores momentos
          <br />
          <span className="text-primary">com seu melhor amigo</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base md:text-lg">
          Fotolivros artesanais e sessoes fotograficas profissionais para
          transformar memorias com seu pet em arte.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/dogbook">
            <Button size="lg" className="gap-2">
              <PawPrint className="size-4" />
              Conhecer o Dogbook
            </Button>
          </Link>
          <Link href="/sessoes">
            <Button variant="outline" size="lg">
              Sessoes Fotograficas
            </Button>
          </Link>
        </div>
      </section>

      {/* Sections Placeholder */}
      <section id="dogbook" className="bg-card py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            O Dogbook
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Um fotolivro artesanal e personalizado, feito com carinho para
            contar a historia do seu pet. Temas exclusivos para cada momento
            especial.
          </p>
        </div>
      </section>

      <section id="sessoes" className="py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Sessoes Fotograficas
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Fotografo profissional Juliano Lemos captura a essencia e
            personalidade do seu pet em sessoes incriveis.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PawPrint className="size-4 text-primary" />
            <span className="font-serif font-semibold text-primary">
              Patas, Amor e Memorias
            </span>
          </div>
          <p>R. Claudio Soares, 72 - Pinheiros, Sao Paulo</p>
          <p className="mt-1">patasamorememorias@gmail.com | (11) 93620-7631</p>
        </div>
      </footer>
    </div>
  );
}
