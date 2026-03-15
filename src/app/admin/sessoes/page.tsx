"use client";

import { useState } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
  Camera,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  CreditCard,
  Tag,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

type SessionStage =
  | "Aguardando Pagamento"
  | "Agendada"
  | "Confirmada"
  | "Realizada"
  | "Em Edicao"
  | "Entregue";

type PaymentStatus = "Pago" | "Pendente" | "Parcial" | "Reembolsado";

type SessionType = "Pocket" | "Estudio" | "Completa";

interface SessionItem {
  subId: string;         // e.g. "#SES-001-1"
  type: SessionType;
  petName: string;
  date: string;
  time: string;
  location: string;
  photographer: string;
  stage: SessionStage;   // each sub-order has its own stage
}

interface SessionOrder {
  id: string;            // e.g. "#SES-001"
  client: string;
  email: string;
  orderDate: string;
  items: SessionItem[];
  total: string;
  payment: PaymentStatus;
  influencer: string;
  coupon: string;
}

/* ────────────────────── Mock Data ────────────────────── */

const initialOrders: SessionOrder[] = [
  {
    id: "#SES-001",
    client: "Ana Souza",
    email: "ana@email.com",
    orderDate: "2026-03-10",
    items: [
      { subId: "#SES-001-1", type: "Pocket", petName: "Thor", date: "2026-03-15", time: "10:00", location: "Parque Ibirapuera", photographer: "Juliano Lemos", stage: "Confirmada" },
    ],
    total: "R$ 900,00",
    payment: "Pago",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#SES-002",
    client: "Carlos Mendes",
    email: "carlos@email.com",
    orderDate: "2026-03-09",
    items: [
      { subId: "#SES-002-1", type: "Estudio", petName: "Luna", date: "2026-03-16", time: "14:00", location: "Estudio Pinheiros", photographer: "Juliano Lemos", stage: "Aguardando Pagamento" },
      { subId: "#SES-002-2", type: "Pocket", petName: "Bella", date: "2026-03-17", time: "09:00", location: "Parque Villa-Lobos", photographer: "Juliano Lemos", stage: "Agendada" },
    ],
    total: "R$ 4.600,00",
    payment: "Parcial",
    influencer: "Camila Pet",
    coupon: "CAMILA10",
  },
  {
    id: "#SES-003",
    client: "Fernanda Lima",
    email: "fernanda@email.com",
    orderDate: "2026-03-08",
    items: [
      { subId: "#SES-003-1", type: "Completa", petName: "Max", date: "2026-03-18", time: "09:00", location: "Residencia Cliente + Estudio", photographer: "Juliano Lemos", stage: "Realizada" },
    ],
    total: "R$ 4.900,00",
    payment: "Pago",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#SES-004",
    client: "Mariana Costa",
    email: "mariana@email.com",
    orderDate: "2026-03-05",
    items: [
      { subId: "#SES-004-1", type: "Pocket", petName: "Mel", date: "2026-03-20", time: "16:00", location: "Parque Villa-Lobos", photographer: "Juliano Lemos", stage: "Entregue" },
      { subId: "#SES-004-2", type: "Estudio", petName: "Bob", date: "2026-03-21", time: "10:00", location: "Estudio Pinheiros", photographer: "Juliano Lemos", stage: "Em Edicao" },
      { subId: "#SES-004-3", type: "Completa", petName: "Mel", date: "2026-03-22", time: "08:00", location: "Praia + Estudio", photographer: "Juliano Lemos", stage: "Confirmada" },
    ],
    total: "R$ 9.500,00",
    payment: "Pago",
    influencer: "Doglovers SP",
    coupon: "DOG15",
  },
  {
    id: "#SES-005",
    client: "Pedro Santos",
    email: "pedro@email.com",
    orderDate: "2026-02-28",
    items: [
      { subId: "#SES-005-1", type: "Estudio", petName: "Pipoca", date: "2026-03-22", time: "11:00", location: "Estudio Pinheiros", photographer: "Juliano Lemos", stage: "Entregue" },
    ],
    total: "R$ 3.700,00",
    payment: "Pago",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#SES-006",
    client: "Rodrigo Alves",
    email: "rodrigo@email.com",
    orderDate: "2026-03-12",
    items: [
      { subId: "#SES-006-1", type: "Completa", petName: "Simba", date: "2026-03-25", time: "10:00", location: "Parque Ibirapuera + Estudio", photographer: "Juliano Lemos", stage: "Agendada" },
      { subId: "#SES-006-2", type: "Pocket", petName: "Nala", date: "2026-03-26", time: "15:00", location: "Parque do Povo", photographer: "Juliano Lemos", stage: "Aguardando Pagamento" },
    ],
    total: "R$ 5.800,00",
    payment: "Parcial",
    influencer: "-",
    coupon: "-",
  },
  {
    id: "#SES-007",
    client: "Juliana Ferreira",
    email: "juliana@email.com",
    orderDate: "2026-03-11",
    items: [
      { subId: "#SES-007-1", type: "Pocket", petName: "Amora", date: "2026-03-28", time: "09:00", location: "Parque Ibirapuera", photographer: "Juliano Lemos", stage: "Confirmada" },
    ],
    total: "R$ 900,00",
    payment: "Pago",
    influencer: "Vida Animal",
    coupon: "VIDA5",
  },
];

