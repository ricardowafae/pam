"use client";

import { useState } from "react";
import { PawPrint, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Implement Supabase auth
      console.log("Admin login:", { email, password });
    } catch {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf8f4] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawPrint className="size-8 text-[#8b5e5e]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#8b5e5e]">
            Painel Administrativo
          </h1>
          <p className="text-sm text-[#8b5e5e]/60">
            Acesse o painel de gestão
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#8b5e5e]">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@patasamorememorias.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[#8b5e5e]/20 focus:border-[#8b5e5e]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#8b5e5e]">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#8b5e5e]/20 focus:border-[#8b5e5e]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8b5e5e] hover:bg-[#7a5050] text-white"
          >
            <Lock className="size-4 mr-2" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-[#8b5e5e]/60 hover:text-[#8b5e5e] transition-colors"
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
