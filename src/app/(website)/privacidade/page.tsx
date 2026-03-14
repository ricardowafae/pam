import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade da Patas, Amor e Memórias.",
};

export default function PrivacidadePage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">
          Política de Privacidade
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <h2 className="font-serif text-lg font-semibold text-foreground">1. Coleta de Dados</h2>
          <p>Coletamos informações pessoais como nome, email, telefone e endereço para processar pedidos e melhorar nossos serviços. Dados de pets (nome, raça, aniversário) são coletados para personalização dos produtos.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">2. Uso dos Dados</h2>
          <p>Seus dados são utilizados para: processar pedidos, personalizar produtos, enviar atualizações sobre seus pedidos, e melhorar a experiência no site.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">3. Fotos e Imagens</h2>
          <p>As fotos enviadas pelo portal são utilizadas exclusivamente para a produção do seu Dogbook. Não compartilhamos suas fotos sem autorização expressa.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">4. Segurança</h2>
          <p>Utilizamos criptografia SSL e processamento seguro de pagamentos via Stripe para proteger seus dados pessoais e financeiros.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">5. Cookies</h2>
          <p>Utilizamos cookies essenciais para o funcionamento do site e cookies de análise para entender como nossos visitantes utilizam o site.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">6. Seus Direitos</h2>
          <p>Conforme a LGPD, você tem direito a: acessar seus dados, solicitar correção, solicitar exclusão, e revogar consentimento a qualquer momento.</p>

          <h2 className="mt-6 font-serif text-lg font-semibold text-foreground">7. Contato</h2>
          <p>Para questões sobre privacidade, entre em contato pelo email patas.amor.risadas@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}
