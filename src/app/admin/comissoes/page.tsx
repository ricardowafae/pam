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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Save,
  Loader2,
  DollarSign,
  Megaphone,
  Camera,
  Info,
  Mail,
  Send,
  Tag,
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
  const [notifying, setNotifying] = useState<"photographer" | "influencer" | null>(null);
  const [confirmNotify, setConfirmNotify] = useState<"photographer" | "influencer" | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/commissions/rates");
      const data = await res.json();
      if (data.rates) {
        setRates({
          ...DEFAULT_COMMISSION_RATES,
          ...data.rates,
          sessionPricing: {
            ...DEFAULT_COMMISSION_RATES.sessionPricing,
            ...(data.rates.sessionPricing || {}),
          },
        });
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

  const updateInfluencer = (key: keyof CommissionRates["influencer"], value: string) => {
    const num = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      influencer: { ...prev.influencer, [key]: num },
    }));
    setDirty(true);
  };

  const updatePhotographer = (key: keyof CommissionRates["photographer"], value: string) => {
    const num = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      photographer: { ...prev.photographer, [key]: num },
    }));
    setDirty(true);
  };

  const updateSessionPricing = (key: keyof CommissionRates["sessionPricing"], value: string) => {
    const num = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      sessionPricing: { ...prev.sessionPricing, [key]: num },
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
      toast.success("Comissoes e precos salvos com sucesso!");
      setDirty(false);
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleNotify = async (type: "photographer" | "influencer") => {
    setConfirmNotify(null);
    setNotifying(type);
    try {
      const res = await fetch("/api/commissions/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao enviar notificacoes.");
        return;
      }
      const label = type === "photographer" ? "fotografos" : "influenciadores";
      toast.success(`Notificacao enviada para ${data.sent} ${label}!`);
    } catch {
      toast.error("Erro ao enviar notificacoes. Tente novamente.");
    } finally {
      setNotifying(null);
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
            Comissoes e Precos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Defina precos de sessao e valores de comissao para Fotografos e Influenciadores.
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
                Todos os valores definidos aqui sao <strong>globais</strong> e
                se aplicam igualmente a todos os parceiros. Ao alterar um valor,
                ele sera refletido nos modais de cadastro e nas paginas de convite.
                Comissoes ja geradas <strong>nao serao afetadas</strong> — apenas
                novas vendas e sessoes usarao os novos valores.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="fotografos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fotografos" className="gap-2">
            <Camera className="size-4" />
            Fotografos
          </TabsTrigger>
          <TabsTrigger value="influenciadores" className="gap-2">
            <Megaphone className="size-4" />
            Influenciadores
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB: FOTÓGRAFOS ═══════════════ */}
        <TabsContent value="fotografos" className="space-y-6">
          {/* Session Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                  <Tag className="size-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg">
                    Precos de Sessao Fotografica
                  </CardTitle>
                  <CardDescription>
                    Valor cobrado do cliente por cada tipo de sessao. Esses valores
                    aparecem no modal de cadastro de fotografos (somente leitura).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {(
                  [
                    { label: "Sessao Pocket", key: "pocket" as const, desc: "Sessao rapida ao ar livre" },
                    { label: "Sessao Estudio", key: "estudio" as const, desc: "Sessao em estudio profissional" },
                    { label: "Sessao Completa", key: "completa" as const, desc: "Pacote completo com cenarios" },
                  ] as const
                ).map((item) => (
                  <div key={item.key}>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="mb-2 text-xs text-muted-foreground">{item.desc}</p>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rates.sessionPricing[item.key]}
                        onChange={(e) => updateSessionPricing(item.key, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Preview */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                  Previa — precos de sessao
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
                        R$ {formatBRL(rates.sessionPricing[item.key])}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photographer Commissions */}
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
                    Valor fixo pago ao fotografo por cada sessao concluida.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {(
                  [
                    { label: "Sessao Pocket", key: "pocket" as const },
                    { label: "Sessao Estudio", key: "estudio" as const },
                    { label: "Sessao Completa", key: "completa" as const },
                  ] as const
                ).map((item) => (
                  <div key={item.key}>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="mb-2 text-xs text-muted-foreground">Por sessao concluida</p>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rates.photographer[item.key]}
                        onChange={(e) => updatePhotographer(item.key, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div>
                <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                  Previa — comissao do fotografo (como aparece no convite)
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

          {/* Notify photographers */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Notificar Fotografos
                  </p>
                  <p className="text-xs text-amber-700">
                    Envia um e-mail para todos os fotografos ativos com os valores
                    atuais de comissao e precos de sessao.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                disabled={notifying === "photographer" || dirty}
                onClick={() => setConfirmNotify("photographer")}
              >
                {notifying === "photographer" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Enviar E-mail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: INFLUENCIADORES ═══════════════ */}
        <TabsContent value="influenciadores" className="space-y-6">
          {/* Influencer Commissions */}
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
                    Valor fixo pago ao influenciador por cada venda concluida
                    atraves do seu link de indicacao.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    { label: "Dogbook", key: "dogbook" as const, desc: "Por unidade vendida" },
                    { label: "Sessao Pocket", key: "pocket" as const, desc: "Por venda" },
                    { label: "Sessao Estudio", key: "estudio" as const, desc: "Por venda" },
                    { label: "Sessao Completa", key: "completa" as const, desc: "Por venda" },
                  ] as const
                ).map((item) => (
                  <div key={item.key}>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="mb-2 text-xs text-muted-foreground">{item.desc}</p>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rates.influencer[item.key]}
                        onChange={(e) => updateInfluencer(item.key, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div>
                <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                  Previa — comissao do influenciador (como aparece no convite)
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

          {/* Notify influencers */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Notificar Influenciadores
                  </p>
                  <p className="text-xs text-amber-700">
                    Envia um e-mail para todos os influenciadores ativos com os
                    valores atuais de comissao.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                disabled={notifying === "influencer" || dirty}
                onClick={() => setConfirmNotify("influencer")}
              >
                {notifying === "influencer" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Enviar E-mail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
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

      {/* Confirm notify dialog */}
      <Dialog open={!!confirmNotify} onOpenChange={(open) => !open && setConfirmNotify(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5 text-amber-600" />
              Confirmar Envio de Notificacao
            </DialogTitle>
            <DialogDescription>
              {confirmNotify === "photographer"
                ? "Tem certeza que deseja enviar um e-mail para todos os fotografos ativos com os valores atuais de comissao e precos de sessao?"
                : "Tem certeza que deseja enviar um e-mail para todos os influenciadores ativos com os valores atuais de comissao?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmNotify(null)}>
              Cancelar
            </Button>
            <Button
              className="gap-2 bg-[#8b5e5e] hover:bg-[#7a5050]"
              onClick={() => confirmNotify && handleNotify(confirmNotify)}
            >
              <Send className="size-4" />
              Confirmar Envio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
