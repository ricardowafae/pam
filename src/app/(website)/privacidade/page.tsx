import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de privacidade da Patas, Amor e Memórias. Saiba como tratamos seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">
          Política de Privacidade
        </h1>
        <p className="mb-1 text-lg font-medium text-foreground">
          Patas, Amor e Memórias
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Última atualização: 04/02/2026
        </p>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              1. Compromisso com a Privacidade
            </h2>
            <p>
              A Patas, Amor e Memórias respeita a privacidade dos seus clientes
              e atua em conformidade com a Lei Geral de Proteção de Dados (Lei
              nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              2. Controlador dos Dados
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Controlador: [Razão Social a ser preenchida]</li>
              <li>
                E-mail:{" "}
                <a
                  href="mailto:patasamorememorias@gmail.com"
                  className="text-primary hover:underline"
                >
                  patasamorememorias@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              3. Dados Coletados
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dados cadastrais: nome, e-mail, telefone, endereço</li>
              <li>Dados de pagamento e faturamento</li>
              <li>
                Fotografias, imagens e informações enviadas para os serviços
              </li>
              <li>Dados de navegação, quando aplicável</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              4. Finalidades do Tratamento
            </h2>
            <p>Os dados são utilizados para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Execução dos serviços contratados</li>
              <li>Emissão de documentos fiscais</li>
              <li>Comunicação e atendimento ao cliente</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              5. Armazenamento e Exclusão
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Materiais enviados para edição do Dogbook serão excluídos em até
                30 (trinta) dias após a conclusão do serviço
              </li>
              <li>
                Arquivos finais poderão ser mantidos por até 60 dias para
                suporte técnico
              </li>
              <li>Dados fiscais serão mantidos pelo prazo legal</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              6. Compartilhamento de Dados
            </h2>
            <p>Os dados poderão ser compartilhados apenas com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prestadores de pagamento</li>
              <li>Correios ou transportadoras</li>
              <li>Prestadores de tecnologia e armazenamento</li>
              <li>Autoridades, quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              7. Segurança
            </h2>
            <p>
              São adotadas medidas técnicas e organizacionais para proteger os
              dados contra acessos não autorizados, perdas ou usos indevidos.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              8. Direitos do Titular
            </h2>
            <p>O titular poderá solicitar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acesso, correção ou exclusão de dados</li>
              <li>Informações sobre o tratamento</li>
              <li>Revogação de consentimento, quando aplicável</li>
            </ul>
            <p className="mt-2">
              Solicitações devem ser enviadas para{" "}
              <a
                href="mailto:patasamorememorias@gmail.com"
                className="text-primary hover:underline"
              >
                patasamorememorias@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              9. Imagens de Menores
            </h2>
            <p>
              O envio de imagens de menores pressupõe autorização expressa do
              responsável legal.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              10. Alterações
            </h2>
            <p>
              Esta Política poderá ser atualizada a qualquer tempo, sendo válida
              a versão publicada no site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              11. Contato
            </h2>
            <p>
              Dúvidas ou solicitações:{" "}
              <a
                href="mailto:patasamorememorias@gmail.com"
                className="text-primary hover:underline"
              >
                patasamorememorias@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
