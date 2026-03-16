"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DateRangeFilter,
  type DateRange,
  isInRange,
  getDefault30DayRange,
} from "@/components/admin/DateRangeFilter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ShoppingBag,
  DollarSign,
  AlertCircle,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

type OrderStage =
  | "Aguardando Pagamento"
  | "Aguardando Fotos"
  | "Aprovacao Layout"
  | "Em Producao"
  | "Enviado"
  | "Entregue";

type PaymentStatus = "Pago" | "Pendente" | "Reembolsado";

interface DogbookItem {
  subId: string;        // e.g. "#PAM-001-1"
  theme: string;
  petName: string;
  stage: OrderStage;    // each sub-order has its own stage
  tracking: string;
  nf: string;
}

interface Order {
  id: string;           // e.g. "#PAM-001"
  client: string;
  email: string;
  date: string;
  items: DogbookItem[];
  total: string;
  payment: PaymentStatus;
  influencer: string;
  coupon: string;
}

/* ────────────────────── Mock Data ────────────────────── */

const initialOrders: Order[] = [
  {
    id: "#PAM-001",
    client: "Ana Souza",
    email: "ana@email.com",
    date: "2026-03-10",
    items: [
      { subId: "#PAM-001-1", theme: "Verao", petName: "Thor", stage: "Em Producao", tracking: "BR123456789", nf: "NF-001234" },
    ],
    total: "R$ 490,00",
    payment: "Pago",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#PAM-002",
    client: "Carlos Mendes",
    email: "carlos@email.com",
    date: "2026-03-09",
    items: [
      { subId: "#PAM-002-1", theme: "Natal", petName: "Luna", stage: "Aprovacao Layout", tracking: "-", nf: "-" },
      { subId: "#PAM-002-2", theme: "Caoniversario", petName: "Luna", stage: "Aguardando Fotos", tracking: "-", nf: "-" },
    ],
    total: "R$ 931,00",
    payment: "Pago",
    influencer: "Camila Pet",
    coupon: "CAMILA10",
  },
  {
    id: "#PAM-003",
    client: "Fernanda Lima",
    email: "fernanda@email.com",
    date: "2026-03-08",
    items: [
      { subId: "#PAM-003-1", theme: "Inverno", petName: "Max", stage: "Aprovacao Layout", tracking: "-", nf: "-" },
    ],
    total: "R$ 490,00",
    payment: "Pago",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#PAM-004",
    client: "Mariana Costa",
    email: "mariana@email.com",
    date: "2026-03-05",
    items: [
      { subId: "#PAM-004-1", theme: "Caoniversario", petName: "Mel", stage: "Enviado", tracking: "BR987654321", nf: "NF-001237" },
      { subId: "#PAM-004-2", theme: "Verao", petName: "Bob", stage: "Em Producao", tracking: "-", nf: "-" },
      { subId: "#PAM-004-3", theme: "Natal", petName: "Mel", stage: "Aguardando Fotos", tracking: "-", nf: "-" },
    ],
    total: "R$ 1.323,00",
    payment: "Pago",
    influencer: "Doglovers SP",
    coupon: "DOG15",
  },
  {
    id: "#PAM-005",
    client: "Pedro Santos",
    email: "pedro@email.com",
    date: "2026-02-28",
    items: [
      { subId: "#PAM-005-1", theme: "Ano Novo", petName: "Pipoca", stage: "Entregue", tracking: "BR456789123", nf: "NF-001238" },
    ],
    total: "R$ 490,00",
    payment: "Pago",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#PAM-006",
    client: "Rodrigo Alves",
    email: "rodrigo@email.com",
    date: "2026-03-12",
    items: [
      { subId: "#PAM-006-1", theme: "Verao", petName: "Simba", stage: "Aguardando Pagamento", tracking: "-", nf: "-" },
      { subId: "#PAM-006-2", theme: "Inverno", petName: "Simba", stage: "Aguardando Pagamento", tracking: "-", nf: "-" },
    ],
    total: "R$ 931,00",
    payment: "Pendente",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#PAM-007",
    client: "Juliana Ferreira",
    email: "juliana@email.com",
    date: "2026-03-11",
    items: [
      { subId: "#PAM-007-1", theme: "Natal", petName: "Amora", stage: "Entregue", tracking: "BR111222333", nf: "NF-001240" },
      { subId: "#PAM-007-2", theme: "Verao", petName: "Amora", stage: "Em Producao", tracking: "-", nf: "-" },
      { subId: "#PAM-007-3", theme: "Caoniversario", petName: "Flor", stage: "Aprovacao Layout", tracking: "-", nf: "-" },
      { subId: "#PAM-007-4", theme: "Inverno", petName: "Flor", stage: "Aguardando Fotos", tracking: "-", nf: "-" },
    ],
    total: "R$ 1.764,00",
    payment: "Pago",
    influencer: "Vida Animal",
    coupon: "VIDA5",
  },
];

/* ────────────────────── Helpers ────────────────────── */

