"use client";

import { useState } from "react";
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
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

type ValeStatus =
  | "ativo"
  | "usado"
  | "vencido"
  | "cancelado"
  | "a_vencer";

interface ValePresente {
  id: string;
  code: string;
  product: string;
  couponValue: string;
  discountType: "valor" | "100_off";
  buyer: string;
  buyerEmail: string;
  recipient: string;
  recipientEmail: string;
  purchaseDate: string;
  expiryDate: string;
  usedDate: string | null;
  status: ValeStatus;
  paymentMethod: "cartao" | "pix";
  orderId: string;
}

/* ────────────────────── Mock Data ────────────────────── */

const mockVales: ValePresente[] = [
  {
    id: "1",
    code: "VP-DGB-A1B2C3",
    product: "Dogbook",
    couponValue: "R$ 200,00",
    discountType: "valor",
    buyer: "Ana Souza",
    buyerEmail: "ana@email.com",
    recipient: "Carlos Mendes",
    recipientEmail: "carlos@email.com",
    purchaseDate: "2026-01-15",
    expiryDate: "2027-01-10",
    usedDate: null,
    status: "ativo",
    paymentMethod: "pix",
    orderId: "PED-001234",
  },
  {
    id: "2",
    code: "VP-SPK-D4E5F6",
    product: "Sessao Pocket",
    couponValue: "R$ 300,00",
    discountType: "valor",
    buyer: "Fernanda Lima",
    buyerEmail: "fernanda@email.com",
    recipient: "Mariana Costa",
    recipientEmail: "mariana@email.com",
    purchaseDate: "2026-02-20",
    expiryDate: "2027-02-15",
    usedDate: "2026-03-05",
    status: "usado",
    paymentMethod: "cartao",
    orderId: "PED-001289",
  },
  {
    id: "3",
    code: "VP-DGB-G7H8I9",
    product: "Dogbook",
    couponValue: "R$ 50,00",
    discountType: "valor",
    buyer: "Pedro Santos",
    buyerEmail: "pedro@email.com",
    recipient: "Julia Oliveira",
    recipientEmail: "julia@email.com",
    purchaseDate: "2025-02-01",
    expiryDate: "2026-01-27",
    usedDate: null,
    status: "vencido",
    paymentMethod: "pix",
    orderId: "PED-000987",
  },
  {
    id: "4",
    code: "VP-EST-J1K2L3",
    product: "Sessao Estudio",
    couponValue: "R$ 900,00",
    discountType: "valor",
    buyer: "Roberto Almeida",
    buyerEmail: "roberto@email.com",
    recipient: "Camila Dias",
    recipientEmail: "camila@email.com",
    purchaseDate: "2026-03-01",
    expiryDate: "2027-02-24",
    usedDate: null,
    status: "ativo",
    paymentMethod: "cartao",
    orderId: "PED-001345",
  },
  {
    id: "5",
    code: "VP-CMP-M4N5O6",
    product: "Sessao Completa",
    couponValue: "100% OFF",
    discountType: "100_off",
    buyer: "Lucia Ferreira",
    buyerEmail: "lucia@email.com",
    recipient: "Marcos Silva",
    recipientEmail: "marcos@email.com",
    purchaseDate: "2026-02-10",
    expiryDate: "2027-02-05",
    usedDate: null,
    status: "ativo",
    paymentMethod: "pix",
    orderId: "PED-001301",
  },
  {
    id: "6",
    code: "VP-DGB-P7Q8R9",
    product: "Dogbook",
    couponValue: "R$ 100,00",
    discountType: "valor",
    buyer: "Tatiana Rocha",
    buyerEmail: "tatiana@email.com",
    recipient: "Gabriel Lopes",
    recipientEmail: "gabriel@email.com",
    purchaseDate: "2026-03-10",
    expiryDate: "2027-03-06",
    usedDate: null,
    status: "a_vencer",
    paymentMethod: "cartao",
    orderId: "PED-001390",
  },
  {
    id: "7",
    code: "VP-SPK-S1T2U3",
    product: "Sessao Pocket",
    couponValue: "R$ 100,00",
    discountType: "valor",
    buyer: "Amanda Ribeiro",
    buyerEmail: "amanda@email.com",
    recipient: "Diego Nunes",
    recipientEmail: "diego@email.com",
    purchaseDate: "2026-01-05",
    expiryDate: "2026-12-31",
    usedDate: null,
    status: "cancelado",
    paymentMethod: "pix",
    orderId: "PED-001200",
  },
  {
    id: "8",
    code: "VP-EST-V4W5X6",
    product: "Sessao Estudio",
    couponValue: "R$ 500,00",
    discountType: "valor",
    buyer: "Ricardo Martins",
    buyerEmail: "ricardo@email.com",
    recipient: "Patricia Gomes",
    recipientEmail: "patricia@email.com",
    purchaseDate: "2026-02-28",
    expiryDate: "2027-02-23",
    usedDate: "2026-03-12",
    status: "usado",
    paymentMethod: "cartao",
    orderId: "PED-001333",
  },
  {
    id: "9",
    code: "VP-CMP-Y7Z8A1",
    product: "Sessao Completa",
    couponValue: "R$ 800,00",
    discountType: "valor",
    buyer: "Empresa PetShop Amor",
    buyerEmail: "contato@petshopamor.com",
    recipient: "Claudia Torres",
    recipientEmail: "claudia@email.com",
    purchaseDate: "2026-03-08",
    expiryDate: "2027-03-03",
    usedDate: null,
    status: "ativo",
    paymentMethod: "pix",
    orderId: "PED-001378",
  },
  {
    id: "10",
    code: "VP-DGB-B2C3D4",
    product: "Dogbook",
    couponValue: "R$ 200,00",
    discountType: "valor",
    buyer: "Empresa PetShop Amor",
    buyerEmail: "contato@petshopamor.com",
    recipient: "Fabiana Luz",
    recipientEmail: "fabiana@email.com",
    purchaseDate: "2026-03-08",
    expiryDate: "2027-03-03",
    usedDate: null,
    status: "ativo",
    paymentMethod: "pix",
    orderId: "PED-001379",
  },
  {
    id: "11",
    code: "VP-SPK-E5F6G7",
    product: "Sessao Pocket",
    couponValue: "R$ 200,00",
    discountType: "valor",
    buyer: "Helena Braga",
    buyerEmail: "helena@email.com",
    recipient: "Renato Pires",
    recipientEmail: "renato@email.com",
    purchaseDate: "2025-06-15",
    expiryDate: "2026-06-10",
    usedDate: "2025-12-20",
    status: "usado",
    paymentMethod: "cartao",
    orderId: "PED-000850",
  },
  {
    id: "12",
    code: "VP-DGB-H8I9J0",
    product: "Dogbook",
    couponValue: "100% OFF",
    discountType: "100_off",
    buyer: "Empresa VetCare",
    buyerEmail: "compras@vetcare.com",
    recipient: "Simone Carvalho",
    recipientEmail: "simone@email.com",
    purchaseDate: "2026-01-20",
    expiryDate: "2027-01-15",
    usedDate: null,
    status: "ativo",
    paymentMethod: "pix",
    orderId: "PED-001250",
  },
];