/* ────────────────────── Helpers ────────────────────── */

const allStages: SessionStage[] = [
  "Aguardando Pagamento",
  "Agendada",
  "Confirmada",
  "Realizada",
  "Em Edicao",
  "Entregue",
];

function stageBadgeVariant(stage: string) {
  switch (stage) {
    case "Entregue":
      return "default" as const;
    case "Realizada":
    case "Em Edicao":
      return "secondary" as const;
    case "Confirmada":
    case "Agendada":
      return "outline" as const;
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
    case "Em Edicao":
      return "text-purple-700 bg-purple-50";
    case "Realizada":
      return "text-blue-700 bg-blue-50";
    case "Confirmada":
      return "text-yellow-700 bg-yellow-50";
    case "Agendada":
      return "text-orange-700 bg-orange-50";
    case "Aguardando Pagamento":
      return "text-red-700 bg-red-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
}

function sessionTypeBadgeColor(type: SessionType) {
  switch (type) {
    case "Pocket":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Estudio":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Completa":
      return "bg-purple-100 text-purple-700 border-purple-200";
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: string, time: string): string {
  return `${new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })} ${time}`;
}

/** Derive a summary stage for the order based on its items' individual stages */
function deriveOrderStage(items: SessionItem[]): string {
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
  Agendada: Calendar,
  Confirmada: CheckCircle,
  Realizada: Camera,
  "Em Edicao": FileText,
  Entregue: Truck,
};

const kanbanColumns = [
  { title: "Aguardando Pagamento" as SessionStage, color: "border-red-300" },
  { title: "Agendada" as SessionStage, color: "border-orange-300" },
  { title: "Confirmada" as SessionStage, color: "border-yellow-300" },
  { title: "Realizada" as SessionStage, color: "border-blue-300" },
  { title: "Em Edicao" as SessionStage, color: "border-purple-300" },
  { title: "Entregue" as SessionStage, color: "border-green-300" },
];

/* ────────────────────── Calendar Helpers ────────────────────── */

function buildCalendarData(orders: SessionOrder[]) {
  const map: Record<number, string[]> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const d = new Date(item.date);
      if (d.getMonth() === 2 && d.getFullYear() === 2026) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(`${order.client} - ${item.type}`);
      }
    });
  });
  return map;
}

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

/* ────────────────────── Page ────────────────────── */

