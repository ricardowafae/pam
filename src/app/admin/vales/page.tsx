"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DateRangeFilter,
  type DateRange,
  isInRange,
  getDefault30DayRange,
} from "@/components/admin/DateRangeFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Gift,
  Search,
  Filter,
  Download,
  Eye,
  Ban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  Hash,
  Calendar,
  User,
  Package,
  Copy,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

type ValeStatus =
  | "ativo"
  | "utilizado"
  | "expirado"
  | "cancelado"
  | "a_vencer";

interface GiftCardRow {
  id: string;
  code: string;
  purchaser_name: string | null;
  purchaser_email: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  amount: number;
  balance: number;
  message: string | null;
  order_id: string | null;
  redeemed_by: string | null;
  redeemed_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  orders: {
    order_number: string | null;
    payment_method: string | null;
    created_at: string | null;
  } | null;
}

interface ValePresente {
  id: string;
  code: string;
  amount: number;
  balance: number;
  buyer: string;
  buyerEmail: string;
  recipient: string;
  recipientEmail: string;
  message: string | null;
  purchaseDate: string;
  expiryDate: string;
  redeemedAt: string | null;
  status: ValeStatus;
  paymentMethod: string;
  orderId: string;
  active: boolean;
}

/* ────────────────────── Helpers ────────────────────── */

