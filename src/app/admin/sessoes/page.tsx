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
  Loader2,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  SessionType as DBSessionType,
  SessionStatus as DBSessionStatus,
  PaymentStatus as DBPaymentStatus,
} from "@/types";

/* ────────────────────── Types ────────────────────── */

type SessionStage =
  | "Aguardando Pagamento"
  | "Agendada"
  | "Confirmada"
  | "Realizada"
  | "Em Edicao"
  | "Entregue"
  | "Cancelada";

type PaymentStatusDisplay = "Pago" | "Pendente" | "Processando" | "Falhou" | "Reembolsado" | "Expirado";

type SessionType = "Pocket" | "Estudio" | "Completa";

interface SessionItem {
  subId: string;         // e.g. "#SES-0001"
  dbId: string;          // UUID from photo_sessions.id
  type: SessionType;
  petName: string;
  date: string;
  time: string;
  location: string;
  photographer: string;
  photographerId: string | null;
  stage: SessionStage;
  dbStatus: DBSessionStatus; // raw DB status for updates
}

interface SessionOrder {
  id: string;            // order_id UUID
  orderNumber: string;   // e.g. "#PAM-0001"
  client: string;
  email: string;
  phone: string;
  orderDate: string;
  items: SessionItem[];
  total: string;
  payment: PaymentStatusDisplay;
  paymentMethod: string;
}

interface PhotographerOption {
  id: string;
  name: string;
}

/* ────────────────────── DB <-> Display Mappings ────────────────────── */

const statusToStage: Record<DBSessionStatus, SessionStage> = {
  aguardando_pagamento: "Aguardando Pagamento",
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  em_edicao: "Em Edicao",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const stageToStatus: Record<SessionStage, DBSessionStatus> = {
  "Aguardando Pagamento": "aguardando_pagamento",
  "Agendada": "agendada",
  "Confirmada": "confirmada",
  "Realizada": "realizada",
  "Em Edicao": "em_edicao",
  "Entregue": "entregue",
  "Cancelada": "cancelada",
};

const sessionTypeToDisplay: Record<DBSessionType, SessionType> = {
  pocket: "Pocket",
  estudio: "Estudio",
  completa: "Completa",
};

const paymentStatusToDisplay: Record<DBPaymentStatus, PaymentStatusDisplay> = {
  pendente: "Pendente",
  processando: "Processando",
  pago: "Pago",
  falhou: "Falhou",
  reembolsado: "Reembolsado",
  expirado: "Expirado",
};

const paymentMethodLabels: Record<string, string> = {
  cartao: "Cartao",
  pix: "PIX",
  boleto: "Boleto",
};

/* ────────────────────── Helpers ────────────────────── */

const allStages: SessionStage[] = [
  "Aguardando Pagamento",
  "Agendada",
  "Confirmada",
  "Realizada",
  "Em Edicao",
  "Entregue",
  "Cancelada",
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
    case "Cancelada":
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
    case "Cancelada":
      return "text-gray-700 bg-gray-200";
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

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const stageIcons: Record<string, typeof Clock> = {
  "Aguardando Pagamento": Clock,
  Agendada: Calendar,
  Confirmada: CheckCircle,
  Realizada: Camera,
  "Em Edicao": FileText,
  Entregue: Truck,
  Cancelada: XCircle,
};

const kanbanColumns = [
  { title: "Aguardando Pagamento" as SessionStage, color: "border-red-300" },
  { title: "Agendada" as SessionStage, color: "border-orange-300" },
  { title: "Confirmada" as SessionStage, color: "border-yellow-300" },
  { title: "Realizada" as SessionStage, color: "border-blue-300" },
  { title: "Em Edicao" as SessionStage, color: "border-purple-300" },
  { title: "Entregue" as SessionStage, color: "border-green-300" },
  { title: "Cancelada" as SessionStage, color: "border-gray-300" },
];

/* ────────────────────── Calendar Helpers ────────────────────── */

function buildCalendarData(orders: SessionOrder[], year: number, month: number) {
  const map: Record<number, string[]> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!item.date) return;
      const d = new Date(item.date + "T00:00:00");
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(`${order.client} - ${item.type}`);
      }
    });
  });
  return map;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/* ────────────────────── Page ────────────────────── */

