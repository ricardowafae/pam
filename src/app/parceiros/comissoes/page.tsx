"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Camera,
  CheckCircle,
  Clock,
  ImageIcon,
  Eye,
  X,
  MessageSquare,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  BanknoteIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────── */
type PaymentStatus = "Pago" | "Pendente" | "Processando";

interface SessionEntry {
  id: number;
  date: string;
  client: string;
  sessionType: string;
  orderId: string;
  value: number;
  commissionRate: number;
  commission: number;
}

interface MonthlyPeriod {
  id: string;
  label: string;             // e.g. "Marco 2026"
  periodLabel: string;       // e.g. "01/03/2026 a 31/03/2026"
  paymentDate: string;       // e.g. "05/04/2026"
  status: PaymentStatus;
  sessions: SessionEntry[];
  totalValue: number;
  totalCommission: number;
  receiptUrl?: string;
  paidAt?: string;
}

/* ── Config ────────────────────────────────────────── */
const statusConfig: Record<PaymentStatus, { color: string; icon: React.ElementType; label: string }> = {
  Pago: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Pago" },
  Pendente: { color: "bg-amber-100 text-amber-800", icon: Clock, label: "Pendente" },
  Processando: { color: "bg-blue-100 text-blue-800", icon: Clock, label: "Processando" },
};

