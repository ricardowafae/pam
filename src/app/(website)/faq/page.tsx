import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ - Perguntas Frequentes",
  description:
    "Tire suas dúvidas sobre o Dogbook, sessões fotográficas pet, entregas, pagamentos e mais. Perguntas frequentes da Patas, Amor e Memórias.",
};

const dogbookFAQs = [
  {
    question: "O que é o Dogbook?",
    answer:
      "O Dogbook é um fotolivro artesanal e personalizado, feito especialmente para eternizar os melhores momentos do seu pet. Cada livro é produzido com materiais premium e design exclusivo.",
  },
  {
    question: "Quanto tempo leva para receber o Dogbook?",
    answer:
      "Após a aprovação do design, o prazo de produção é de 15 a 20 dias úteis. O envio é feito com frete grátis para São Paulo capital.",
  },
  {
    question: "Posso escolher quais fotos vão no livro?",
    answer:
      "Sim! Após a compra, você acessa seu portal exclusivo e envia as fotos que deseja incluir. Nossa equipe cria o design e você aprova antes da produção.",
  },
  {
    question: "Quantas fotos posso incluir no Dogbook?",
    answer:
      "O Dogbook comporta entre 20 e 40 fotos, dependendo do layout escolhido. Você pode enviar mais fotos e nossa equipe seleciona as melhores junto com você.",
  },
  {
    question: "Posso dar de presente?",
    answer:
      "Sim! Temos a opção de Vale Presente. Você compra o vale, e a pessoa presenteada pode escolher o tema e enviar as fotos do pet dela. A entrega é feita em embalagem presente.",
  },
  {
    question: "Existe desconto para múltiplas unidades?",
    answer:
      "Sim! Oferecemos desconto progressivo: 5% para 2-3 unidades e 10% para 4 ou mais unidades. Além disso, pagamento via PIX tem 5% de desconto.",
  },
];

const sessionFAQs = [
  {
    question: "Qual a diferença entre as sessões fotográficas?",
    answer:
      "A Pocket é uma sessão rápida de 30 minutos com 15 fotos. A Estúdio é completa com 1 hora e 40 fotos. A Completa combina ar-livre e estúdio com 2 horas e 60 fotos.",
  },
  {
    question: "Onde são realizadas as sessões?",
    answer:
      "As sessões de estúdio são realizadas em nosso estúdio em Pinheiros, São Paulo. As sessões ao ar livre podem ser em parques e locações na região de São Paulo.",
  },
  {
    question: "Posso levar mais de um pet?",
    answer:
      "Sim! Você pode trazer seus pets para a sessão. Consulte disponibilidade e condições para sessões com múltiplos animais.",
  },
  {
    question: "E se meu pet não colaborar no dia?",
    answer:
      "Nosso fotógrafo Juliano Lemos é especializado em pets e sabe lidar com todas as situações. Se necessário, reagendamos sem custo adicional.",
  },
];

const paymentFAQs = [
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito em até 10x sem juros e PIX com 5% de desconto. Para cartão, aceitamos todas as bandeiras.",
  },
  {
    question: "Existe política de reembolso?",
    answer:
      "Sim, oferecemos garantia de 7 dias após o recebimento do produto. Se não estiver satisfeito, devolvemos 100% do valor pago.",
  },
];

export default function FAQPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Perguntas Frequentes
          </h1>
          <p className="mt-4 text-muted-foreground">
            Encontre respostas para as dúvidas mais comuns sobre nossos produtos
            e serviços
          </p>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              Sobre o Dogbook
            </h2>
            <Accordion className="w-full">
              {dogbookFAQs.map((faq, i) => (
                <AccordionItem key={i}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              Sobre as Sessões Fotográficas
            </h2>
            <Accordion className="w-full">
              {sessionFAQs.map((faq, i) => (
                <AccordionItem key={i}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              Pagamentos e Reembolso
            </h2>
            <Accordion className="w-full">
              {paymentFAQs.map((faq, i) => (
                <AccordionItem key={i}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
