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
  Star,
  Clock,
  MapPin,
  ImageIcon,
  Users,
  Lightbulb,
  Quote,
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

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document
        .getElementById("cadastro-cliente")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
      {/* ═══════════════════════════════════════════════
          HERO with full-bleed session image
          ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#8b5e5e]">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/session-estudio.jpg"
            alt="Sessao fotografica pet"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#8b5e5e]/70 via-[#8b5e5e]/80 to-[#6b4444]/95" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center text-white md:py-28">
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
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Voce foi Convidado(a) para uma Experiencia Unica!
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
            E uma honra ter voce aqui! A Patas, Amor e Memorias preparou um
            presente especial para voce e seu pet: uma Sessao Fotografica Pocket
            exclusiva, para eternizar os momentos mais lindos juntos.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-[#8b5e5e] hover:bg-white/90 text-base px-8 py-6"
            onClick={scrollToForm}
          >
            Quero me Cadastrar
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Hero image showcase — pet photo
          ═══════════════════════════════════════════════ */}
      <section className="relative -mt-12 px-4 md:-mt-16">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <Image
                src="/images/hero-family-dog.jpg"
                alt="Momentos especiais com seu pet"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1120px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8">
                <p className="font-serif text-lg font-bold text-white md:text-2xl">
                  Cada momento com seu pet merece ser eternizado
                </p>
                <p className="mt-1 text-sm text-white/80 md:text-base">
                  Fotografias artisticas que capturam o amor do seu companheiro de quatro patas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Beneficios — Cards com icones
          ═══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
          O que te espera
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Uma experiencia pensada com carinho para celebrar o amor entre voce e
          seu melhor amigo de quatro patas.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="group border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#8b5e5e]/10 transition-colors group-hover:bg-[#8b5e5e]/20">
                <Camera className="size-8 text-[#8b5e5e]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Sessao Pocket Exclusiva
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Uma sessao fotografica profissional de 1 hora para seu pet, com cenarios
                encantadores e toda a dedicacao que esses momentos merecem.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-50 transition-colors group-hover:bg-amber-100">
                <BookOpen className="size-8 text-amber-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Memorias Eternas
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Nossos Dogbooks transformam suas fotos favoritas em fotolivros
                artesanais unicos, preservando cada momento com arte e emocao
                para sempre.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-rose-50 transition-colors group-hover:bg-rose-100">
                <Heart className="size-8 text-rose-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Give Back
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                10% de cada venda e doado para abrigos de animais. Ao fazer
                parte da PAM, voce tambem ajuda a transformar a vida de pets que
                precisam de amor.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Sessao Pocket — Destaque visual com imagem
          ═══════════════════════════════════════════════ */}
      <section className="bg-[#f9f3ee] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Image side */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/images/session-pocket.jpg"
                    alt="Sessao Pocket - Fotografia Pet Profissional"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-lg md:-right-6">
                <Heart className="size-5 text-rose-500 fill-rose-500" />
                <span className="font-serif text-sm font-bold text-[#8b5e5e]">Presente Exclusivo</span>
              </div>
            </div>

            {/* Content side */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#8b5e5e]/10 px-4 py-1.5">
                <Sparkles className="size-4 text-[#8b5e5e]" />
                <span className="text-sm font-semibold text-[#8b5e5e]">Sua Sessao Fotografica</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Sessao Pocket
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Preparamos uma sessao fotografica Pocket especial para voce e seu
                pet. Uma experiencia profissional e acolhedora, no studio
                Fracao do Tempo em Pinheiros, com o carinho que so a PAM oferece.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                    <ImageIcon className="size-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">15 a 20 fotos editadas profissionalmente</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="size-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">1 hora de sessao em studio profissional</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                    <Users className="size-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Ate 2 pessoas + pet nas fotos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                    <Lightbulb className="size-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Iluminacao profissional e cenarios tematicos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-rose-100">
                    <Camera className="size-5 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Figurinos e acessorios disponiveis</span>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-8 bg-[#8b5e5e] hover:bg-[#7a5050] text-white text-base px-8"
                onClick={scrollToForm}
              >
                Garantir Minha Sessao
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Fotografo — Juliano Lemos
          ═══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8b5e5e]">
            Fotografo
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Quem vai registrar esses momentos
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <div className="relative h-[400px] w-[320px] md:h-[500px] md:w-[400px]">
                  <Image
                    src="/images/juliano-lemos.jpg"
                    alt="Juliano Lemos - Fotografo Oficial PAM"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              </div>
              {/* Star badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-lg">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <Star className="size-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
              <Camera className="size-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Fotografo Oficial</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
              Juliano Lemos
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Fotografo a mais de 10 anos, Juliano se especializou em fotografia
              de alto padrao e seus ensaios ja registraram fotos de celebridades
              e personalidades. Nessa nova jornada, Juliano segue sua linha
              artistica para capturar o amor desses anjos de forma unica.
            </p>

            {/* Quote */}
            <div className="mt-6 rounded-xl bg-[#f9f3ee] p-6">
              <Quote className="mb-2 size-6 text-[#8b5e5e]/40" />
              <p className="font-serif text-base italic text-foreground/80 leading-relaxed">
                Toda foto carrega um pedaco do tempo. Quando fotografo esses anjos
                de patas, sinto que a foto carrega tambem um pedaco de amor.
              </p>
            </div>

            {/* Studio info */}
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-[#8b5e5e]" />
              <span>Fracao do Tempo Studio &bull; Pinheiros, Sao Paulo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Gallery strip — 3 images
          ═══════════════════════════════════════════════ */}
      <section className="bg-[#8b5e5e] py-2">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden px-2">
          <div className="relative flex-1 aspect-[4/3] min-w-0">
            <Image
              src="/images/session-pocket.jpg"
              alt="Sessao Pocket"
              fill
              className="object-cover rounded-lg"
              sizes="33vw"
            />
          </div>
          <div className="relative flex-1 aspect-[4/3] min-w-0">
            <Image
              src="/images/session-estudio.jpg"
              alt="Sessao Estudio"
              fill
              className="object-cover rounded-lg"
              sizes="33vw"
            />
          </div>
          <div className="relative flex-1 aspect-[4/3] min-w-0">
            <Image
              src="/images/session-completa.jpg"
              alt="Sessao Completa"
              fill
              className="object-cover rounded-lg"
              sizes="33vw"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Como Funciona
          ═══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
          Como Funciona
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Em apenas 3 passos voce garante sua sessao fotografica exclusiva
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e] text-white shadow-lg">
              <span className="font-serif text-2xl font-bold">1</span>
            </div>
            <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">
              Cadastre-se
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Preencha o formulario abaixo com seus dados para garantir sua
              Sessao Pocket exclusiva.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e] text-white shadow-lg">
              <span className="font-serif text-2xl font-bold">2</span>
            </div>
            <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">
              Crie sua Conta
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse o site patasamorememorias.com.br e crie sua conta
              utilizando o mesmo email do cadastro.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#8b5e5e] text-white shadow-lg">
              <span className="font-serif text-2xl font-bold">3</span>
            </div>
            <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">
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
            className="bg-[#8b5e5e] hover:bg-[#7a5050] text-white text-base px-8 py-6"
            onClick={scrollToForm}
          >
            Cadastre-se Agora
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Success State
          ═══════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════
          Registration Form
          ═══════════════════════════════════════════════ */}
      {showForm && !success && (
        <section id="cadastro-cliente" className="bg-[#f9f3ee] px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card className="shadow-xl">
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

      {/* ═══════════════════════════════════════════════
          Footer
          ═══════════════════════════════════════════════ */}
      <footer className="bg-[#8b5e5e] px-4 py-8 text-center text-white/80">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="size-5" />
          <span className="font-serif font-bold">Patas, Amor e Memorias</span>
        </div>
        <p className="mt-2 text-sm">
          R. Claudio Soares, 72 - Pinheiros, Sao Paulo &middot; (11) 97105-3445
        </p>
        <p className="mt-1 text-xs text-white/60">
          &copy; 2026 Patas, Amor e Memorias. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