/* ── Mock data ─────────────────────────────────────── */
const mockPeriods: MonthlyPeriod[] = [
  {
    id: "2026-03",
    label: "Marco 2026",
    periodLabel: "01/03/2026 a 31/03/2026",
    paymentDate: "05/04/2026",
    status: "Processando",
    totalValue: 3096,
    totalCommission: 928.80,
    sessions: [
      { id: 1, date: "10/03/2026", client: "Ana S.", sessionType: "Sessao Estudio", orderId: "#PAM-003-1", value: 699, commissionRate: 30, commission: 209.70 },
      { id: 2, date: "08/03/2026", client: "Carlos M.", sessionType: "Sessao Completa", orderId: "#PAM-012-1", value: 1299, commissionRate: 30, commission: 389.70 },
      { id: 3, date: "05/03/2026", client: "Mariana C.", sessionType: "Sessao Pocket", orderId: "#PAM-015-1", value: 399, commissionRate: 30, commission: 119.70 },
      { id: 4, date: "02/03/2026", client: "Roberto L.", sessionType: "Sessao Estudio", orderId: "#PAM-018-1", value: 699, commissionRate: 30, commission: 209.70 },
    ],
  },
  {
    id: "2026-02",
    label: "Fevereiro 2026",
    periodLabel: "01/02/2026 a 28/02/2026",
    paymentDate: "05/03/2026",
    status: "Pago",
    paidAt: "05/03/2026",
    receiptUrl: "/mock-receipt.jpg",
    totalValue: 1797,
    totalCommission: 539.10,
    sessions: [
      { id: 5, date: "28/02/2026", client: "Fernanda P.", sessionType: "Sessao Pocket", orderId: "#PAM-020-1", value: 399, commissionRate: 30, commission: 119.70 },
      { id: 6, date: "20/02/2026", client: "Paula S.", sessionType: "Sessao Estudio", orderId: "#PAM-010-1", value: 699, commissionRate: 30, commission: 209.70 },
      { id: 7, date: "14/02/2026", client: "Lucas R.", sessionType: "Sessao Estudio", orderId: "#PAM-008-1", value: 699, commissionRate: 30, commission: 209.70 },
    ],
  },
  {
    id: "2026-01",
    label: "Janeiro 2026",
    periodLabel: "01/01/2026 a 31/01/2026",
    paymentDate: "05/02/2026",
    status: "Pago",
    paidAt: "05/02/2026",
    receiptUrl: "/mock-receipt.jpg",
    totalValue: 2397,
    totalCommission: 719.10,
    sessions: [
      { id: 8, date: "25/01/2026", client: "Beatriz A.", sessionType: "Sessao Completa", orderId: "#PAM-005-1", value: 1299, commissionRate: 30, commission: 389.70 },
      { id: 9, date: "15/01/2026", client: "Diego F.", sessionType: "Sessao Pocket", orderId: "#PAM-002-1", value: 399, commissionRate: 30, commission: 119.70 },
      { id: 10, date: "08/01/2026", client: "Juliana T.", sessionType: "Sessao Estudio", orderId: "#PAM-001-1", value: 699, commissionRate: 30, commission: 209.70 },
    ],
  },
];

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ── Component ─────────────────────────────────────── */
export default function ComissoesPage() {
  const [expandedPeriods, setExpandedPeriods] = useState<string[]>([mockPeriods[0].id]);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [contestingId, setContestingId] = useState<string | null>(null);
  const [contestMessage, setContestMessage] = useState("");
  const [contestSent, setContestSent] = useState<string | null>(null);

  // Aggregate KPIs
  const totalSessions = mockPeriods.reduce((s, p) => s + p.sessions.length, 0);
  const totalValue = mockPeriods.reduce((s, p) => s + p.totalValue, 0);
  const totalCommission = mockPeriods.reduce((s, p) => s + p.totalCommission, 0);
  const pendingCommission = mockPeriods
    .filter((p) => p.status !== "Pago")
    .reduce((s, p) => s + p.totalCommission, 0);

  function togglePeriod(id: string) {
    setExpandedPeriods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleContest(periodId: string) {
    setContestSent(periodId);
    setContestingId(null);
    setContestMessage("");
    setTimeout(() => setContestSent(null), 4000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Comissoes
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas comissoes mensais e pagamentos.
        </p>
      </div>

      {/* Payment info banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Politica de Pagamento</p>
              <p className="mt-1 text-blue-700">
                Os pagamentos sao realizados <strong>1x por mes, todo dia 05</strong>,
                referente ao periodo de <strong>01 a {new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()} do mes anterior</strong>.
                As comissoes sao consolidadas mensalmente e o comprovante fica disponivel apos o pagamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sessoes Realizadas</p>
                <p className="text-2xl font-bold mt-1">{totalSessions}</p>
              </div>
              <Camera className="size-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Valor Total Sessoes</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="size-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Comissoes Pagas</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalCommission - pendingCommission)}</p>
              </div>
              <TrendingUp className="size-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Comissoes Pendentes</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{formatCurrency(pendingCommission)}</p>
              </div>
              <Clock className="size-8 text-amber-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Periods */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          Historico Mensal
        </h2>

        {mockPeriods.map((period) => {
          const isExpanded = expandedPeriods.includes(period.id);
          const cfg = statusConfig[period.status];
          const StatusIcon = cfg.icon;

          return (
            <Card key={period.id} className="overflow-hidden">
              {/* Month Header — always visible */}
              <button
                type="button"
                onClick={() => togglePeriod(period.id)}
                className="w-full text-left"
              >
                <CardHeader className="pb-3 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <BanknoteIcon className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{period.label}</CardTitle>
                        <CardDescription className="text-xs">
                          Periodo: {period.periodLabel} · Pagamento: {period.paymentDate}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{period.sessions.length} sessoes</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(period.totalCommission)}</p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", cfg.color)}>
                        <StatusIcon className="size-3" />
                        {cfg.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Sessoes</p>
                      <p className="text-lg font-bold">{period.sessions.length}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Valor Sessoes</p>
                      <p className="text-lg font-bold">{formatCurrency(period.totalValue)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Comissao (30%)</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(period.totalCommission)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">
                        {period.status === "Pago" ? "Pago em" : "Pagamento em"}
                      </p>
                      <p className="text-lg font-bold">
                        {period.paidAt || period.paymentDate}
                      </p>
                    </div>
                  </div>

                  {/* Sessions Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Sessao</TableHead>
                          <TableHead>Pedido</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Taxa</TableHead>
                          <TableHead className="text-right">Comissao</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {period.sessions.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="text-xs">{s.date}</TableCell>
                            <TableCell className="text-xs">{s.client}</TableCell>
                            <TableCell className="text-xs">{s.sessionType}</TableCell>
                            <TableCell className="text-xs font-mono">{s.orderId}</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(s.value)}</TableCell>
                            <TableCell className="text-xs text-right text-muted-foreground">{s.commissionRate}%</TableCell>
                            <TableCell className="text-xs text-right font-semibold">{formatCurrency(s.commission)}</TableCell>
                          </TableRow>
                        ))}
                        {/* Total row */}
                        <TableRow className="border-t-2 font-bold">
                          <TableCell colSpan={4} className="text-sm">
                            Total do Periodo
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(period.totalValue)}</TableCell>
                          <TableCell />
                          <TableCell className="text-right text-sm text-primary">{formatCurrency(period.totalCommission)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {period.receiptUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewingReceipt(period.id)}
                      >
                        <Eye className="size-3.5 text-green-600" />
                        Ver Comprovante
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                      onClick={() => setContestingId(contestingId === period.id ? null : period.id)}
                    >
                      <MessageSquare className="size-3" />
                      Contestar Periodo
                    </Button>
                  </div>

                  {/* Contest success */}
                  {contestSent === period.id && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
                      <CheckCircle className="size-4" />
                      Contestacao enviada com sucesso! A equipe analisara em ate 48h uteis.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Contest Form ─────── */}
      {contestingId && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                <MessageSquare className="size-4" />
                Contestar Periodo — {mockPeriods.find((p) => p.id === contestingId)?.label}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setContestingId(null)}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Motivo da contestacao *</Label>
              <Textarea
                value={contestMessage}
                onChange={(e) => setContestMessage(e.target.value)}
                placeholder="Descreva o motivo da contestacao deste periodo. Ex: Sessao ausente, valor incorreto, etc."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="gap-2"
                onClick={() => handleContest(contestingId)}
                disabled={!contestMessage.trim()}
              >
                <MessageSquare className="size-4" />
                Enviar Contestacao
              </Button>
              <Button variant="ghost" onClick={() => { setContestingId(null); setContestMessage(""); }}>
                Cancelar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              A contestacao sera analisada pela equipe administrativa em ate 48h uteis.
              Voce recebera uma notificacao com a resolucao.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Receipt Modal ─────────────────────────── */}
      {viewingReceipt && (() => {
        const period = mockPeriods.find((p) => p.id === viewingReceipt);
        if (!period) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    Comprovante de Pagamento
                  </CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => setViewingReceipt(null)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <CardDescription>
                  {period.label} — Pago em {period.paidAt}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-[4/3] rounded-lg bg-muted border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="size-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Imagem do comprovante</p>
                  <p className="text-xs text-muted-foreground">(inserido pela equipe administrativa)</p>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periodo:</span>
                    <span>{period.periodLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessoes no periodo:</span>
                    <span className="font-medium">{period.sessions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor total sessoes:</span>
                    <span>{formatCurrency(period.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comissao paga:</span>
                    <span className="font-semibold text-primary">{formatCurrency(period.totalCommission)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data do pagamento:</span>
                    <span>{period.paidAt}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setViewingReceipt(null)}>
                  Fechar
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