function deriveStatus(row: GiftCardRow): ValeStatus {
  const now = new Date();
  if (!row.active) return "cancelado";
  if (row.redeemed_at) return "utilizado";
  if (row.expires_at && new Date(row.expires_at) < now) return "expirado";
  if (row.expires_at) {
    const days = Math.ceil(
      (new Date(row.expires_at).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (days > 0 && days <= 30) return "a_vencer";
  }
  return "ativo";
}

function mapRowToVale(row: GiftCardRow): ValePresente {
  return {
    id: row.id,
    code: row.code,
    amount: Number(row.amount) || 0,
    balance: Number(row.balance) || 0,
    buyer: row.purchaser_name || "—",
    buyerEmail: row.purchaser_email || "—",
    recipient: row.recipient_name || "—",
    recipientEmail: row.recipient_email || "—",
    message: row.message,
    purchaseDate: row.orders?.created_at || row.created_at,
    expiryDate: row.expires_at || "",
    redeemedAt: row.redeemed_at,
    status: deriveStatus(row),
    paymentMethod: row.orders?.payment_method || "—",
    orderId: row.orders?.order_number || "—",
    active: row.active,
  };
}

function getStatusConfig(status: ValeStatus) {
  switch (status) {
    case "ativo":
      return {
        label: "Ativo",
        variant: "default" as const,
        icon: CheckCircle2,
        color: "text-green-600",
      };
    case "utilizado":
      return {
        label: "Utilizado",
        variant: "secondary" as const,
        icon: CheckCircle2,
        color: "text-blue-600",
      };
    case "expirado":
      return {
        label: "Expirado",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      };
    case "cancelado":
      return {
        label: "Cancelado",
        variant: "outline" as const,
        icon: Ban,
        color: "text-gray-500",
      };
    case "a_vencer":
      return {
        label: "A Vencer",
        variant: "outline" as const,
        icon: AlertTriangle,
        color: "text-amber-600",
      };
  }
}

function formatDate(date: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: number): string {
  return value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function daysUntilExpiry(expiryDate: string): number {
  if (!expiryDate) return 0;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/* ────────────────────── Page ────────────────────── */

export default function GestaoValesPage() {
  const [vales, setVales] = useState<ValePresente[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ValeStatus | "todos">(
    "todos"
  );
  const [selectedVale, setSelectedVale] = useState<ValePresente | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());

  const supabase = createClient();

  /* ─── Fetch data ─── */
  const fetchVales = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gift_cards")
        .select(
          `
          id,
          code,
          purchaser_name,
          purchaser_email,
          recipient_name,
          recipient_email,
          amount,
          balance,
          message,
          order_id,
          redeemed_by,
          redeemed_at,
          expires_at,
          active,
          created_at,
          orders (
            order_number,
            payment_method,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data as unknown as GiftCardRow[]).map(mapRowToVale);
      setVales(mapped);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar vales";
      toast.error("Erro ao carregar vales", { description: message });
      console.error("fetchVales error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVales();
  }, [fetchVales]);

  /* ─── Actions ─── */
  const handleCancelVale = async (vale: ValePresente) => {
    setActionLoading(vale.id);
    try {
      const { error } = await supabase
        .from("gift_cards")
        .update({ active: false })
        .eq("id", vale.id);

      if (error) throw error;

      setVales((prev) =>
        prev.map((v) =>
          v.id === vale.id ? { ...v, active: false, status: "cancelado" } : v
        )
      );

      if (selectedVale?.id === vale.id) {
        setSelectedVale((prev) =>
          prev ? { ...prev, active: false, status: "cancelado" } : null
        );
      }

      toast.success("Vale cancelado com sucesso");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao cancelar vale";
      toast.error("Erro ao cancelar vale", { description: message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundVale = async (vale: ValePresente) => {
    setActionLoading(vale.id);
    try {
      const { error } = await supabase
        .from("gift_cards")
        .update({ active: false, balance: 0 })
        .eq("id", vale.id);

      if (error) throw error;

      setVales((prev) =>
        prev.map((v) =>
          v.id === vale.id
            ? { ...v, active: false, balance: 0, status: "cancelado" }
            : v
        )
      );

      if (selectedVale?.id === vale.id) {
        setSelectedVale((prev) =>
          prev
            ? { ...prev, active: false, balance: 0, status: "cancelado" }
            : null
        );
      }

      toast.success("Vale estornado com sucesso");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao estornar vale";
      toast.error("Erro ao estornar vale", { description: message });
    } finally {
      setActionLoading(null);
    }
  };

  /* ─── Computed KPIs (filtered by date range) ─── */
  const valesInRange = vales.filter((v) =>
    isInRange(v.purchaseDate, dateRange)
  );
  const totalEmitidos = valesInRange.length;
  const totalAtivos = valesInRange.filter((v) => v.status === "ativo").length;
  const totalUsados = valesInRange.filter(
    (v) => v.status === "utilizado"
  ).length;
  const totalVencidos = valesInRange.filter(
    (v) => v.status === "expirado"
  ).length;
  const totalCancelados = valesInRange.filter(
    (v) => v.status === "cancelado"
  ).length;
  const aVencer30dias = valesInRange.filter(
    (v) => v.status === "a_vencer"
  ).length;

  const valorTotalEmitido = valesInRange.reduce(
    (sum, v) => sum + v.amount,
    0
  );

  const taxaUtilizacao =
    totalEmitidos > 0
      ? ((totalUsados / totalEmitidos) * 100).toFixed(1)
      : "0";

  /* ─── Filtered list ─── */
  const filteredVales = vales.filter((vale) => {
    const matchesSearch =
      searchTerm === "" ||
      vale.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || vale.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Gestao de Vales
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe todos os vale-presentes emitidos, utilizados e vencidos
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {/* ─── Date Filter ─── */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* ─── KPI Dashboard ─── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Emitidos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {loading ? "—" : totalEmitidos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ativos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {loading ? "—" : totalAtivos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-blue-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Utilizados
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {loading ? "—" : totalUsados}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-red-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Expirados
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {loading ? "—" : totalVencidos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="size-4 text-gray-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cancelados
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-500">
              {loading ? "—" : totalCancelados}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                A Vencer (30d)
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {loading ? "—" : aVencer30dias}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Taxa Uso
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {loading ? "—" : `${taxaUtilizacao}%`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Valor Total Card ─── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="size-5 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Valor Total Emitido
              </p>
              <p className="text-xl font-bold text-foreground">
                {loading ? "—" : `R$ ${formatCurrency(valorTotalEmitido)}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Saldo restante: R${" "}
              {loading
                ? "—"
                : formatCurrency(
                    valesInRange
                      .filter(
                        (v) =>
                          v.status === "ativo" || v.status === "a_vencer"
                      )
                      .reduce((sum, v) => sum + v.balance, 0)
                  )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Filters ─── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por codigo, comprador, destinatario, email ou pedido..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ValeStatus | "todos")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="utilizado">Utilizado</option>
                <option value="expirado">Expirado</option>
                <option value="cancelado">Cancelado</option>
                <option value="a_vencer">A Vencer</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Table ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-foreground">
                Vales Emitidos
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Carregando..."
                  : `${filteredVales.length} vale(s) encontrado(s)`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={fetchVales}
              disabled={loading}
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Codigo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Comprador
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Destinatario
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Compra
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Validade
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Carregando vales...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredVales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <Gift className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {vales.length === 0
                          ? "Nenhum vale-presente cadastrado"
                          : "Nenhum vale encontrado com os filtros atuais"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVales.map((vale) => {
                    const statusCfg = getStatusConfig(vale.status);
                    const StatusIcon = statusCfg.icon;
                    const days = daysUntilExpiry(vale.expiryDate);
                    const isExpiringSoon =
                      (vale.status === "ativo" || vale.status === "a_vencer") &&
                      days > 0 &&
                      days <= 30;

                    return (
                      <TableRow
                        key={vale.id}
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                        onClick={() => setSelectedVale(vale)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-medium text-primary">
                              {vale.code}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(vale.code);
                                toast.success("Codigo copiado!");
                              }}
                              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">
                            R$ {formatCurrency(vale.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${
                              vale.balance < vale.amount
                                ? "text-amber-600"
                                : "text-foreground"
                            }`}
                          >
                            R$ {formatCurrency(vale.balance)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <p className="text-sm">{vale.buyer}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {vale.buyerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <p className="text-sm">{vale.recipient}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {vale.recipientEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">
                            {formatDate(vale.purchaseDate)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <span className="text-sm">
                              {formatDate(vale.expiryDate)}
                            </span>
                            {isExpiringSoon && (
                              <p className="text-[10px] font-medium text-amber-600">
                                {days} dia(s) restante(s)
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusCfg.variant}
                            className="gap-1 text-[10px]"
                          >
                            <StatusIcon className="size-3" />
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVale(vale);
                              }}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination placeholder */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Mostrando {filteredVales.length} de {vales.length} vales
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Pagina 1 de 1
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Detail Panel (modal-like) ─── */}
      {selectedVale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-foreground">
                  Detalhes do Vale
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setSelectedVale(null)}
                >
                  <XCircle className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Code + Status */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Hash className="size-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-bold text-primary">
                    {selectedVale.code}
                  </span>
                </div>
                <Badge
                  variant={getStatusConfig(selectedVale.status).variant}
                  className="gap-1"
                >
                  {(() => {
                    const Ic = getStatusConfig(selectedVale.status).icon;
                    return <Ic className="size-3" />;
                  })()}
                  {getStatusConfig(selectedVale.status).label}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Valor Original
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    R$ {formatCurrency(selectedVale.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Saldo Restante
                  </p>
                  <p
                    className={`mt-0.5 text-sm font-medium ${
                      selectedVale.balance < selectedVale.amount
                        ? "text-amber-600"
                        : "text-foreground"
                    }`}
                  >
                    R$ {formatCurrency(selectedVale.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Comprador
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {selectedVale.buyer}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedVale.buyerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Destinatario
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {selectedVale.recipient}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedVale.recipientEmail}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Data da Compra
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {formatDate(selectedVale.purchaseDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Validade
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {formatDate(selectedVale.expiryDate)}
                  </p>
                  {(selectedVale.status === "ativo" ||
                    selectedVale.status === "a_vencer") && (
                    <p className="text-[11px] text-muted-foreground">
                      {daysUntilExpiry(selectedVale.expiryDate)} dia(s)
                      restante(s)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Pagamento
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {selectedVale.paymentMethod === "pix"
                      ? "PIX"
                      : selectedVale.paymentMethod === "cartao" ||
                          selectedVale.paymentMethod === "credit_card"
                        ? "Cartao de Credito"
                        : selectedVale.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Pedido
                  </p>
                  <p className="mt-0.5 font-mono text-sm text-primary">
                    {selectedVale.orderId}
                  </p>
                </div>
                {selectedVale.message && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Mensagem
                    </p>
                    <p className="mt-0.5 text-sm italic text-foreground">
                      &ldquo;{selectedVale.message}&rdquo;
                    </p>
                  </div>
                )}
                {selectedVale.redeemedAt && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Data de Utilizacao
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {formatDate(selectedVale.redeemedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-border pt-4">
                {(selectedVale.status === "ativo" ||
                  selectedVale.status === "a_vencer") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={actionLoading === selectedVale.id}
                      onClick={() => handleCancelVale(selectedVale)}
                    >
                      {actionLoading === selectedVale.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Ban className="size-3.5" />
                      )}
                      Cancelar Vale
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={actionLoading === selectedVale.id}
                      onClick={() => handleRefundVale(selectedVale)}
                    >
                      {actionLoading === selectedVale.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3.5" />
                      )}
                      Estornar Vale
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedVale.code);
                    toast.success("Codigo copiado!");
                  }}
                >
                  <Copy className="size-3.5" />
                  Copiar Codigo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
