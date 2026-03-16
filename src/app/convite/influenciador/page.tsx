"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DEFAULT_COMMISSION_RATES, type CommissionRates } from "@/lib/commission-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Heart,
  DollarSign,
  Star,
  CheckCircle2,
  ArrowRight,
  Building2,
  Link2,
  BarChart3,
  Megaphone,
  FileText,
  Loader2,
  Copy,
  PawPrint,
  Gift,
  Camera,
} from "lucide-react";
import { useCepLookup } from "@/hooks/useCepLookup";

/* ────────────────────── Types ────────────────────── */

const emptyRegForm = {
  personType: "PF" as "PF" | "PJ",
  name: "",
  email: "",
  phone: "",
  cpf: "",
  instagram: "",
  tiktok: "",
  slug: "",
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  chavePix: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  bio: "",
};

/* ────────────────────── Page ────────────────────── */

export default function ConviteInfluenciadorPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyRegForm);
  const [submitting, setSubmitting] = useState(false);
  const [commissions, setCommissions] = useState(DEFAULT_COMMISSION_RATES.influencer);

  useEffect(() => {
    fetch("/api/commissions/rates")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates?.influencer) setCommissions(d.rates.influencer);
      })
      .catch(() => {});
  }, []);

  const cepLookup = useCepLookup({
    onSuccess: (data) => {
      setForm((f) => ({
        ...f,
        street: data.logradouro || f.street,
        neighborhood: data.bairro || f.neighborhood,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }));
    },
    onError: (msg) => toast.error(msg),
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (form.personType === "PF" && (!form.name || !form.email || !form.phone || !form.instagram)) {
      toast.error(
        "Preencha os campos obrigatórios: Nome, Email, Telefone e Instagram."
      );
      return;
    }
    if (form.personType === "PJ" && (!form.email || !form.phone || !form.instagram)) {
      toast.error(
        "Preencha os campos obrigatórios: Email, Telefone e Instagram."
      );
      return;
    }
    if (form.personType === "PF" && !form.cpf) {
      toast.error("CPF é obrigatório para Pessoa Física.");
      return;
    }
    if (form.personType === "PJ" && (!form.cnpj || !form.razaoSocial)) {
      toast.error(
        "CNPJ e Razão Social são obrigatórios para Pessoa Jurídica."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/influencers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Erro ao enviar cadastro. Tente novamente.");
        return;
      }

      toast.success(
        "Cadastro enviado com sucesso! Entraremos em contato em breve."
      );
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
          <div className="mb-12 flex items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Patas, Amor e Memórias"
              width={900}
              height={250}
              className="brightness-0 invert w-[85vw] max-w-[800px] h-auto"
              priority
            />
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Seja um Influenciador Parceiro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Monetize sua audiência pet lover! Compartilhe seu link exclusivo,
            ganhe comissão por cada venda e ajude a transformar momentos em
            memórias eternas.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-[#8b5e5e] hover:bg-white/90"
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                document
                  .getElementById("cadastro-influenciador")
                  ?.scrollIntoView({ behavior: "smooth" });
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
          Por que ser um Influenciador PAM?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Uma parceria que valoriza sua audiência e transforma seguidores em
          vendas reais. Tudo com transparência e métricas em tempo real.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <DollarSign className="size-10 text-green-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Comissão por Venda
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ganhe uma comissão fixa por cada produto vendido através do seu
                link personalizado. Quanto mais vende, mais ganha.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Link2 className="size-10 text-blue-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Link Personalizado
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Receba um link exclusivo com seu nome/marca. Fácil de
                compartilhar no Instagram, TikTok, YouTube e qualquer rede.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <BarChart3 className="size-10 text-purple-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Painel de Métricas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Acompanhe visitantes, vendas e comissões em tempo real no seu
                painel exclusivo. Transparência total.
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
                programa Give Back. Sua influência faz a diferença.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Megaphone className="size-10 text-amber-500" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Cupons Exclusivos
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ofereça cupons de desconto exclusivos para sua audiência.
                Aumente suas conversões e fidelize seus seguidores.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Star className="size-10 text-teal-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Reconhecimento
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua marca é divulgada no site e redes da PAM. Faça parte de uma
                comunidade de criadores que amam pets.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Presente Especial ─── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#8b5e5e] to-[#6b4444] px-4 py-16 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 size-60 rounded-full bg-white/10" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white/20">
            <Gift className="size-10 text-white" />
          </div>
          <h2 className="font-serif text-3xl font-bold md:text-4xl">
            Presente de Boas-Vindas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Ao se tornar um influenciador parceiro, você ganha uma
          </p>
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border-2 border-white/30 bg-white/10 p-8 backdrop-blur-sm">
            <Camera className="mx-auto size-12 text-white" />
            <h3 className="mt-4 font-serif text-2xl font-bold">
              Sessão Fotográfica Estúdio
            </h3>
            <p className="mt-2 text-white/80">
              Uma sessão completa em estúdio para você e seu pet, com
              direito a fotos profissionais editadas. Nosso presente
              para celebrar essa parceria!
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
              <Star className="size-4" />
              100% Gratuita
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comissões por Produto ─── */}
      <section className="bg-[#f9f3ee] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-bold text-foreground">
            Comissão por Produto Vendido
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Valores pagos ao influenciador por cada venda concluída através do
            seu link personalizado.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-[#8b5e5e]/20 text-center">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="mx-auto mb-2 text-xs">
                  Dogbook
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.dogbook.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por unidade vendida</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Fotolivro artesanal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Produto a partir de R$ 490
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#8b5e5e]/20 text-center">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="mx-auto mb-2 text-xs">
                  Sessão Pocket
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.pocket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por venda</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Sessão fotográfica rápida
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Produto a partir de R$ 900
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#8b5e5e] text-center shadow-lg">
              <CardHeader className="pb-2">
                <Badge className="mx-auto mb-2 bg-[#8b5e5e] text-xs text-white">
                  Sessão Estúdio
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.estudio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por venda</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Sessão em estúdio temático
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Produto a partir de R$ 3.700
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#8b5e5e]/20 text-center">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="mx-auto mb-2 text-xs">
                  Sessão Completa
                </Badge>
                <CardTitle className="font-serif text-3xl text-[#8b5e5e]">
                  R$ {commissions.completa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </CardTitle>
                <CardDescription>por venda</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Pacote completo premium
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    Produto a partir de R$ 4.900
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
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">
                1
              </span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Cadastre-se
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Preencha o formulário abaixo com seus dados e redes sociais.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">
                2
              </span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Receba seu Link
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Após aprovação, você recebe um link personalizado e acesso ao
              painel de métricas.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">
                3
              </span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Compartilhe e Ganhe
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Divulgue nas suas redes e ganhe comissão por cada venda realizada
              pelo seu link.
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
                document
                  .getElementById("cadastro-influenciador")
                  ?.scrollIntoView({ behavior: "smooth" });
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
        <section id="cadastro-influenciador" className="bg-[#f9f3ee] px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl text-foreground">
                  Cadastro de Influenciador Parceiro
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

                {/* ─── PJ: Dados da Empresa (no topo) ─── */}
                {form.personType === "PJ" && (
                  <>
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
                            onChange={(e) =>
                              updateForm("razaoSocial", e.target.value)
                            }
                            placeholder="Razão Social da empresa"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Nome Fantasia</Label>
                          <Input
                            value={form.nomeFantasia}
                            onChange={(e) =>
                              updateForm("nomeFantasia", e.target.value)
                            }
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
                    <Separator />
                  </>
                )}

                {/* ─── Dados Pessoais / Contato ─── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Nome Completo: apenas para PF */}
                  {form.personType === "PF" && (
                    <div>
                      <Label>Nome Completo *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1"
                      />
                    </div>
                  )}
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
                    <Label>Instagram *</Label>
                    <Input
                      value={form.instagram}
                      onChange={(e) => updateForm("instagram", e.target.value)}
                      placeholder="@seuarroba"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>TikTok</Label>
                    <Input
                      value={form.tiktok}
                      onChange={(e) => updateForm("tiktok", e.target.value)}
                      placeholder="@seuarroba"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Slug desejado (seu link)</Label>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        /p/
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => updateForm("slug", e.target.value)}
                        placeholder="seu-nome"
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {/* PF Fields */}
                  {form.personType === "PF" && (
                    <div>
                      <Label>CPF *</Label>
                      <Input
                        value={form.cpf}
                        onChange={(e) => updateForm("cpf", e.target.value)}
                        placeholder="000.000.000-00"
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <Label>Chave PIX (para recebimento de comissões)</Label>
                    <Input
                      value={form.chavePix}
                      onChange={(e) => updateForm("chavePix", e.target.value)}
                      placeholder="CPF, CNPJ, Email, Celular ou Chave Aleatória"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* ─── Endereco ─── */}
                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Endereco</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1">
                      <Label className="text-xs">CEP</Label>
                      <div className="relative">
                        <Input
                          placeholder="00000-000"
                          value={form.cep}
                          onChange={(e) => setForm({ ...form, cep: e.target.value })}
                          onBlur={() => cepLookup.fetchCep(form.cep)}
                        />
                        {cepLookup.loading && (
                          <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Rua</Label>
                      <Input placeholder="Rua" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Numero</Label>
                      <Input placeholder="N°" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1">
                      <Label className="text-xs">Complemento</Label>
                      <Input placeholder="Apto, Sala..." value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Bairro</Label>
                      <Input placeholder="Bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Cidade</Label>
                      <Input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1">
                      <Label className="text-xs">Estado</Label>
                      <Input placeholder="UF" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Endereco Completo</Label>
                    <div className="relative">
                      <Input
                        readOnly
                        value={[form.street, form.number, form.complement, form.neighborhood, form.city, form.state, form.cep].filter(Boolean).join(", ") || ""}
                        placeholder="Preenchido automaticamente"
                        className="bg-muted/30 pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          const addr = [form.street, form.number, form.complement, form.neighborhood, form.city, form.state, form.cep].filter(Boolean).join(", ");
                          navigator.clipboard.writeText(addr);
                          toast.success("Endereco copiado!");
                        }}
                      >
                        <Copy className="size-3.5" />
                      </button>
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
                    <Label>
                      Conte-nos sobre seu perfil, nicho e audiência
                    </Label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => updateForm("bio", e.target.value)}
                      placeholder="Seu nicho (pets, lifestyle, família...), quantidade de seguidores, tipo de conteúdo que produz..."
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
