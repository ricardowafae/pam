"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function EsqueciSenhaClientePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f4] px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#8b5e5e]">
              E-mail enviado!
            </h1>
            <p className="mt-3 text-sm text-[#8b5e5e]/70 leading-relaxed">
              Enviamos um link de recuperacao para{" "}
              <span className="font-medium text-[#8b5e5e]">{email}</span>.
              <br />
              Verifique sua caixa de entrada e clique no link para redefinir sua
              senha.
            </p>
            <p className="mt-2 text-xs text-[#8b5e5e]/50">
              Nao recebeu? Verifique a pasta de spam ou tente novamente em
              alguns minutos.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => setSent(false)}
              variant="outline"
              className="w-full border-[#8b5e5e]/20 text-[#8b5e5e] hover:bg-[#8b5e5e]/5"
            >
              <Mail className="size-4 mr-2" />
              Reenviar e-mail
            </Button>
            <Link
              href="/portalcliente/login"
              className="block text-sm text-[#8b5e5e]/70 underline underline-offset-4 hover:text-[#8b5e5e]"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf8f4] px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link
            href="/portalcliente/login"
            className="flex items-center gap-1 text-sm text-[#8b5e5e]/60 hover:text-[#8b5e5e] transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Voltar ao login
          </Link>
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold text-[#8b5e5e]">
              Esqueci minha senha
            </h1>
            <p className="mt-2 text-sm text-[#8b5e5e]/70">
              Informe seu e-mail para receber o link de recuperacao
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail cadastrado</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8b5e5e] text-white hover:bg-[#8b5e5e]/90"
            size="lg"
          >
            {loading ? "Enviando..." : "Enviar link de recuperacao"}
          </Button>
        </form>
      </div>
    </div>
  );
}
