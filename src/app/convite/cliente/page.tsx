"use client";

import { useState } from "react";
import Image from "next/image";
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
import { toast } from "sonner";
import {
  Heart,
  Camera,
  CheckCircle2,
  ArrowRight,
  Building2,
  Loader2,
  Copy,
  PawPrint,
  Sparkles,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useCepLookup } from "@/hooks/useCepLookup";

/* ────────────────────── Types ────────────────────── */

const emptyForm = {
  personType: "PF" as "PF" | "PJ",
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

/* ────────────────────── Page ────────────────────── */

export default function ConviteClientePage() {
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

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
    if (form.personType === "PF") {
      if (!form.name || !form.email || !form.phone || !form.cpf) {
        toast.error(
          "Preencha os campos obrigatorios: Nome, Email, Telefone e CPF."
        );
        return;
      }
    }
    if (form.personType === "PJ") {
      if (!form.razaoSocial || !form.cnpj || !form.email || !form.phone) {
        toast.error(
          "Preencha os campos obrigatorios: Razao Social, CNPJ, Email e Telefone."
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Erro ao enviar cadastro. Tente novamente.");
        return;
      }

      toast.success("Cadastro realizado com sucesso!");
      setSuccess(true);
      setShowForm(false);
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const fullAddress = [
    form.street,
    form.number,
    form.complement,
    form.neighborhood,
    form.city,
    form.state,
    form.cep,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f4] to-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#8b5e5e] px-4 py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5e5e] to-[#6b4444] opacity-90" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-10 flex items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Patas, Amor e Memorias"
              width={600}
              height={165}
              className="brightness-0 invert w-[320px] sm:w-[420px] md:w-[550px] h-auto"
              priority
            />
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Voce foi Convidado(a) para uma Experiencia Unica!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            E uma honra ter voce aqui! A Patas, Amor e Memorias preparou um
            presente especial para voce e seu pet: uma Sessao Fotografica Pocket
            exclusiva, para eternizar os momentos mais lindos juntos.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-[#8b5e5e] hover:bg-white/90"
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                document
                  .getElementById("cadastro-cliente")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Quero me Cadastrar
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      {/* ─── Beneficios ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl font-bold text-foreground">
          O que te espera
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Uma experiencia pensada com carinho para celebrar o amor entre voce e
          seu melhor amigo de quatro patas.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Camera className="size-10 text-[#8b5e5e]" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Sessao Pocket Exclusiva
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Uma sessao fotografica profissional para seu pet, com cenarios
                encantadores e toda a dedicacao que esses momentos merecem.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <BookOpen className="size-10 text-amber-600" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Memorias Eternas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nossos Dogbooks transformam suas fotos favoritas em fotolivros
                artesanais unicos, preservando cada momento com arte e emocao
                para sempre.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Heart className="size-10 text-rose-500" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                Give Back
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                10% de cada venda e doado para abrigos de animais. Ao fazer
                parte da PAM, voce tambem ajuda a transformar a vida de pets que
                precisam de amor.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Sessao Pocket Destaque ─── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#8b5e5e] to-[#6b4444] px-4 py-16 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 size-60 rounded-full bg-white/10" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white/20">
            <Camera className="size-10 text-white" />
          </div>
          <h2 className="font-serif text-3xl font-bold md:text-4xl">
            Sua Sessao Pocket
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Preparamos uma sessao fotografica Pocket especial para voce e seu
            pet. Uma experiencia profissional e acolhedora, com o carinho que so
            a PAM oferece.
          </p>
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border-2 border-white/30 bg-white/10 p-8 backdrop-blur-sm">
            <Sparkles className="mx-auto size-12 text-white" />
            <h3 className="mt-4 font-serif text-2xl font-bold">
              Sessao Fotografica Pocket
            </h3>
            <p className="mt-2 text-white/80">
              Uma sessao exclusiva com fotografo profissional para registrar os
              melhores momentos do seu pet. Nosso presente para voce!
            </p>
            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-white/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-green-300" />
                15 a 20 fotos editadas profissionalmente
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-green-300" />
                Cenarios tematicos encantadores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-green-300" />
                Fotografo especializado em pets
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-green-300" />
                Entrega digital em alta resolucao
              </li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
              <Heart className="size-4" />
              Presente Exclusivo para Voce
            </div>
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
              Preencha o formulario abaixo com seus dados para garantir sua
              Sessao Pocket exclusiva.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">
                2
              </span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Crie sua Conta
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse o site patasamorememorias.com.br e crie sua conta
              utilizando o mesmo email do cadastro.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10">
              <span className="font-serif text-2xl font-bold text-[#8b5e5e]">
                3
              </span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Agende sua Sessao
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Faca login no Portal do Cliente e agende sua Sessao Pocket no menu
              &quot;Sessoes Foto&quot;.
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
                  .getElementById("cadastro-cliente")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Cadastre-se Agora
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      {/* ─── Success State ─── */}
      {success && (
        <section className="bg-[#f9f3ee] px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Cadastro Realizado com Sucesso!
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Que alegria ter voce na familia PAM! Agora siga os passos abaixo
              para agendar sua Sessao Pocket exclusiva e eternizar os momentos
              mais especiais com seu pet.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="border-0 shadow-md text-left">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e] text-sm font-bold text-white">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Acesse o site
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Visite patasamorememorias.com.br
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md text-left">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e] text-sm font-bold text-white">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Crie sua conta
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Clique em &quot;Criar Conta&quot; e use o mesmo email do
                        cadastro
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md text-left">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e] text-sm font-bold text-white">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Faca login
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Acesse o Portal do Cliente com suas credenciais
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md text-left">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e] text-sm font-bold text-white">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Agende sua Sessao Pocket
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No menu &quot;Sessoes Foto&quot;, escolha a data ideal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <a
                href="https://patasamorememorias.com.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-[#8b5e5e] hover:bg-[#7a5050] text-white"
                >
                  Acessar o Site
                  <ExternalLink className="ml-2 size-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── Registration Form ─── */}
      {showForm && !success && (
        <section id="cadastro-cliente" className="bg-[#f9f3ee] px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl text-foreground">
                  Cadastro de Cliente
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para garantir sua Sessao Pocket exclusiva.
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
                      Pessoa Fisica (PF)
                    </Button>
                    <Button
                      type="button"
                      variant={form.personType === "PJ" ? "default" : "outline"}
                      className={`flex-1 ${form.personType === "PJ" ? "bg-[#8b5e5e] hover:bg-[#7a5050]" : ""}`}
                      onClick={() => updateForm("personType", "PJ")}
                    >
                      Pessoa Juridica (PJ)
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* ─── PJ: Dados da Empresa ─── */}
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
                          <Label>Razao Social *</Label>
                          <Input
                            value={form.razaoSocial}
                            onChange={(e) =>
                              updateForm("razaoSocial", e.target.value)
                            }
                            placeholder="Razao Social da empresa"
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
                            onChange={(e) =>
                              updateForm("cnpj", e.target.value)
                            }
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

                  {form.personType === "PF" && (
                    <div>
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={form.birthDate}
                        onChange={(e) =>
                          updateForm("birthDate", e.target.value)
                        }
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
                </div>

                {/* ─── Endereco ─── */}
                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Endereco
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1">
                      <Label className="text-xs">CEP</Label>
                      <div className="relative">
                        <Input
                          placeholder="00000-000"
                          value={form.cep}
                          onChange={(e) =>
                            setForm({ ...form, cep: e.target.value })
                          }
                          onBlur={() => cepLookup.fetchCep(form.cep)}
                        />
                        {cepLookup.loading && (
                          <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Rua</Label>
                      <Input
                        placeholder="Rua"
                        value={form.street}
                        onChange={(e) =>
                          setForm({ ...form, street: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Numero</Label>
                      <Input
                        placeholder="N"
                        value={form.number}
                        onChange={(e) =>
                          setForm({ ...form, number: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1">
                      <Label className="text-xs">Complemento</Label>
                      <Input
                        placeholder="Apto, Sala..."
                        value={form.complement}
                        onChange={(e) =>
                          setForm({ ...form, complement: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Bairro</Label>
                      <Input
                        placeholder="Bairro"
                        value={form.neighborhood}
                        onChange={(e) =>
                          setForm({ ...form, neighborhood: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Cidade</Label>
                      <Input
                        placeholder="Cidade"
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1">
                      <Label className="text-xs">Estado</Label>
                      <Input
                        placeholder="UF"
                        value={form.state}
                        onChange={(e) =>
                          setForm({ ...form, state: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Endereco Completo</Label>
                    <div className="relative">
                      <Input
                        readOnly
                        value={fullAddress}
                        placeholder="Preenchido automaticamente"
                        className="bg-muted/30 pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(fullAddress);
                          toast.success("Endereco copiado!");
                        }}
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <Separator />

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
                      "Finalizar Cadastro"
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
          <span className="font-serif font-bold">Patas, Amor e Memorias</span>
        </div>
        <p className="mt-2 text-sm">
          R. Claudio Soares, 72 - Pinheiros, Sao Paulo · (11) 97105-3445
        </p>
        <p className="mt-1 text-xs text-white/60">
          &copy; 2026 Patas, Amor e Memorias. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