/* ────────────────────── Helpers ────────────────────── */

function getStatusConfig(status: ValeStatus) {
  switch (status) {
    case "ativo":
      return {
        label: "Ativo",
        variant: "default" as const,
        icon: CheckCircle2,
        color: "text-green-600",
      };
    case "usado":
      return {
        label: "Usado",
        variant: "secondary" as const,
        icon: CheckCircle2,
        color: "text-blue-600",
      };
    case "vencido":
      return {
        label: "Vencido",
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
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/* ────────────────────── Page ────────────────────── */

export default function GestaoValesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ValeStatus | "todos">(
    "todos"
  );
  const [productFilter, setProductFilter] = useState<string>("todos");
  const [selectedVale, setSelectedVale] = useState<ValePresente | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());

  /* ─── Computed KPIs (filtered by date range) ─── */
  const valesInRange = mockVales.filter((v) => isInRange(v.purchaseDate, dateRange));
  const totalEmitidos = valesInRange.length;
  const totalAtivos = valesInRange.filter((v) => v.status === "ativo").length;
  const totalUsados = valesInRange.filter((v) => v.status === "usado").length;
  const totalVencidos = valesInRange.filter((v) => v.status === "vencido").length;
  const totalCancelados = valesInRange.filter(
    (v) => v.status === "cancelado"
  ).length;
  const aVencer30dias = valesInRange.filter((v) => {
    if (v.status !== "ativo") return false;
    const days = daysUntilExpiry(v.expiryDate);
    return days > 0 && days <= 30;
  }).length;

  const valorTotalEmitido = valesInRange
    .filter((v) => v.discountType === "valor")
    .reduce((sum, v) => {
      const num = parseFloat(
        v.couponValue.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
      );
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  const taxaUtilizacao =
    totalEmitidos > 0
      ? ((totalUsados / totalEmitidos) * 100).toFixed(1)
      : "0";

  /* ─── Filtered list ─── */
  const filteredVales = mockVales.filter((vale) => {
    const matchesSearch =
      searchTerm === "" ||
      vale.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vale.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || vale.status === statusFilter;

    const matchesProduct =
      productFilter === "todos" || vale.product === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  const products = [...new Set(mockVales.map((v) => v.product))];

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
              {totalEmitidos}
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
              {totalAtivos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-blue-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Usados
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalUsados}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-red-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Vencidos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {totalVencidos}
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
              {totalCancelados}
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
              {aVencer30dias}
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
              {taxaUtilizacao}%
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
                Valor Total Emitido (cupons de desconto)
              </p>
              <p className="text-xl font-bold text-foreground">
                R${" "}
                {valorTotalEmitido
                  .toFixed(2)
                  .replace(".", ",")
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              +{" "}
              {mockVales.filter((v) => v.discountType === "100_off").length}{" "}
              vale(s) 100% OFF
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
                <option value="usado">Usado</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
                <option value="a_vencer">A Vencer</option>
              </select>

              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todos os Produtos</option>
                {products.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
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
                {filteredVales.length} vale(s) encontrado(s)
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="size-8">
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Codigo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Valor</TableHead>
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
                {filteredVales.map((vale) => {
                  const statusCfg = getStatusConfig(vale.status);
                  const StatusIcon = statusCfg.icon;
                  const days = daysUntilExpiry(vale.expiryDate);
                  const isExpiringSoon =
                    vale.status === "ativo" && days > 0 && days <= 30;

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
                            }}
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Package className="size-3.5 text-muted-foreground" />
                          <span className="text-sm">{vale.product}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-medium ${
                            vale.discountType === "100_off"
                              ? "text-purple-700"
                              : "text-foreground"
                          }`}
                        >
                          {vale.couponValue}
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
                })}

                {filteredVales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <Gift className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Nenhum vale encontrado com os filtros atuais
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination placeholder */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Mostrando {filteredVales.length} de {mockVales.length} vales
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="size-7" disabled>
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Pagina 1 de 1
              </span>
              <Button variant="outline" size="icon" className="size-7" disabled>
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
                    Produto
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {selectedVale.product}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Valor do Cupom
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {selectedVale.couponValue}
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
                  {selectedVale.status === "ativo" && (
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
                      : "Cartao de Credito"}
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
                {selectedVale.usedDate && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Data de Uso
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {formatDate(selectedVale.usedDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-border pt-4">
                {selectedVale.status === "ativo" && (
                  <>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Ban className="size-3.5" />
                      Cancelar Vale
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <RefreshCw className="size-3.5" />
                      Reenviar Email
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => navigator.clipboard.writeText(selectedVale.code)}
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
