import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso",
  description:
    "Termos e condições de uso da Patas, Amor e Memórias.",
};

export default function TermosPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">
          Termos e Condições de Uso
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
              1. Identificação
            </h2>
            <p>
              Este documento regula o uso dos serviços oferecidos pela Patas,
              Amor e Memórias, operada por [Razão Social a ser preenchida],
              inscrita no CNPJ sob nº [CNPJ a ser preenchido], com sede em
              [Endereço completo a ser preenchido], doravante denominada
              &ldquo;Empresa&rdquo;.
            </p>
            <p>
              E-mail de atendimento e privacidade:{" "}
              <a
                href="mailto:patasamorememorias@gmail.com"
                className="text-primary hover:underline"
              >
                patasamorememorias@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              2. Aceite dos Termos
            </h2>
            <p>
              Ao contratar qualquer serviço da Patas, Amor e Memórias, o cliente
              declara ter lido, compreendido e aceitado integralmente estes
              Termos e a Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              3. Elegibilidade
            </h2>
            <p>
              Os serviços são destinados a pessoas maiores de 18 anos. Caso
              envolvam menores de idade, o responsável legal declara possuir
              autorização para contratação e uso de imagem.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              4. Serviços Prestados
            </h2>

            <h3 className="font-serif text-base font-semibold text-foreground mt-4">
              4.1 Dogbook &ndash; Fotolivro Personalizado
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fotolivro personalizado, editável e exclusivo</li>
              <li>
                O cliente terá até 365 (trezentos e sessenta e cinco) dias a
                partir da compra para encaminhar as imagens e informações
                necessárias
              </li>
              <li>Envio de prévia digital para aprovação</li>
              <li>
                Após aprovação, o Dogbook será postado nos Correios para entrega
                estimada em até 5 (cinco) dias úteis, conforme prazos da empresa
                de logística
              </li>
              <li>
                O produto é considerado bem manifestamente personalizado
              </li>
            </ul>

            <h3 className="font-serif text-base font-semibold text-foreground mt-4">
              4.2 Sessões de Fotografia
            </h3>

            <p className="font-medium text-foreground mt-2">
              Experiência Pocket
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>1 hora de sessão em estúdio</li>
              <li>Até 2 pessoas + pet</li>
              <li>Iluminação profissional</li>
              <li>5 fotos editadas em alta resolução para download</li>
            </ul>

            <p className="font-medium text-foreground mt-2">
              Experiência Estúdio
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>3 horas de sessão em estúdio</li>
              <li>Até 3 pessoas + pet</li>
              <li>Iluminação profissional</li>
              <li>Figurinos e acessórios disponíveis</li>
              <li>20 fotos editadas em alta resolução</li>
              <li>Dogbook incluso</li>
            </ul>

            <p className="font-medium text-foreground mt-2">
              Experiência Completa (Estúdio + Ar Livre)
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>5 horas de sessão (3h estúdio + 2h externo)</li>
              <li>
                Sessão externa no Parque do Povo &ndash; São Paulo/SP
              </li>
              <li>Até 5 pessoas + pet</li>
              <li>Maquiagem e cabelo para até 2 pessoas</li>
              <li>Figurinos e acessórios disponíveis</li>
              <li>40 fotos editadas em alta resolução</li>
              <li>Dogbook incluso</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              5. Agendamento e Remarcações
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                O agendamento das sessões será realizado através da sua área
                logada, ou pelo WhatsApp
              </li>
              <li>
                Remarcações devem ser solicitadas com antecedência mínima de 5
                (cinco) dias
              </li>
              <li>É permitida 1 (uma) única remarcação sem custo</li>
              <li>
                Nova remarcação poderá acarretar taxa adicional de 15% sobre o
                valor contratado
              </li>
              <li>Atrasos podem reduzir o tempo da sessão sem desconto</li>
              <li>
                O não comparecimento poderá resultar na perda total do valor
                pago
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              6. Entrega das Fotos Editadas
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                As fotos editadas serão entregues para download em até 5 (cinco)
                dias úteis após a realização da sessão
              </li>
              <li>
                A seleção das imagens segue critérios técnicos e artísticos
              </li>
              <li>
                Fotos brutas não são disponibilizadas, salvo contratação
                específica
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              7. Pagamento e Faturamento
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                O pagamento deve ser realizado conforme condições informadas no
                site
              </li>
              <li>
                A Nota Fiscal será emitida e enviada para o e-mail informado,
                conforme legislação vigente
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              8. Entrega do Dogbook
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                O cliente é responsável por informar corretamente o endereço de
                entrega
              </li>
              <li>
                A Empresa não se responsabiliza por atrasos causados por
                terceiros (Correios)
              </li>
              <li>
                Reenvios por erro de endereço poderão gerar nova cobrança de
                frete
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              9. Direito de Arrependimento e Produtos Personalizados
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Aplica-se o direito de arrependimento previsto no art. 49 do
                CDC, desde que a personalização não tenha sido iniciada
              </li>
              <li>
                Após aprovação da prévia digital e início da impressão, não será
                possível cancelamento ou reembolso, salvo defeito de fabricação
                comprovado
              </li>
              <li>
                Em caso de defeito, o cliente deverá comunicar em até 7 dias
                após o recebimento, enviando imagens comprobatórias
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              10. Conteúdos Enviados pelo Cliente
            </h2>
            <p>
              O cliente declara ser titular dos direitos das imagens enviadas e
              assume total responsabilidade por seu conteúdo, garantindo que não
              violam direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              11. Direitos Autorais e Licença
            </h2>
            <p>
              O cliente mantém a titularidade das imagens, concedendo à Empresa
              licença limitada e temporária para edição, produção e entrega dos
              serviços contratados.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              12. Uso de Imagens para Divulgação
            </h2>
            <p>
              A Empresa poderá, com o consentimento do cliente, utilizar imagens
              produzidas para fins de portfólio e divulgação em seu site e suas
              redes sociais, de forma respeitosa. É opção do cliente consentir
              ou não à solicitação de uso das imagens.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              13. Privacidade
            </h2>
            <p>
              O tratamento de dados pessoais é realizado conforme a{" "}
              <a href="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>{" "}
              da Patas, Amor e Memórias.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              14. Limitação de Responsabilidade
            </h2>
            <p>
              A responsabilidade da Empresa limita-se ao valor efetivamente pago
              pelo cliente pelo serviço contratado, nos limites permitidos por
              lei.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              15. Foro
            </h2>
            <p>
              Fica eleito o foro da Comarca de São Paulo/SP, para dirimir
              quaisquer questões oriundas destes Termos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