export default function SessoesPage() {
  const supabase = createClient();
  const [orderList, setOrderList] = useState<SessionOrder[]>([]);
  const [photographers, setPhotographers] = useState<PhotographerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<SessionStage | "todos">("todos");
  const [typeFilter, setTypeFilter] = useState<SessionType | "todos">("todos");
  const [qtyFilter, setQtyFilter] = useState<"todos" | "1" | "2+">("todos");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [viewOrder, setViewOrder] = useState<SessionOrder | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);

  /* ─── Fetch photographers list ─── */
  const fetchPhotographers = useCallback(async () => {
    const { data } = await supabase
      .from("photographers")
      .select("id, name")
      .eq("status", "ativo")
      .order("name");
    if (data) {
      setPhotographers(data);
    }
  }, [supabase]);

  /* ─── Fetch sessions with joins ─── */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch sessions
    const { data, error: fetchError } = await supabase
      .from("photo_sessions")
      .select(`
        id,
        session_number,
        order_id,
        customer_id,
        photographer_id,
        product_id,
        session_type,
        status,
        payment_status,
        payment_amount,
        scheduled_date,
        scheduled_time,
        duration_min,
        location,
        notes,
        created_at,
        updated_at,
        customers:customer_id (
          id,
          name,
          email,
          phone
        ),
        photographers:photographer_id (
          id,
          name
        ),
        orders:order_id (
          id,
          order_number,
          total,
          payment_method,
          payment_status,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setOrderList([]);
      setLoading(false);
      return;
    }

    // Group sessions by order_id to create "order" groups
    const orderMap = new Map<string, {
      orderId: string;
      orderNumber: string;
      client: string;
      email: string;
      phone: string;
      orderDate: string;
      total: number;
      payment: PaymentStatusDisplay;
      paymentMethod: string;
      items: SessionItem[];
    }>();

    for (const row of data) {
      const customer = row.customers as unknown as { id: string; name: string; email: string; phone: string | null } | null;
      // pet_id não existe na tabela photo_sessions — petName será "-"
      const photographer = row.photographers as unknown as { id: string; name: string } | null;
      const order = row.orders as unknown as {
        id: string;
        order_number: string;
        total: number;
        payment_method: string | null;
        payment_status: string;
        created_at: string;
      } | null;

      // Use order_id as grouping key, or session id if no order
      const groupKey = row.order_id || row.id;

      const sessionItem: SessionItem = {
        subId: row.session_number || `#SES-${row.id.slice(0, 4).toUpperCase()}`,
        dbId: row.id,
        type: sessionTypeToDisplay[row.session_type as DBSessionType] || "Pocket",
        petName: "-",
        date: row.scheduled_date || "",
        time: row.scheduled_time ? row.scheduled_time.slice(0, 5) : "-",
        location: row.location || "-",
        photographer: photographer?.name || "Nao atribuido",
        photographerId: row.photographer_id,
        stage: statusToStage[row.status as DBSessionStatus] || "Aguardando Pagamento",
        dbStatus: row.status as DBSessionStatus,
      };

      if (!orderMap.has(groupKey)) {
        orderMap.set(groupKey, {
          orderId: row.order_id || row.id,
          orderNumber: order?.order_number
            ? `#${order.order_number}`
            : row.session_number || `#SES-${row.id.slice(0, 4).toUpperCase()}`,
          client: customer?.name || "Cliente desconhecido",
          email: customer?.email || "-",
          phone: customer?.phone || "-",
          orderDate: order?.created_at || row.created_at,
          total: order?.total || 0,
          payment: paymentStatusToDisplay[(order?.payment_status || row.payment_status) as DBPaymentStatus] || "Pendente",
          paymentMethod: order?.payment_method
            ? (paymentMethodLabels[order.payment_method] || order.payment_method)
            : "-",
          items: [],
        });
      }

      orderMap.get(groupKey)!.items.push(sessionItem);
    }

    const orders: SessionOrder[] = Array.from(orderMap.values()).map((o) => ({
      id: o.orderId,
      orderNumber: o.orderNumber,
      client: o.client,
      email: o.email,
      phone: o.phone,
      orderDate: o.orderDate,
      items: o.items,
      total: formatCurrency(o.total),
      payment: o.payment,
      paymentMethod: o.paymentMethod,
    }));

    setOrderList(orders);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSessions();
    fetchPhotographers();
  }, [fetchSessions, fetchPhotographers]);

  /** Change the status of an individual session in Supabase */
  const changeItemStage = useCallback(async (
    _orderId: string,
    subId: string,
    newStage: SessionStage,
    dbId: string,
  ) => {
    const newStatus = stageToStatus[newStage];
    if (!newStatus) return;

    setUpdatingSessionId(dbId);

    const { error: updateError } = await supabase
      .from("photo_sessions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", dbId);

    setUpdatingSessionId(null);

    if (updateError) {
      alert(`Erro ao atualizar status: ${updateError.message}`);
      return;
    }

    // Optimistically update local state
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === _orderId
          ? {
              ...o,
              items: o.items.map((item) =>
                item.dbId === dbId ? { ...item, stage: newStage, dbStatus: newStatus } : item
              ),
            }
          : o
      )
    );

    // Also update viewOrder if open
    setViewOrder((prev) => {
      if (!prev || prev.id !== _orderId) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.dbId === dbId ? { ...item, stage: newStage, dbStatus: newStatus } : item
        ),
      };
    });
  }, [supabase]);

  /** Assign a photographer to a session */
  const assignPhotographer = useCallback(async (
    orderId: string,
    dbId: string,
    photographerId: string | null,
  ) => {
    setUpdatingSessionId(dbId);

    const { error: updateError } = await supabase
      .from("photo_sessions")
      .update({
        photographer_id: photographerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbId);

    setUpdatingSessionId(null);

    if (updateError) {
      alert(`Erro ao atribuir fotografo: ${updateError.message}`);
      return;
    }

    const photographerName = photographerId
      ? photographers.find((p) => p.id === photographerId)?.name || "Nao atribuido"
      : "Nao atribuido";

    // Optimistically update local state
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((item) =>
                item.dbId === dbId
                  ? { ...item, photographer: photographerName, photographerId }
                  : item
              ),
            }
          : o
      )
    );

    setViewOrder((prev) => {
      if (!prev || prev.id !== orderId) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.dbId === dbId
            ? { ...item, photographer: photographerName, photographerId }
            : item
        ),
      };
    });
  }, [supabase, photographers]);

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
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const now = new Date();
  const calendarYear = now.getFullYear();
  const calendarMonth = now.getMonth();
  const calendarDaysCount = getDaysInMonth(calendarYear, calendarMonth);
  const calendarDays = Array.from({ length: calendarDaysCount }, (_, i) => i + 1);
  const sessionsOnCalendar = buildCalendarData(orderList, calendarYear, calendarMonth);
  const calendarMonthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="size-8 animate-spin text-primary/60" />
        <p className="text-sm text-muted-foreground">Carregando sessoes...</p>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="size-8 text-red-500" />
        <p className="text-sm text-red-600">Erro ao carregar sessoes: {error}</p>
        <Button variant="outline" onClick={fetchSessions}>
          Tentar novamente
        </Button>
      </div>
    );
  }

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
                                    : order.payment === "Pendente"
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
                                key={item.dbId}
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
                                  {item.date ? formatDateTime(item.date, item.time) : "-"}
                                </TableCell>
                                <TableCell>
                                  <select
                                    value={item.stage}
                                    disabled={updatingSessionId === item.dbId}
                                    onChange={(e) =>
                                      changeItemStage(
                                        order.id,
                                        item.subId,
                                        e.target.value as SessionStage,
                                        item.dbId,
                                      )
                                    }
                                    className={`h-7 rounded-md border border-input px-2 text-[11px] font-medium ${stageColor(item.stage)} ${updatingSessionId === item.dbId ? "opacity-50" : ""}`}
                                  >
                                    {allStages.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <select
                                    value={item.photographerId || ""}
                                    disabled={updatingSessionId === item.dbId}
                                    onChange={(e) =>
                                      assignPhotographer(
                                        order.id,
                                        item.dbId,
                                        e.target.value || null,
                                      )
                                    }
                                    className={`h-7 rounded-md border border-input bg-background px-2 text-[10px] text-muted-foreground ${updatingSessionId === item.dbId ? "opacity-50" : ""}`}
                                  >
                                    <option value="">Nao atribuido</option>
                                    {photographers.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
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
                                  {order.paymentMethod !== "-" && (
                                    <div>
                                      <span className="font-medium uppercase">
                                        Metodo Pagamento:
                                      </span>{" "}
                                      {order.paymentMethod}
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
                                  {order.phone !== "-" && (
                                    <div>
                                      <span className="font-medium uppercase">
                                        Telefone:
                                      </span>{" "}
                                      {order.phone}
                                    </div>
                                  )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            {kanbanColumns.map((column) => {
              const Icon = stageIcons[column.title] || Package;
              // Flatten: each sub-order card shows in the kanban by its own stage
              const subOrders = orderList.flatMap((o) =>
                o.items
                  .filter((item) => item.stage === column.title)
                  .map((item) => ({ ...item, orderId: o.id, orderNumber: o.orderNumber, client: o.client }))
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
                        key={sub.dbId}
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
                            {sub.petName} {sub.date ? `· ${formatDateTime(sub.date, sub.time)}` : ""}
                          </span>
                        </div>
                        {sub.photographer !== "Nao atribuido" && (
                          <div className="mt-0.5 flex items-center gap-1">
                            <User className="size-2.5 text-muted-foreground/60" />
                            <span className="text-[9px] text-muted-foreground/60">
                              {sub.photographer}
                            </span>
                          </div>
                        )}
                        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/60">
                          {sub.orderNumber}
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
              <CardTitle className="flex items-center gap-2 font-serif text-[#8b5e5e] capitalize">
                <Calendar className="size-5" />
                {calendarMonthLabel}
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
              Detalhes do Pedido {viewOrder?.orderNumber}
            </SheetTitle>
            <SheetDescription>
              Informacoes completas da compra e sessoes
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
                  {viewOrder.phone !== "-" && (
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Telefone</p>
                      <p className="mt-0.5 text-sm text-foreground">{viewOrder.phone}</p>
                    </div>
                  )}
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
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Qtd. Sessoes</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{viewOrder.items.length}</p>
                  </div>
                </div>

                {viewOrder.paymentMethod !== "-" && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                      <CreditCard className="size-3.5 text-blue-600" />
                      <div>
                        <p className="text-[10px] font-medium uppercase text-blue-600">Metodo Pagamento</p>
                        <p className="text-sm font-medium text-blue-800">{viewOrder.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* ─── Sessoes Individuais ─── */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Camera className="size-3.5" />
                  Sessoes ({viewOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {viewOrder.items.map((item) => (
                    <div
                      key={item.dbId}
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
                              : item.stage === "Aguardando Pagamento" || item.stage === "Cancelada"
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
                            {item.date ? `${formatDate(item.date)} as ${item.time}` : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Fotografo</p>
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

                      {/* Status change & photographer assignment in sheet */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase text-muted-foreground">Status:</span>
                          <select
                            value={item.stage}
                            disabled={updatingSessionId === item.dbId}
                            onChange={(e) =>
                              changeItemStage(
                                viewOrder.id,
                                item.subId,
                                e.target.value as SessionStage,
                                item.dbId,
                              )
                            }
                            className={`h-7 rounded-md border border-input px-2 text-[11px] font-medium ${stageColor(item.stage)} ${updatingSessionId === item.dbId ? "opacity-50" : ""}`}
                          >
                            {allStages.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase text-muted-foreground">Fotografo:</span>
                          <select
                            value={item.photographerId || ""}
                            disabled={updatingSessionId === item.dbId}
                            onChange={(e) =>
                              assignPhotographer(
                                viewOrder.id,
                                item.dbId,
                                e.target.value || null,
                              )
                            }
                            className={`h-7 rounded-md border border-input bg-background px-2 text-[11px] ${updatingSessionId === item.dbId ? "opacity-50" : ""}`}
                          >
                            <option value="">Nao atribuido</option>
                            {photographers.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        {updatingSessionId === item.dbId && (
                          <Loader2 className="size-3.5 animate-spin text-primary/60" />
                        )}
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
