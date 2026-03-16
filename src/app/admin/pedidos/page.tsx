"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/* ────────────────────── Types ────────────────────── */

/** DB enum values for dogbook stage */
type DogbookStageDB =
  | "aguardando_pagamento"
  | "aguardando_fotos"
  | "em_criacao"
  | "em_aprovacao"
  | "em_producao"
  | "enviado"
  | "concluido";

/** Display labels used in the UI */
type OrderStage =
  | "Aguardando Pagamento"
  | "Aguardando Fotos"
  | "Aprovacao Layout"
  | "Em Producao"
  | "Enviado"
  | "Entregue";

type PaymentStatus = "Pago" | "Pendente" | "Reembolsado" | "Processando" | "Falhou" | "Expirado";

interface DogbookItem {
  id: string;          // dogbook UUID
  subId: string;       // e.g. "#PAM-001-1"
  theme: string;
  petName: string;
  stage: OrderStage;   // each sub-order has its own stage
  stageDB: DogbookStageDB; // raw DB value for updates
  tracking: string;
  nf: string;
}

interface Order {
  id: string;           // order UUID
  orderNumber: string;  // e.g. "#PAM-001"
  client: string;
  email: string;
  date: string;
  items: DogbookItem[];
  total: string;
  payment: PaymentStatus;
  influencer: string;
  coupon: string;
}

/* ────────────────────── Stage mappings ────────────────────── */

const dbStageToDisplay: Record<DogbookStageDB, OrderStage> = {
  aguardando_pagamento: "Aguardando Pagamento",
  aguardando_fotos: "Aguardando Fotos",
  em_criacao: "Aprovacao Layout",
  em_aprovacao: "Aprovacao Layout",
  em_producao: "Em Producao",
  enviado: "Enviado",
  concluido: "Entregue",
};

const displayStageToDb: Record<OrderStage, DogbookStageDB> = {
  "Aguardando Pagamento": "aguardando_pagamento",
  "Aguardando Fotos": "aguardando_fotos",
  "Aprovacao Layout": "em_aprovacao",
  "Em Producao": "em_producao",
  "Enviado": "enviado",
  "Entregue": "concluido",
};

const paymentStatusMap: Record<string, PaymentStatus> = {
  pendente: "Pendente",
  processando: "Processando",
  pago: "Pago",
  falhou: "Falhou",
  reembolsado: "Reembolsado",
  expirado: "Expirado",
};

const themeDisplayMap: Record<string, string> = {
  verao: "Verao",
  inverno: "Inverno",
  natal: "Natal",
  ano_novo: "Ano Novo",
  caoniversario: "Caoniversario",
};

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

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
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
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<OrderStage | "todos">("todos");
  const [qtyFilter, setQtyFilter] = useState<"todos" | "1" | "2+">("todos");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());

  const supabase = createClient();

  /* ─── Fetch all orders with nested data ─── */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          subtotal,
          discount_amount,
          total,
          status,
          payment_method,
          payment_status,
          tracking_code,
          nf_number,
          notes,
          created_at,
          updated_at,
          paid_at,
          shipped_at,
          delivered_at,
          customers ( id, name, email, phone ),
          dogbooks ( id, order_item_id, sub_number, theme, stage, total_pages, photos_uploaded, photos_max, pets ( id, name, breed ) ),
          coupons ( id, code ),
          influencers ( id, name, slug )
        `)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        toast.error("Erro ao carregar pedidos: " + ordersError.message);
        setLoading(false);
        return;
      }

      if (!orders || orders.length === 0) {
        setOrderList([]);
        setLoading(false);
        return;
      }

      const mapped: Order[] = orders.map((o: any) => {
        const customer = o.customers;
        const dogbooks = o.dogbooks || [];
        const coupon = o.coupons;
        const influencer = o.influencers;

        const items: DogbookItem[] = dogbooks.map((db: any) => ({
          id: db.id,
          subId: db.sub_number || "-",
          theme: themeDisplayMap[db.theme] || db.theme || "-",
          petName: db.pets?.name || "-",
          stage: dbStageToDisplay[db.stage as DogbookStageDB] || "Aguardando Pagamento",
          stageDB: db.stage as DogbookStageDB,
          tracking: o.tracking_code || "-",
          nf: o.nf_number || "-",
        }));

        return {
          id: o.id,
          orderNumber: o.order_number || "-",
          client: customer?.name || "-",
          email: customer?.email || "-",
          date: o.created_at,
          items,
          total: formatCurrency(Number(o.total) || 0),
          payment: paymentStatusMap[o.payment_status] || "Pendente",
          influencer: influencer?.name || "-",
          coupon: coupon?.code || "-",
        };
      });

      setOrderList(mapped);
    } catch (err: any) {
      console.error("Unexpected error fetching orders:", err);
      toast.error("Erro inesperado ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /** Change the stage of an individual sub-order (dogbook item) in Supabase */
  const changeItemStage = async (
    orderId: string,
    dogbookId: string,
    newStage: OrderStage
  ) => {
    const newStageDB = displayStageToDb[newStage];
    if (!newStageDB) return;

    setUpdatingId(dogbookId);

    try {
      const { error } = await supabase
        .from("dogbooks")
        .update({ stage: newStageDB })
        .eq("id", dogbookId);

      if (error) {
        console.error("Error updating dogbook stage:", error);
        toast.error("Erro ao atualizar etapa: " + error.message);
        return;
      }

      // Optimistic update in local state
      setOrderList((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                items: o.items.map((item) =>
                  item.id === dogbookId
                    ? { ...item, stage: newStage, stageDB: newStageDB }
                    : item
                ),
              }
            : o
        )
      );

      toast.success("Etapa atualizada com sucesso!");
    } catch (err: any) {
      console.error("Unexpected error updating stage:", err);
      toast.error("Erro inesperado ao atualizar etapa.");
    } finally {
      setUpdatingId(null);
    }
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
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }

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
                      const summaryStage = order.items.length > 0
                        ? deriveOrderStage(order.items)
                        : "Aguardando Pagamento";
                      const allSameStage = order.items.length > 0 && order.items.every(
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
                              {order.orderNumber}
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
                              {order.items.length === 0 ? (
                                <Badge variant="outline" className="text-[10px]">
                                  Sem dogbooks
                                </Badge>
                              ) : allSameStage ? (
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
                                key={item.id}
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
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={item.stage}
                                      onChange={(e) =>
                                        changeItemStage(
                                          order.id,
                                          item.id,
                                          e.target.value as OrderStage
                                        )
                                      }
                                      disabled={updatingId === item.id}
                                      className={`h-7 rounded-md border border-input px-2 text-[11px] font-medium ${stageColor(item.stage)} ${updatingId === item.id ? "opacity-50" : ""}`}
                                    >
                                      {allStages.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                    {updatingId === item.id && (
                                      <Loader2 className="size-3 animate-spin text-muted-foreground" />
                                    )}
                                  </div>
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

              {filteredOrders.length === 0 && !loading && (
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
                  .map((item) => ({ ...item, orderId: o.orderNumber, client: o.client }))
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
                        key={sub.id}
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