export default function SessoesPage() {
  const [orderList, setOrderList] = useState<SessionOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<SessionStage | "todos">("todos");
  const [typeFilter, setTypeFilter] = useState<SessionType | "todos">("todos");
  const [qtyFilter, setQtyFilter] = useState<"todos" | "1" | "2+">("todos");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [viewOrder, setViewOrder] = useState<SessionOrder | null>(null);

  /** Change the stage of an individual sub-order (session item) */
  const changeItemStage = (orderId: string, subId: string, newStage: SessionStage) => {
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
  const ordersInRange = orderList.filter((o) => isInRange(o.orderDate, dateRange));
  const totalOrders = ordersInRange.length;
  const totalSessions = ordersInRange.reduce((sum, o) => sum + o.items.length, 0);
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
          item.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStage =
      stageFilter === "todos" || o.items.some((item) => item.stage === stageFilter);
    const matchesType =
      typeFilter === "todos" ||
      o.items.some((item) => item.type === typeFilter);
    const matchesQty =
      qtyFilter === "todos" ||
      (qtyFilter === "1" && o.items.length === 1) ||
      (qtyFilter === "2+" && o.items.length >= 2);
    return matchesSearch && matchesStage && matchesType && matchesQty;
  });

  const sessionsOnCalendar = buildCalendarData(orderList);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Sessoes Fotograficas
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie compras e sub-pedidos de sessoes de foto
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
              <Camera className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sessoes (sub-pedidos)
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalSessions}
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
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
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
                placeholder="Buscar por pedido, cliente, pet ou local..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value as SessionStage | "todos")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todas as Etapas</option>
                {allStages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as SessionType | "todos")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="Pocket">Pocket</option>
                <option value="Estudio">Estudio</option>
                <option value="Completa">Completa</option>
              </select>
              <select
                value={qtyFilter}
                onChange={(e) =>
                  setQtyFilter(e.target.value as "todos" | "1" | "2+")
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todas as Compras</option>
                <option value="1">1 Sessao</option>
                <option value="2+">2+ Sessoes (multiplos)</option>
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
                        <>
                          {/* ── Purchase (compra) header row ── */}
                          <TableRow
                            key={order.id}
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
                                    : order.payment === "Parcial"
                                      ? "outline"
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
                              {formatDate(order.orderDate)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                title="Ver detalhes do pedido"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewOrder(order);
                                }}
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* ── Sub-order rows (individual sessions) ── */}
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
                                    <Camera className="size-3.5 text-primary/50" />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${sessionTypeBadgeColor(item.type)}`}
                                        >
                                          {item.type}
                                        </span>
                                        <span className="text-sm text-foreground">
                                          {item.petName}
                                        </span>
                                      </div>
                                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <MapPin className="size-2.5" />
                                        {item.location}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-[10px] text-muted-foreground">
                                  {formatDateTime(item.date, item.time)}
                                </TableCell>
                                <TableCell>
                                  <select
                                    value={item.stage}
                                    onChange={(e) =>
                                      changeItemStage(
                                        order.id,
                                        item.subId,
                                        e.target.value as SessionStage
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
                                  <span className="text-[10px] text-muted-foreground">
                                    Fotog.: {item.photographer}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell" />
                                <TableCell className="hidden xl:table-cell" />
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    title="Ver detalhes do pedido"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewOrder(order);
                                    }}
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
                                    {formatDate(order.orderDate)}
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
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center">
                  <Camera className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhuma sessao encontrada com os filtros atuais
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════ Kanban Tab ════════════════════ */}
        <TabsContent value="kanban">
          <p className="mb-3 mt-4 text-xs text-muted-foreground">
            Cada card representa um sub-pedido (sessao individual). Sessoes da mesma compra compartilham o codigo do pedido.
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
                          <span
                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${sessionTypeBadgeColor(sub.type)}`}
                          >
                            {sub.type}
                          </span>
                        </div>
                        <p className="text-xs text-foreground">
                          {sub.client}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <Camera className="size-3 text-primary/50" />
                          <span className="text-[10px] text-muted-foreground">
                            {sub.petName} · {formatDateTime(sub.date, sub.time)}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/60">
                          {sub.orderId}
                        </p>
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

        {/* ════════════════════ Calendario Tab ════════════════════ */}
        <TabsContent value="calendario">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-[#8b5e5e]">
                <Calendar className="size-5" />
                Marco 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#6b4c4c]">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
                  (day) => (
                    <div key={day} className="p-2">
                      {day}
                    </div>
                  )
                )}
                {calendarDays.map((day) => {
                  const hasSessions = sessionsOnCalendar[day];
                  return (
                    <div
                      key={day}
                      className={`min-h-[60px] rounded-lg border p-1 text-left ${
                        hasSessions
                          ? "border-[#8b5e5e]/30 bg-[#8b5e5e]/5"
                          : "border-transparent"
                      }`}
                    >
                      <span className="text-xs font-medium">{day}</span>
                      {hasSessions?.map((s, i) => (
                        <div
                          key={i}
                          className="mt-0.5 truncate rounded bg-[#8b5e5e] px-1 py-0.5 text-[10px] text-white"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ════════════════════ Order Detail Sheet ════════════════════ */}
      <Sheet open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-serif text-foreground">
              Detalhes do Pedido {viewOrder?.id}
            </SheetTitle>
            <SheetDescription>
              Informações completas da compra e sessões
            </SheetDescription>
          </SheetHeader>

          {viewOrder && (
            <div className="mt-6 space-y-6">
              {/* ─── Cliente ─── */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <User className="size-3.5" />
                  Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Nome</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{viewOrder.client}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">E-mail</p>
                    <p className="mt-0.5 text-sm text-foreground">{viewOrder.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Resumo do Pedido ─── */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ShoppingBag className="size-3.5" />
                  Resumo do Pedido
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Data da Compra</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{formatDate(viewOrder.orderDate)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Total</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{viewOrder.total}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Pagamento</p>
                    <Badge
                      variant={viewOrder.payment === "Pago" ? "default" : "secondary"}
                      className="mt-0.5"
                    >
                      {viewOrder.payment}
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Qtd. Sessões</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{viewOrder.items.length}</p>
                  </div>
                </div>

                {(viewOrder.influencer !== "-" || viewOrder.coupon !== "-") && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {viewOrder.influencer !== "-" && (
                      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                        <Tag className="size-3.5 text-blue-600" />
                        <div>
                          <p className="text-[10px] font-medium uppercase text-blue-600">Influenciador</p>
                          <p className="text-sm font-medium text-blue-800">{viewOrder.influencer}</p>
                        </div>
                      </div>
                    )}
                    {viewOrder.coupon !== "-" && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 p-3">
                        <CreditCard className="size-3.5 text-green-600" />
                        <div>
                          <p className="text-[10px] font-medium uppercase text-green-600">Cupom</p>
                          <p className="font-mono text-sm font-medium text-green-800">{viewOrder.coupon}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* ─── Sessões Individuais ─── */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Camera className="size-3.5" />
                  Sessões ({viewOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {viewOrder.items.map((item) => (
                    <div
                      key={item.subId}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-primary">
                            {item.subId}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${sessionTypeBadgeColor(item.type)}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <Badge
                          variant={
                            item.stage === "Entregue"
                              ? "default"
                              : item.stage === "Aguardando Pagamento"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {item.stage}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Pet</p>
                          <p className="text-sm text-foreground">{item.petName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Data & Hora</p>
                          <p className="text-sm text-foreground">
                            {formatDate(item.date)} às {item.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Fotógrafo</p>
                          <p className="text-sm text-foreground">{item.photographer}</p>
                        </div>
                        <div className="sm:col-span-3">
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Local</p>
                          <div className="mt-0.5 flex items-center gap-1">
                            <MapPin className="size-3 text-muted-foreground" />
                            <p className="text-sm text-foreground">{item.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
