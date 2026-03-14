import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da Patas, Amor e Memórias.",
};

export default function TermosPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">
          Termos de Uso
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <h2 className="font-serif text-lg font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p>Ao acessar e utilizar o site Patas, Amor e Memórias, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize nosso site.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">2. Produtos e Serviços</h2>
          <p>Oferecemos fotolivros artesanais (Dogbook) e sessões fotográficas para pets. Os preços, disponibilidade e características dos produtos podem ser alterados sem aviso prévio.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">3. Pagamentos</h2>
          <p>Aceitamos cartão de crédito em até 10x sem juros e PIX com 5% de desconto. Todos os pagamentos são processados de forma segura através do Stripe.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">4. Entrega</h2>
          <p>O prazo de produção do Dogbook é de 15 a 20 dias úteis após a aprovação do design. Frete grátis para São Paulo capital.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">5. Garantia e Devoluções</h2>
          <p>Oferecemos garantia de 7 dias após o recebimento. Em caso de insatisfação, devolvemos 100% do valor pago mediante devolução do produto em perfeito estado.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">6. Propriedade Intelectual</h2>
          <p>Todo o conteúdo do site, incluindo textos, imagens, logotipos e design, é de propriedade da Patas, Amor e Memórias e está protegido por leis de direitos autorais.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">7. Contato</h2>
          <p>Para dúvidas sobre estes termos, entre em contato pelo email patas.amor.risadas@gmail.com ou WhatsApp (11) 97105-3445.</p>
        </div>
      </div>
    </div>
  );
}
