"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const dogbookFaqs = [
  {
    question: "O que é o Dogbook?",
    answer:
      "O Dogbook é um fotolivro artesanal e personalizado, feito especialmente para eternizar os melhores momentos do seu pet. Cada livro é produzido com materiais premium e design exclusivo.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer:
      "Após a aprovação do design, o prazo de produção é de 15 a 20 dias úteis. O envio é feito com frete grátis para São Paulo capital.",
  },
  {
    question: "Posso usar as fotos da sessão no dogbook?",
    answer:
      "Sim! Você pode usar as fotos da sessão fotográfica no seu Dogbook. Basta fazer upload delas na área criativa do portal do cliente.",
  },
  {
    question: "Qual a política de devolução?",
    answer:
      "Oferecemos garantia de 7 dias após o recebimento. Se não ficar satisfeito com a qualidade do material, entre em contato para resolvermos.",
  },
];

const sessoesFaqs = [
  {
    question: "Como funciona a sessão de fotos?",
    answer:
      "Após a compra, entraremos em contato para agendar a sessão. No dia, basta trazer seu pet ao estúdio ou local combinado. O fotógrafo Juliano Lemos cuida de tudo!",
  },
  {
    question: "Onde acontecem as sessões?",
    answer:
      "As sessões acontecem no Fração do Tempo Studio, em Pinheiros, São Paulo. A sessão Completa inclui também fotos ao ar-livre no Parque do Povo.",
  },
  {
    question: "Qual o prazo de entrega das fotos?",
    answer:
      "As fotos editadas são entregues em até 15 dias úteis após a sessão, em alta resolução para download no portal do cliente.",
  },
  {
    question: "Vocês atendem em quais cidades?",
    answer:
      "Neste momento, estamos fotografando apenas na cidade de São Paulo. Fique atento às nossas redes sociais para novidades sobre expansão para outras regiões.",
  },
  {
    question: "Como funcionam as doações?",
    answer:
      "10% do valor de cada venda é doado automaticamente para abrigos e organizações de resgate animal parceiras. Ao adquirir qualquer produto, você contribui para essa causa.",
  },
];

export default function FAQ() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
            Dúvidas
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>

        {/* Dogbook FAQs */}
        <div className="mb-8">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
            Dogbook
          </h3>
          <Accordion className="w-full">
            {dogbookFaqs.map((faq, index) => (
              <AccordionItem key={`dogbook-${index}`}>
                <AccordionTrigger className="text-left font-serif text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Sessões FAQs */}
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
            Sessões Fotográficas
          </h3>
          <Accordion className="w-full">
            {sessoesFaqs.map((faq, index) => (
              <AccordionItem key={`sessoes-${index}`}>
                <AccordionTrigger className="text-left font-serif text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-10 text-center space-y-3">
          <p className="text-muted-foreground font-medium">
            Ainda tem dúvidas?
          </p>
          <a
            href="https://wa.me/5511971053445"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="gap-2 uppercase tracking-wide text-sm font-semibold"
            >
              <MessageCircle className="size-4" />
              Entre em contato pelo WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