const allStages: OrderStage[] = [
  "Aguardando Pagamento",
  "Aguardando Fotos",
  "Aprovacao Layout",
  "Em Producao",
  "Enviado",
  "Entregue",
];

function stageBadgeVariant(stage: string) {
  switch (stage) {
    case "Entregue":
      return "default" as const;
    case "Enviado":
      return "secondary" as const;
    case "Em Producao":
    case "Aprovacao Layout":
      return "outline" as const;
    case "Aguardando Fotos":
    case "Aguardando Pagamento":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function stageColor(stage: string) {
  switch (stage) {
    case "Entregue":
      return "text-green-700 bg-green-50";
    case "Enviado":
      return "text-purple-700 bg-purple-50";
    case "Em Producao":
      return "text-blue-700 bg-blue-50";
    case "Aprovacao Layout":
      return "text-yellow-700 bg-yellow-50";
    case "Aguardando Fotos":
      return "text-orange-700 bg-orange-50";
    case "Aguardando Pagamento":
      return "text-red-700 bg-red-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Derive a summary stage for the order based on its items' individual stages */
function deriveOrderStage(items: DogbookItem[]): string {
  const stageOrder = allStages;
  let earliestIdx = stageOrder.length - 1;
  for (const item of items) {
    const idx = stageOrder.indexOf(item.stage);
    if (idx !== -1 && idx < earliestIdx) earliestIdx = idx;
  }
  return stageOrder[earliestIdx];
}

const stageIcons: Record<string, typeof Clock> = {
  "Aguardando Pagamento": Clock,
  "Aguardando Fotos": FileText,
  "Aprovacao Layout": Eye,
  "Em Producao": Package,
  "Enviado": Truck,
  "Entregue": CheckCircle,
};

const kanbanColumns = [
  { title: "Aguardando Pagamento" as OrderStage, color: "border-red-300" },
  { title: "Aguardando Fotos" as OrderStage, color: "border-orange-300" },
  { title: "Aprovacao Layout" as OrderStage, color: "border-yellow-300" },
  { title: "Em Producao" as OrderStage, color: "border-blue-300" },
  { title: "Enviado" as OrderStage, color: "border-purple-300" },
  { title: "Entregue" as OrderStage, color: "border-green-300" },
];

/* ────────────────────── Page ────────────────────── */

export default function PedidosPage() {
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<OrderStage | "todos">("todos");
  const [qtyFilter, setQtyFilter] = useState<"todos" | "1" | "2+">("todos");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());

  /** Change the stage of an individual sub-order (dogbook item) */
  const changeItemStage = (orderId: string, subId: string, newStage: OrderStage) => {
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((item) =>
                item.subId === subId ? { ...item, stage: newStage } : item
              ),
            }
          : o
      )
    );
  };

  /* ─── KPIs (filtered by date range) ─── */
  const ordersInRange = orderList.filter((o) => isInRange(o.date, dateRange));
  const totalOrders = ordersInRange.length;
  const totalDogbooks = ordersInRange.reduce((sum, o) => sum + o.items.length, 0);
  const allItems = ordersInRange.flatMap((o) => o.items);
  const deliveredItems = allItems.filter((i) => i.stage === "Entregue").length;
  const pendingPaymentItems = allItems.filter((i) => i.stage === "Aguardando Pagamento").length;

  /* ─── Filtered ─── */
  const filteredOrders = orderList.filter((o) => {
    const matchesSearch =
      searchTerm === "" ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(
        (item) =>
          item.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStage =
      stageFilter === "todos" || o.items.some((item) => item.stage === stageFilter);
    const matchesQty =
      qtyFilter === "todos" ||
      (qtyFilter === "1" && o.items.length === 1) ||
      (qtyFilter === "2+" && o.items.length >= 2);
    return matchesSearch && matchesStage && matchesQty;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Dogbooks
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe compras e sub-pedidos de Dogbooks
        </p>
      </div>

      {/* ─── Date Filter ─── */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Compras
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dogbooks (sub-pedidos)
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalDogbooks}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Entregues
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {deliveredItems}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Aguardando Pgto.
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {pendingPaymentItems}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        {/* ════════════════════ Lista Tab ════════════════════ */}
        <TabsContent value="lista">
          {/* Filters */}
          <div className="mb-4 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por pedido, cliente, tema ou pet..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value as OrderStage | "todos")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todas as Etapas</option>
                {allStages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={qtyFilter}
                onChange={(e) =>
                  setQtyFilter(e.target.value as "todos" | "1" | "2+")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todas as Compras</option>
                <option value="1">1 Dogbook</option>
                <option value="2+">2+ Dogbooks (multiplos)</option>
              </select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>#Compra</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead>Status Geral</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Pagamento
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Total
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Data
                      </TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const hasMultiple = order.items.length > 1;
                      const summaryStage = deriveOrderStage(order.items);
                      const allSameStage = order.items.every(
                        (i) => i.stage === order.items[0].stage
                      );

                      return (
                        <React.Fragment key={order.id}>
                          {/* ── Purchase (compra) header row ── */}
                          <TableRow
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                          >
                            <TableCell className="w-8 px-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedOrderId(
                                    isExpanded ? null : order.id
                                  );
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="size-3.5" />
                                ) : (
                                  <ChevronDown className="size-3.5" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-mono text-xs font-medium text-primary">
                              {order.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {order.client}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {order.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm font-semibold text-foreground">
                                  {order.items.length}
                                </span>
                                {hasMultiple && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px]"
                                  >
                                    multiplo
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {allSameStage ? (
                                <Badge variant={stageBadgeVariant(summaryStage)}>
                                  {summaryStage}
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px]">
                                    Misto
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    ({order.items.length} sub-pedidos)
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge
                                variant={
                                  order.payment === "Pago"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {order.payment}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell font-medium text-foreground">
                              {order.total}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                              {formatDate(order.date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* ── Sub-order rows (individual dogbooks) ── */}
                          {isExpanded &&
                            order.items.map((item) => (
                              <TableRow
                                key={item.subId}
                                className="bg-muted/20 border-l-2 border-l-primary/20"
                              >
                                <TableCell className="w-8 px-2" />
                                <TableCell>
                                  <span className="font-mono text-[11px] font-medium text-primary/70">
                                    {item.subId}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="size-3.5 text-primary/50" />
                                    <div>
                                      <p className="text-sm text-foreground">
                                        Dogbook {item.theme}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Pet: {item.petName}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell />
                                <TableCell>
                                  <select
                                    value={item.stage}
                                    onChange={(e) =>
                                      changeItemStage(
                                        order.id,
                                        item.subId,
                                        e.target.value as OrderStage
                                      )
                                    }
                                    className={`h-7 rounded-md border border-input px-2 text-[11px] font-medium ${stageColor(item.stage)}`}
                                  >
                                    {allStages.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  {item.tracking !== "-" && (
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      {item.tracking}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {item.nf !== "-" && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {item.nf}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="hidden xl:table-cell" />
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                  >
                                    <Eye className="size-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}

                          {/* ── Expanded info row ── */}
                          {isExpanded && (
                            <TableRow
                              key={`${order.id}-info`}
                              className="bg-muted/10"
                            >
                              <TableCell colSpan={9}>
                                <div className="flex flex-wrap gap-6 px-4 py-2 text-xs text-muted-foreground">
                                  {order.influencer !== "-" && (
                                    <div>
                                      <span className="font-medium uppercase">
                                        Influenciador:
                                      </span>{" "}
                                      {order.influencer}
                                    </div>
                                  )}
                                  {order.coupon !== "-" && (
                                    <div>
                                      <span className="font-medium uppercase">
                                        Cupom:
                                      </span>{" "}
                                      <span className="font-mono">
                                        {order.coupon}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium uppercase">
                                      Data da Compra:
                                    </span>{" "}
                                    {formatDate(order.date)}
                                  </div>
                                  <div>
                                    <span className="font-medium uppercase">
                                      Pagamento:
                                    </span>{" "}
                                    {order.payment}
                                  </div>
                                  <div>
                                    <span className="font-medium uppercase">
                                      Total:
                                    </span>{" "}
                                    {order.total}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center">
                  <BookOpen className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhum pedido encontrado com os filtros atuais
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════ Kanban Tab ════════════════════ */}
        <TabsContent value="kanban">
          <p className="mb-3 mt-4 text-xs text-muted-foreground">
            Cada card representa um sub-pedido (Dogbook individual). Dogbooks da mesma compra compartilham o codigo do pedido.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kanbanColumns.map((column) => {
              const Icon = stageIcons[column.title] || Package;
              // Flatten: each sub-order card shows in the kanban by its own stage
              const subOrders = orderList.flatMap((o) =>
                o.items
                  .filter((item) => item.stage === column.title)
                  .map((item) => ({ ...item, orderId: o.id, client: o.client }))
              );

              return (
                <div
                  key={column.title}
                  className={`rounded-xl border-t-4 bg-white p-3 ${column.color}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-medium text-muted-foreground">
                      {column.title}
                    </h3>
                    <Badge variant="secondary" className="ml-auto">
                      {subOrders.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {subOrders.map((sub) => (
                      <div
                        key={sub.subId}
                        className="rounded-lg border bg-background p-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[10px] font-medium text-primary">
                            {sub.subId}
                          </p>
                          <p className="font-mono text-[9px] text-muted-foreground">
                            {sub.orderId}
                          </p>
                        </div>
                        <p className="text-xs text-foreground">
                          {sub.client}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <BookOpen className="size-3 text-primary/50" />
                          <span className="text-[10px] text-muted-foreground">
                            {sub.theme} ({sub.petName})
                          </span>
                        </div>
                      </div>
                    ))}
                    {subOrders.length === 0 && (
                      <p className="py-4 text-center text-xs text-muted-foreground/50">
                        Nenhum sub-pedido
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
