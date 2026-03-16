"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Loader2,
  DollarSign,
  Megaphone,
  Camera,
  Info,
} from "lucide-react";
import type { CommissionRates } from "@/lib/commission-config";
import { DEFAULT_COMMISSION_RATES } from "@/lib/commission-config";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminComissoesPage() {
  const [rates, setRates] = useState<CommissionRates>(DEFAULT_COMMISSION_RATES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/commissions/rates");
      const data = await res.json();
      if (data.rates) {
        setRates(data.rates);
      }
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const updateInfluencer = (
    key: keyof CommissionRates["influencer"],
    value: string
  ) => {
    const num = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      influencer: { ...prev.influencer, [key]: num },
    }));
    setDirty(true);
  };

  const updatePhotographer = (
    key: keyof CommissionRates["photographer"],
    value: string
  ) => {
    const num = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      photographer: { ...prev.photographer, [key]: num },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/commissions/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao salvar comissoes.");
        return;
      }

      toast.success("Comissoes salvas com sucesso!");
      setDirty(false);
    } catch {
      toast.error("Erro ao salvar comissoes. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Comissoes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Defina os valores de comissao pagos a Influenciadores e Fotografos.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="gap-2 bg-[#8b5e5e] hover:bg-[#7a5050]"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Salvar
        </Button>
      </div>

      {/* Info banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Valores Tabelados</p>
              <p className="mt-1 text-blue-700">
                Os valores de comissao sao <strong>fixos por produto/sessao</strong> e
                iguais para todos os parceiros. Ao alterar um valor aqui, ele sera
                aplicado automaticamente nas paginas de convite e cadastro de
                parceiros.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Influencer commissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
              <Megaphone className="size-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg">
                Comissoes de Influenciadores
              </CardTitle>
              <CardDescription>
                Valor fixo pago por cada venda concluida atraves do link do
                influenciador.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-sm font-medium">Dogbook</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Por unidade vendida
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.influencer.dogbook}
                  onChange={(e) => updateInfluencer("dogbook", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Sessao Pocket</Label>
              <p className="mb-2 text-xs text-muted-foreground">Por venda</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.influencer.pocket}
                  onChange={(e) => updateInfluencer("pocket", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Sessao Estudio</Label>
              <p className="mb-2 text-xs text-muted-foreground">Por venda</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.influencer.estudio}
                  onChange={(e) => updateInfluencer("estudio", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Sessao Completa</Label>
              <p className="mb-2 text-xs text-muted-foreground">Por venda</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.influencer.completa}
                  onChange={(e) => updateInfluencer("completa", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Preview */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Previa dos valores (como aparece na pagina de convite)
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { label: "Dogbook", key: "dogbook" as const },
                  { label: "Pocket", key: "pocket" as const },
                  { label: "Estudio", key: "estudio" as const },
                  { label: "Completa", key: "completa" as const },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border bg-[#f9f3ee] p-3 text-center"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold text-[#8b5e5e]">
                    R$ {formatBRL(rates.influencer[item.key])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photographer commissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
              <Camera className="size-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg">
                Comissoes de Fotografos
              </CardTitle>
              <CardDescription>
                Valor fixo pago por cada sessao fotografica concluida.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <Label className="text-sm font-medium">Sessao Pocket</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Por sessao concluida
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.photographer.pocket}
                  onChange={(e) => updatePhotographer("pocket", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Sessao Estudio</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Por sessao concluida
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.photographer.estudio}
                  onChange={(e) => updatePhotographer("estudio", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Sessao Completa</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Por sessao concluida
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rates.photographer.completa}
                  onChange={(e) =>
                    updatePhotographer("completa", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Preview */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Previa dos valores (como aparece na pagina de convite)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { label: "Pocket", key: "pocket" as const },
                  { label: "Estudio", key: "estudio" as const },
                  { label: "Completa", key: "completa" as const },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border bg-[#f9f3ee] p-3 text-center"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold text-[#8b5e5e]">
                    R$ {formatBRL(rates.photographer[item.key])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom save bar (sticky for long pages) */}
      {dirty && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg border bg-white p-4 shadow-lg">
          <p className="text-sm text-muted-foreground">
            <DollarSign className="mr-1 inline size-4" />
            Voce tem alteracoes nao salvas.
          </p>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-[#8b5e5e] hover:bg-[#7a5050]"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar Alteracoes
          </Button>
        </div>
      )}
    </div>
  );
}
