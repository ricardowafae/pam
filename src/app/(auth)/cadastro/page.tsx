"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building2, ArrowLeft, Info } from "lucide-react";

type PersonType = "PF" | "PJ";

export default function CadastroPage() {
  const router = useRouter();

  /* Step 1: Choose PF or PJ */
  const [personType, setPersonType] = useState<PersonType | null>(null);

  /* Common fields */
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");

  /* PF fields */
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");

  /* PJ fields */
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const displayName =
      personType === "PF" ? nome : nomeFantasia || razaoSocial;

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
            role: "cliente",
            person_type: personType,
            ...(personType === "PF"
              ? { cpf }
              : { cnpj, razao_social: razaoSocial, nome_fantasia: nomeFantasia }),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/portalcliente");
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 1: Person Type Selection ──────────────── */
  if (!personType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f4] px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold text-[#8b5e5e]">
              Criar Conta
            </h1>
            <p className="mt-2 text-sm text-[#8b5e5e]/70">
              Selecione o tipo de cadastro para continuar
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setPersonType("PF")}
              className="w-full rounded-xl border-2 border-[#8b5e5e]/20 bg-white p-6 text-left transition-all hover:border-[#8b5e5e] hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-[#8b5e5e] group-hover:bg-[#8b5e5e] group-hover:text-white transition-colors">
                  <User className="size-6" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-[#8b5e5e]">
                    Pessoa Fisica
                  </p>
                  <p className="text-sm text-[#8b5e5e]/60">
                    Cadastro com CPF para pessoa fisica
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPersonType("PJ")}
              className="w-full rounded-xl border-2 border-[#8b5e5e]/20 bg-white p-6 text-left transition-all hover:border-[#8b5e5e] hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-[#8b5e5e] group-hover:bg-[#8b5e5e] group-hover:text-white transition-colors">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-[#8b5e5e]">
                    Pessoa Juridica
                  </p>
                  <p className="text-sm text-[#8b5e5e]/60">
                    Cadastro com CNPJ para empresas
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-lg border border-[#8b5e5e]/20 bg-[#8b5e5e]/5 p-4">
            <Info className="size-4 text-[#8b5e5e] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8b5e5e]/70">
              Cadastros PF e PJ sao independentes. Caso deseje operar como
              ambos, crie cadastros separados com logins distintos.
            </p>
          </div>

          <div className="text-center text-sm text-[#8b5e5e]/70">
            <p>
              Ja tem uma conta?{" "}
              <Link
                href="/portalcliente/login"
                className="font-medium text-[#8b5e5e] underline underline-offset-4 hover:text-[#8b5e5e]/80"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Registration Form ──────────────────── */
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf8f4] px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <button
            onClick={() => setPersonType(null)}
            className="flex items-center gap-1 text-sm text-[#8b5e5e]/60 hover:text-[#8b5e5e] transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5e5e]/20 bg-[#8b5e5e]/5 px-4 py-1.5 mb-4">
              {personType === "PF" ? (
                <User className="size-4 text-[#8b5e5e]" />
              ) : (
                <Building2 className="size-4 text-[#8b5e5e]" />
              )}
              <span className="text-sm font-medium text-[#8b5e5e]">
                {personType === "PF" ? "Pessoa Fisica" : "Pessoa Juridica"}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#8b5e5e]">
              Criar Conta
            </h1>
            <p className="mt-2 text-sm text-[#8b5e5e]/70">
              Preencha seus dados para continuar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* PF-specific fields */}
          {personType === "PF" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* PJ-specific fields */}
          {personType === "PJ" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razao Social *</Label>
                <Input
                  id="razaoSocial"
                  type="text"
                  placeholder="Nome da empresa"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  type="text"
                  placeholder="Nome fantasia da empresa"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Common fields */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(11) 99999-1234"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crie uma senha (min. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8b5e5e] text-white hover:bg-[#8b5e5e]/90"
            size="lg"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <div className="text-center text-sm text-[#8b5e5e]/70">
          <p>
            Ja tem uma conta?{" "}
            <Link
              href="/portalcliente/login"
              className="font-medium text-[#8b5e5e] underline underline-offset-4 hover:text-[#8b5e5e]/80"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
