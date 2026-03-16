"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DEFAULT_COMMISSION_RATES } from "@/lib/commission-config";
import { useCepLookup } from "@/hooks/useCepLookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Camera,
  Heart,
  DollarSign,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Building2,
  Clock,
  FileText,
  Loader2,
  PawPrint,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

const emptyRegForm = {
  personType: "PF" as "PF" | "PJ",
  name: "",
  email: "",
  phone: "",
  cpf: "",
  rg: "",
  instagram: "",
  portfolioUrl: "",
  chavePix: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  bio: "",
  observacoes: "",
};

/* ────────────────────── Page ────────────────────── */

export default function ConviteFotografoPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyRegForm);
  const [submitting, setSubmitting] = useState(false);
  const [commissions, setCommissions] = useState(DEFAULT_COMMISSION_RATES.photographer);

  useEffect(() => {
    fetch("/api/commissions/rates")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates?.photographer) setCommissions(d.rates.photographer);
      })
      .catch(() => {});
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const cepLookup = useCepLookup({
    onSuccess: (data) => {
      setForm((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
        complemento: data.complemento || prev.complemento,
      }));
    },
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Preencha os campos obrigatórios: Nome, Email e Telefone.");
      return;
    }
    if (form.personType === "PF" && !form.cpf) {
      toast.error("CPF é obrigatório para Pessoa Física.");
      return;
    }
    if (form.personType === "PJ" && (!form.cnpj || !form.razaoSocial)) {
      toast.error("CNPJ e Razão Social são obrigatórios para Pessoa Jurídica.");
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Cadastro enviado com sucesso! Entraremos em contato em breve.");
      setShowForm(false);
      setForm(emptyRegForm);
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f4] to-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#8b5e5e] px-4 py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5e5e] to-[#6b4444] opacity-90" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-10 flex items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Patas, Amor e Memórias"
              width={600}
              height={165}
              className="brightness-0 invert w-[320px] sm:w-[420px] md:w-[550px] h-auto"
              priority
            />
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Seja um Fotógrafo Parceiro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Junte-se à maior rede de fotografia pet de São Paulo. Faça o que ama,
            ganhe por cada sessão e transforme momentos em memórias eternas.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-[#8b5e5e] hover:bg-white/90"
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                document.getElementById("cadastro-fotografo")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Quero me Cadastrar
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      {/* ─── Diferenciais ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl font-bold text-foreground">
          Por que ser um Fotógrafo PAM?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Oferecemos uma parceria transparente, com pagamentos justos e suporte completo
          para que você foque no que faz de melhor: fotografar.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <DollarSign className="size-10 text-green-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Pagamento por Sessão
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Receba um valor fixo por cada sessão fotográfica concluída.
                Sem surpresas, sem complicações.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Users className="size-10 text-blue-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Clientes Garantidos
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nós cuidamos da captação de clientes. Você recebe a agenda pronta
                e foca apenas em fotografar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Camera className="size-10 text-purple-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Equipamento Flexível
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use seu próprio equipamento. Pedimos apenas qualidade profissional
                e carinho com os pets.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Heart className="size-10 text-red-500" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Impacto Social
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                10% de cada venda é doado para abrigos de animais através do
                programa Give Back. Seu trabalho faz a diferença.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Star className="size-10 text-amber-500" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Reconhecimento
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua marca é divulgada em nosso site e redes sociais.
                Construa sua reputação como especialista em fotografia pet.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Clock className="size-10 text-teal-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Horários Flexíveis
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Defina sua própria disponibilidade semanal. Trabalhe nos dias e
                horários que funcionam para você.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Valores por Sessão ─── */}
      <section className="bg-[#f9f3ee] px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-bold text-foreground">
            Valores por Sessão Concluída
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Valores pagos ao fotógrafo por cada sessão fotográfica realizada e entregue.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-2 border-[#8b5e5e]/20 text-center">
              <CardHeader>
                <Badge variant="secondary" className="mx-auto mb-2 text-xs">
                  Sessão Pocket
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.pocket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por sessão concluída</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Até 30 minutos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Locação externa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Entrega de 15 fotos editadas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#8b5e5e] text-center shadow-lg">
              <CardHeader>
                <Badge className="mx-auto mb-2 bg-[#8b5e5e] text-xs text-white">
                  Sessão Estúdio
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.estudio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por sessão concluída</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Até 1 hora
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Estúdio + cenários temáticos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Entrega de 30 fotos editadas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#8b5e5e]/20 text-center">
              <CardHeader>
                <Badge variant="secondary" className="mx-auto mb-2 text-xs">
                  Sessão Completa
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.completa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por sessão concluída</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Até 2 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Estúdio + externa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Entrega de 50+ fotos editadas
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Como Funciona ─── */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl font-bold text-foreground">
          Como Funciona
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">1</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Cadastre-se
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Preencha o formulário abaixo com seus dados profissionais e portfólio.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">2</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Avaliação
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Nossa equipe avalia seu portfólio e entra em contato para alinhar expectativas.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">3</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Comece a Fotografar
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Receba sua primeira agenda e comece a ganhar por cada sessão realizada.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-[#8b5e5e] hover:bg-[#7a5050] text-white"
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                document.getElementById("cadastro-fotografo")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Cadastre-se Agora
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      {/* ─── Registration Form ─── */}
      {showForm && (
        <section id="cadastro-fotografo" className="bg-[#f9f3ee] px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl text-foreground">
                  Cadastro de Fotógrafo Parceiro
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para iniciar o processo de parceria.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ─── Tipo de Pessoa ─── */}
                <div>
                  <Label className="mb-2 block text-sm font-semibold">
                    Tipo de Cadastro *
                  </Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={form.personType === "PF" ? "default" : "outline"}
                      className={`flex-1 ${form.personType === "PF" ? "bg-[#8b5e5e] hover:bg-[#7a5050]" : ""}`}
                      onClick={() => updateForm("personType", "PF")}
                    >
                      Pessoa Física (PF)
                    </Button>
                    <Button
                      type="button"
                      variant={form.personType === "PJ" ? "default" : "outline"}
                      className={`flex-1 ${form.personType === "PJ" ? "bg-[#8b5e5e] hover:bg-[#7a5050]" : ""}`}
                      onClick={() => updateForm("personType", "PJ")}
                    >
                      Pessoa Jurídica (PJ)
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* ─── Dados Pessoais ─── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Seu nome completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="email@exemplo.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Telefone / WhatsApp *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={form.instagram}
                      onChange={(e) => updateForm("instagram", e.target.value)}
                      placeholder="@usuario"
                      className="mt-1"
                    />
                  </div>

                  {/* PF Fields */}
                  {form.personType === "PF" && (
                    <>
                      <div>
                        <Label>CPF *</Label>
                        <Input
                          value={form.cpf}
                          onChange={(e) => updateForm("cpf", e.target.value)}
                          placeholder="000.000.000-00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>RG</Label>
                        <Input
                          value={form.rg}
                          onChange={(e) => updateForm("rg", e.target.value)}
                          placeholder="00.000.000-0"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <Label>Portfólio / Site</Label>
                    <Input
                      value={form.portfolioUrl}
                      onChange={(e) => updateForm("portfolioUrl", e.target.value)}
                      placeholder="https://seuportfolio.com"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Chave PIX (para recebimento)</Label>
                    <Input
                      value={form.chavePix}
                      onChange={(e) => updateForm("chavePix", e.target.value)}
                      placeholder="CPF, CNPJ, Email, Celular ou Chave Aleatória"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* ─── PJ Fields ─── */}
                {form.personType === "PJ" && (
                  <>
                    <Separator />
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Building2 className="size-4 text-[#8b5e5e]" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Dados da Empresa
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label>Razão Social *</Label>
                          <Input
                            value={form.razaoSocial}
                            onChange={(e) => updateForm("razaoSocial", e.target.value)}
                            placeholder="Razão Social da empresa"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Nome Fantasia</Label>
                          <Input
                            value={form.nomeFantasia}
                            onChange={(e) => updateForm("nomeFantasia", e.target.value)}
                            placeholder="Nome Fantasia"
                            className="mt-1"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>CNPJ *</Label>
                          <Input
                            value={form.cnpj}
                            onChange={(e) => updateForm("cnpj", e.target.value)}
                            placeholder="00.000.000/0000-00"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* ─── Endereço ─── */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="size-4 text-[#8b5e5e]" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Endereço
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <Label>CEP</Label>
                      <div className="relative mt-1">
                        <Input
                          value={form.cep}
                          onChange={(e) => updateForm("cep", e.target.value)}
                          onBlur={() => cepLookup.fetchCep(form.cep)}
                          placeholder="00000-000"
                        />
                        {cepLookup.loading && (
                          <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>Rua</Label>
                      <Input
                        value={form.rua}
                        onChange={(e) => updateForm("rua", e.target.value)}
                        placeholder="Nome da rua"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input
                        value={form.numero}
                        onChange={(e) => updateForm("numero", e.target.value)}
                        placeholder="123"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Complemento</Label>
                      <Input
                        value={form.complemento}
                        onChange={(e) => updateForm("complemento", e.target.value)}
                        placeholder="Apto, Bloco..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input
                        value={form.bairro}
                        onChange={(e) => updateForm("bairro", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input
                        value={form.cidade}
                        onChange={(e) => updateForm("cidade", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Input
                        value={form.estado}
                        onChange={(e) => updateForm("estado", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ─── Bio ─── */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="size-4 text-[#8b5e5e]" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Sobre Você
                    </h3>
                  </div>
                  <div>
                    <Label>Conte-nos sobre sua experiência com fotografia pet</Label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => updateForm("bio", e.target.value)}
                      placeholder="Sua experiência, equipamentos, estilo de fotografia..."
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={4}
                    />
                  </div>
                </div>

                {/* ─── Submit ─── */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-[#8b5e5e] hover:bg-[#7a5050] text-white"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Cadastro"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer className="bg-[#8b5e5e] px-4 py-8 text-center text-white/80">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="size-5" />
          <span className="font-serif font-bold">Patas, Amor e Memórias</span>
        </div>
        <p className="mt-2 text-sm">
          R. Cláudio Soares, 72 - Pinheiros, São Paulo · (11) 97105-3445
        </p>
        <p className="mt-1 text-xs text-white/60">
          © 2026 Patas, Amor e Memórias. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
