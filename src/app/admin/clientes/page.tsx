"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCepLookup } from "@/hooks/useCepLookup";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  ShoppingBag,
  Camera,
  BookOpen,
  FileSearch,
  X,
  Copy,
  Dog,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Star,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Repeat,
  Heart,
  Loader2,
  KeyRound,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface DbPet {
  id: string;
  customer_id: string;
  name: string;
  breed: string;
  species: string;
  birthday: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

interface DbCustomer {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  birth_date: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  pets: DbPet[];
}

interface DbOrder {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  tracking_code: string | null;
  nf_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  coupon_id: string | null;
}

interface DbDogbook {
  id: string;
  order_id: string;
  customer_id: string;
  pet_id: string | null;
  sub_number: string;
  theme: string;
  stage: string;
  total_pages: number;
  photos_uploaded: number;
  photos_max: number;
  created_at: string;
  pet?: DbPet | null;
}

interface DbPhotoSession {
  id: string;
  session_number: string;
  order_id: string;
  customer_id: string;
  pet_id: string | null;
  session_type: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  location: string | null;
  total_photos: number | null;
  observations: string | null;
  created_at: string;
  pet?: DbPet | null;
}

/** Enriched order with nested dogbooks & sessions for display */
interface EnrichedOrder {
  id: string;
  order_number: string;
  date: string;
  type: "dogbook" | "sessao" | "misto";
  total: number;
  payment_status: string;
  payment_method: string | null;
  coupon_id: string | null;
  dogbooks: DbDogbook[];
  sessions: DbPhotoSession[];
}

/* ────────────────────── Helpers ────────────────────── */

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function stageColor(stage: string) {
  switch (stage) {
    case "concluido":
    case "entregue":
      return "text-green-700 bg-green-50 border-green-200";
    case "enviado":
      return "text-purple-700 bg-purple-50 border-purple-200";
    case "em_producao":
    case "em_edicao":
    case "em_criacao":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "em_aprovacao":
    case "realizada":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "aguardando_fotos":
    case "agendada":
    case "confirmada":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "aguardando_pagamento":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    aguardando_pagamento: "Aguardando Pagamento",
    aguardando_fotos: "Aguardando Fotos",
    em_criacao: "Em Criacao",
    em_aprovacao: "Aprovacao Layout",
    em_producao: "Em Producao",
    enviado: "Enviado",
    concluido: "Entregue",
    agendada: "Agendada",
    confirmada: "Confirmada",
    realizada: "Realizada",
    em_edicao: "Em Edicao",
    entregue: "Entregue",
    cancelada: "Cancelada",
  };
  return map[stage] || stage;
}

function sessionTypeBadge(type: string) {
  switch (type) {
    case "pocket":
      return "bg-emerald-100 text-emerald-700";
    case "estudio":
      return "bg-blue-100 text-blue-700";
    case "completa":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function sessionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    pocket: "Pocket",
    estudio: "Estudio",
    completa: "Completa",
  };
  return map[type] || type;
}

function themeLabel(theme: string): string {
  const map: Record<string, string> = {
    verao: "Verao",
    inverno: "Inverno",
    natal: "Natal",
    ano_novo: "Ano Novo",
    caoniversario: "Caoniversario",
  };
  return map[theme] || theme;
}

function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pendente: "Pendente",
    processando: "Processando",
    pago: "Pago",
    falhou: "Falhou",
    reembolsado: "Reembolsado",
    expirado: "Expirado",
  };
  return map[status] || status;
}

function paymentStatusVariant(status: string): "default" | "outline" | "destructive" {
  switch (status) {
    case "pago":
      return "default";
    case "processando":
      return "outline";
    case "pendente":
    case "falhou":
    case "reembolsado":
    case "expirado":
      return "destructive";
    default:
      return "outline";
  }
}

function paymentMethodLabel(method: string | null): string {
  if (!method) return "";
  const map: Record<string, string> = {
    cartao: "Cartao",
    pix: "PIX",
    boleto: "Boleto",
  };
  return map[method] || method;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 12) return `${totalMonths} mes${totalMonths !== 1 ? "es" : ""}`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (m === 0) return `${y} ano${y > 1 ? "s" : ""}`;
  return `${y}a ${m}m`;
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function buildFullAddress(c: DbCustomer): string {
  return [c.street, c.number, c.complement, c.neighborhood, c.city, c.state]
    .filter(Boolean)
    .join(", ");
}

/** Derive a status from customer data: active if ordered in last 90 days, new if created in last 30, else inactive */
function deriveStatus(customer: DbCustomer, orders: DbOrder[]): "ativo" | "novo" | "inativo" {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  const hasRecentOrder = orders.some(
    (o) => now - new Date(o.created_at).getTime() < ninetyDays
  );
  if (hasRecentOrder) return "ativo";

  const isNew = now - new Date(customer.created_at).getTime() < thirtyDays;
  if (isNew) return "novo";

  return "inativo";
}

type DerivedStatus = "ativo" | "novo" | "inativo";

function statusColor(status: DerivedStatus) {
  switch (status) {
    case "ativo":
      return "bg-green-100 text-green-700 border-green-200";
    case "inativo":
      return "bg-gray-100 text-gray-500 border-gray-200";
    case "novo":
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
}

function statusLabel(status: DerivedStatus) {
  switch (status) {
    case "ativo": return "Ativo";
    case "inativo": return "Inativo";
    case "novo": return "Novo";
  }
}

function getCustomerStats(orders: EnrichedOrder[]) {
  let totalDogbooks = 0;
  let totalSessions = 0;
  let totalSpent = 0;
  let delivered = 0;
  let pending = 0;

  orders.forEach((o) => {
    totalDogbooks += o.dogbooks.length;
    totalSessions += o.sessions.length;
    if (o.payment_status === "pago") totalSpent += o.total;
    o.dogbooks.forEach((d) => {
      if (d.stage === "concluido") delivered++;
      else pending++;
    });
    o.sessions.forEach((s) => {
      if (s.status === "entregue") delivered++;
      else pending++;
    });
  });

  return {
    totalPurchases: orders.length,
    totalDogbooks,
    totalSessions,
    totalSpentNum: totalSpent,
    totalSpent: formatCurrency(totalSpent),
    delivered,
    pending,
  };
}

/* ────────────────────── New Client Form State ────────────────────── */

interface NewPetField {
  name: string;
  breed: string;
  birthDate: string;
}

const emptyPet: NewPetField = { name: "", breed: "", birthDate: "" };

/* ────────────────────── Client History Panel ────────────────────── */

function ClientHistoryPanel({
  customer,
  orders,
  loadingDetail,
}: {
  customer: DbCustomer;
  orders: EnrichedOrder[];
  loadingDetail: boolean;
}) {
  const stats = getCustomerStats(orders);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resumo" | "compras">("resumo");
  const fullAddress = buildFullAddress(customer);
  const lastOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="flex items-start gap-5 rounded-xl border bg-muted/20 p-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-lg font-bold text-[#8b5e5e]">
          {getInitials(customer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">{customer.name}</h3>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" /> <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" /> {customer.phone}
            </div>
            {fullAddress && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="size-3.5 shrink-0" /> {fullAddress}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {customer.cpf && (
              <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                CPF: {customer.cpf}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              Cliente desde {formatDate(customer.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1.5">
        {(["resumo", "compras"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "resumo" ? "Resumo" : "Compras"}
          </button>
        ))}
      </div>

      {loadingDetail && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-[#8b5e5e]" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando dados...</span>
        </div>
      )}

      {/* Tab: Resumo */}
      {!loadingDetail && activeTab === "resumo" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <div className="rounded-xl border bg-background p-4 text-center">
              <ShoppingBag className="mx-auto size-5 text-primary/60" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalPurchases}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Compras</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <BookOpen className="mx-auto size-5 text-primary/60" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalDogbooks}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Dogbooks</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <Camera className="mx-auto size-5 text-primary/60" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Sessoes</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <DollarSign className="mx-auto size-5 text-green-600" />
              <p className="mt-2 text-lg font-bold text-green-600">{stats.totalSpent}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Total Gasto</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <CheckCircle className="mx-auto size-5 text-green-600" />
              <p className="mt-2 text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Entregues</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <Clock className="mx-auto size-5 text-amber-600" />
              <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Pendentes</p>
            </div>
          </div>

          {/* Engagement */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ultima Atividade</p>
              {lastOrder ? (
                <>
                  <p className="mt-1.5 text-base font-semibold">{formatDate(lastOrder.date)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">ha {daysSince(lastOrder.date)} dias</p>
                </>
              ) : (
                <p className="mt-1.5 text-base font-semibold text-muted-foreground">-</p>
              )}
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket Medio</p>
              <p className="mt-1.5 text-base font-semibold">
                {stats.totalPurchases > 0
                  ? formatCurrency(stats.totalSpentNum / stats.totalPurchases)
                  : "R$ 0,00"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente Desde</p>
              <p className="mt-1.5 text-base font-semibold">{formatDate(customer.created_at)}</p>
            </div>
          </div>

          {/* Pets */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Dog className="size-3.5" /> Pets ({customer.pets.length})
            </h4>
            <div className="space-y-1.5">
              {customer.pets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-sm">
                    🐾
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{pet.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {pet.breed}{pet.birthday ? ` · ${calculateAge(pet.birthday)}` : ""}
                    </p>
                  </div>
                </div>
              ))}
              {customer.pets.length === 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">Nenhum pet cadastrado</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Observacoes
              </h4>
              <p className="rounded-lg border bg-muted/20 p-2.5 text-xs text-foreground">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Compras */}
      {!loadingDetail && activeTab === "compras" && (
        <div className="space-y-2">
          {orders.map((order) => {
            const isExpanded = expandedPurchase === order.order_number;
            const totalItems = order.dogbooks.length + order.sessions.length;

            return (
              <div key={order.order_number} className="rounded-lg border">
                <button
                  onClick={() => setExpandedPurchase(isExpanded ? null : order.order_number)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {order.order_number}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {order.type === "dogbook" ? "Dogbook" : order.type === "sessao" ? "Sessao" : "Misto"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(order.date)} · {totalItems} item{totalItems > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={paymentStatusVariant(order.payment_status)}
                      className="text-[9px]"
                    >
                      {paymentStatusLabel(order.payment_status)}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">{formatCurrency(order.total)}</span>
                    {isExpanded ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-3 pb-3 pt-2">
                    <div className="mb-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span>Data: {formatDate(order.date)}</span>
                      {order.payment_method && <span>· Pagamento: {paymentMethodLabel(order.payment_method)}</span>}
                    </div>

                    {order.dogbooks.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">Dogbooks</p>
                        {order.dogbooks.map((d) => (
                          <div key={d.sub_number} className="mb-1 flex items-center justify-between rounded border-l-2 border-l-primary/30 bg-muted/10 px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <BookOpen className="size-3 text-primary/50" />
                              <div>
                                <span className="font-mono text-[10px] text-primary/70">{d.sub_number}</span>
                                <span className="ml-1.5 text-xs text-foreground">
                                  {themeLabel(d.theme)}{d.pet ? ` (${d.pet.name})` : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <ImageIcon className="size-2.5" />
                                {d.photos_uploaded}/{d.photos_max}
                              </div>
                              <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${stageColor(d.stage)}`}>
                                {stageLabel(d.stage)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {order.sessions.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">Sessoes Fotograficas</p>
                        {order.sessions.map((s) => (
                          <div key={s.session_number} className="mb-1 flex items-center justify-between rounded border-l-2 border-l-purple-300 bg-muted/10 px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <Camera className="size-3 text-purple-400" />
                              <div>
                                <span className="font-mono text-[10px] text-primary/70">{s.session_number}</span>
                                <span className={`ml-1 inline-flex rounded-full px-1 py-0.5 text-[8px] font-medium ${sessionTypeBadge(s.session_type)}`}>
                                  {sessionTypeLabel(s.session_type)}
                                </span>
                                {s.pet && <span className="ml-1 text-xs text-foreground">{s.pet.name}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {s.scheduled_date && (
                                <span className="text-[9px] text-muted-foreground">{formatDate(s.scheduled_date)}</span>
                              )}
                              {s.total_photos && s.total_photos > 0 && (
                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                  <ImageIcon className="size-2.5" />
                                  {s.total_photos}
                                </div>
                              )}
                              <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${stageColor(s.status)}`}>
                                {stageLabel(s.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhuma compra realizada
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────── Page ────────────────────── */

export default function ClientesPage() {
  const supabase = createClient();

  const [customers, setCustomers] = useState<DbCustomer[]>([]);
  const [allOrders, setAllOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail sheet state
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);
  const [detailOrders, setDetailOrders] = useState<EnrichedOrder[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [statusFilter, setStatusFilter] = useState<DerivedStatus | "todos">("todos");
  const [deleteClient, setDeleteClient] = useState<DbCustomer | null>(null);
  const [deletingClient, setDeletingClient] = useState(false);
  const [editClient, setEditClient] = useState<DbCustomer | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  // New client form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPets, setNewPets] = useState<NewPetField[]>([{ ...emptyPet }]);

  // Address form state
  const [newCep, setNewCep] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newComplement, setNewComplement] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editComplement, setEditComplement] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");

  const cepLookup = useCepLookup(
    useMemo(() => ({
      onSuccess: (data) => {
        setNewStreet(data.logradouro || "");
        setNewNeighborhood(data.bairro || "");
        setNewCity(data.localidade || "");
        setNewState(data.uf || "");
        if (data.complemento) setNewComplement(data.complemento);
      },
    }), [])
  );

  const editCepLookup = useCepLookup(
    useMemo(() => ({
      onSuccess: (data) => {
        setEditStreet(data.logradouro || "");
        setEditNeighborhood(data.bairro || "");
        setEditCity(data.localidade || "");
        setEditState(data.uf || "");
        if (data.complemento) setEditComplement(data.complemento);
      },
    }), [])
  );

  /* ── Fetch customers with pets ── */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*, pets(*)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar clientes", { description: error.message });
      setLoading(false);
      return;
    }

    setCustomers((data as DbCustomer[]) || []);

    // Also fetch all orders for KPI calculations
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersError && ordersData) {
      setAllOrders(ordersData as DbOrder[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /* ── Fetch detail data for a customer (lazy load) ── */
  const fetchCustomerDetail = useCallback(async (customerId: string) => {
    setLoadingDetail(true);
    setDetailCustomerId(customerId);
    setDetailOrders([]);

    // Fetch orders
    const { data: ordersData, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      toast.error("Erro ao carregar pedidos", { description: ordersErr.message });
      setLoadingDetail(false);
      return;
    }

    const orders = (ordersData as DbOrder[]) || [];

    // Fetch dogbooks for this customer
    const { data: dogbooksData } = await supabase
      .from("dogbooks")
      .select("*, pet:pets(*)")
      .eq("customer_id", customerId);

    // Fetch photo sessions for this customer
    const { data: sessionsData } = await supabase
      .from("photo_sessions")
      .select("*, pet:pets(*)")
      .eq("customer_id", customerId);

    const dogbooks = (dogbooksData as DbDogbook[]) || [];
    const sessions = (sessionsData as DbPhotoSession[]) || [];

    // Group dogbooks and sessions by order
    const enriched: EnrichedOrder[] = orders.map((order) => {
      const orderDogbooks = dogbooks.filter((d) => d.order_id === order.id);
      const orderSessions = sessions.filter((s) => s.order_id === order.id);
      const hasDogbooks = orderDogbooks.length > 0;
      const hasSessions = orderSessions.length > 0;
      let type: "dogbook" | "sessao" | "misto" = "dogbook";
      if (hasDogbooks && hasSessions) type = "misto";
      else if (hasSessions) type = "sessao";

      return {
        id: order.id,
        order_number: order.order_number,
        date: order.created_at,
        type,
        total: Number(order.total) || 0,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        coupon_id: order.coupon_id,
        dogbooks: orderDogbooks,
        sessions: orderSessions,
      };
    });

    setDetailOrders(enriched);
    setLoadingDetail(false);
  }, [supabase]);

  /* ── Derive orders per customer for table stats ── */
  const customerOrdersMap = useMemo(() => {
    const map = new Map<string, DbOrder[]>();
    allOrders.forEach((o) => {
      if (!map.has(o.customer_id)) map.set(o.customer_id, []);
      map.get(o.customer_id)!.push(o);
    });
    return map;
  }, [allOrders]);

  const addPet = () => {
    if (newPets.length < 10) {
      setNewPets([...newPets, { ...emptyPet }]);
    }
  };

  const removePet = (idx: number) => {
    setNewPets(newPets.filter((_, i) => i !== idx));
  };

  const updatePet = (idx: number, field: keyof NewPetField, value: string) => {
    setNewPets(
      newPets.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const resetNewForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewCpf("");
    setNewNotes("");
    setNewPets([{ ...emptyPet }]);
    setNewCep("");
    setNewStreet("");
    setNewNumber("");
    setNewComplement("");
    setNewNeighborhood("");
    setNewCity("");
    setNewState("");
  };

  /* ── Create customer ── */
  const handleCreateCustomer = async () => {
    if (!newName.trim()) {
      toast.error("Nome e obrigatorio");
      return;
    }
    if (!newPhone.trim()) {
      toast.error("Telefone e obrigatorio");
      return;
    }

    setSavingNew(true);
    try {
      const { data: customerData, error: customerErr } = await supabase
        .from("customers")
        .insert({
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          cpf: newCpf.trim() || null,
          cep: newCep.trim() || null,
          street: newStreet.trim() || null,
          number: newNumber.trim() || null,
          complement: newComplement.trim() || null,
          neighborhood: newNeighborhood.trim() || null,
          city: newCity.trim() || null,
          state: newState.trim() || null,
          notes: newNotes.trim() || null,
        })
        .select()
        .single();

      if (customerErr) throw customerErr;

      // Insert pets
      const validPets = newPets.filter((p) => p.name.trim());
      if (validPets.length > 0 && customerData) {
        const { error: petsErr } = await supabase.from("pets").insert(
          validPets.map((p) => ({
            customer_id: customerData.id,
            name: p.name.trim(),
            breed: p.breed.trim() || "",
            birthday: p.birthDate || null,
          }))
        );
        if (petsErr) {
          toast.error("Cliente criado, mas erro ao cadastrar pets", { description: petsErr.message });
        }
      }

      toast.success("Cliente cadastrado com sucesso!");
      setShowNewClientModal(false);
      resetNewForm();
      fetchCustomers();
    } catch (err: any) {
      toast.error("Erro ao cadastrar cliente", { description: err.message });
    } finally {
      setSavingNew(false);
    }
  };

  /* ── Edit customer ── */
  const handleOpenEdit = (customer: DbCustomer) => {
    setEditClient(customer);
    setEditName(customer.name);
    setEditEmail(customer.email);
    setEditPhone(customer.phone);
    setEditCpf(customer.cpf || "");
    setEditNotes(customer.notes || "");
    setEditCep(customer.cep || "");
    setEditStreet(customer.street || "");
    setEditNumber(customer.number || "");
    setEditComplement(customer.complement || "");
    setEditNeighborhood(customer.neighborhood || "");
    setEditCity(customer.city || "");
    setEditState(customer.state || "");
  };

  const handleSaveEdit = async () => {
    if (!editClient) return;
    if (!editName.trim()) {
      toast.error("Nome e obrigatorio");
      return;
    }

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          cpf: editCpf.trim() || null,
          notes: editNotes.trim() || null,
          cep: editCep.trim() || null,
          street: editStreet.trim() || null,
          number: editNumber.trim() || null,
          complement: editComplement.trim() || null,
          neighborhood: editNeighborhood.trim() || null,
          city: editCity.trim() || null,
          state: editState.trim() || null,
        })
        .eq("id", editClient.id);

      if (error) throw error;

      toast.success("Cliente atualizado com sucesso!");
      setEditClient(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error("Erro ao atualizar cliente", { description: err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  /* ── Delete customer ── */
  const handleDeleteCustomer = async () => {
    if (!deleteClient) return;
    setDeletingClient(true);
    try {
      // Delete pets first (cascade may handle this, but let's be safe)
      await supabase.from("pets").delete().eq("customer_id", deleteClient.id);

      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", deleteClient.id);

      if (error) throw error;

      toast.success("Cliente excluido com sucesso!");
      setDeleteClient(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error("Erro ao excluir cliente", { description: err.message });
    } finally {
      setDeletingClient(false);
    }
  };

  /* ── Reset password ── */
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ email: string; name: string } | null>(null);

  const handleResetPassword = async (email: string, name: string) => {
    setResettingEmail(email);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar email");
      }
      toast.success(`Email de redefinicao de senha enviado para ${name}!`, {
        description: `Um link foi enviado para ${email}.`,
      });
    } catch (err: any) {
      toast.error("Erro ao enviar email de redefinicao.", {
        description: err.message,
      });
    } finally {
      setResettingEmail(null);
    }
  };

  /* ── Filtering ── */
  const customersWithStatus = useMemo(() => {
    return customers.map((c) => ({
      ...c,
      _status: deriveStatus(c, customerOrdersMap.get(c.id) || []),
      _orders: customerOrdersMap.get(c.id) || [],
    }));
  }, [customers, customerOrdersMap]);

  const filteredClients = useMemo(() => {
    return customersWithStatus.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.pets.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "todos" || customer._status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customersWithStatus, searchTerm, statusFilter]);

  /* KPIs - filtered by date range */
  const clientsInRange = customersWithStatus.filter((c) => isInRange(c.created_at, dateRange));
  const totalClients = clientsInRange.length;
  const totalPets = clientsInRange.reduce((sum, c) => sum + c.pets.length, 0);
  const ordersInRange = allOrders.filter((o) => isInRange(o.created_at, dateRange));
  const totalPurchases = ordersInRange.length;
  const paidOrdersInRange = ordersInRange.filter((o) => o.payment_status === "pago");
  const totalRevenue = paidOrdersInRange.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeClients = customersWithStatus.filter((c) =>
    c._orders.some((o) => isInRange(o.created_at, dateRange))
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus clientes, pets e historico de compras
          </p>
        </div>

        {/* New Client Button */}
        <Dialog open={showNewClientModal} onOpenChange={(open) => {
          setShowNewClientModal(open);
          if (!open) resetNewForm();
        }}>
          <DialogTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#8b5e5e] px-4 text-sm font-medium text-white hover:bg-[#7a4f4f]">
            <UserPlus className="size-4" />
            Novo Cliente
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-[#8b5e5e]" />
                Novo Cliente
              </DialogTitle>
              <DialogDescription>
                Cadastre um novo cliente preenchendo os dados abaixo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Basic info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label className="text-xs">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label className="text-xs">
                    Telefone/WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="(11) 99999-9999"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={newCpf}
                    onChange={(e) => setNewCpf(e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Endereco
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">CEP</Label>
                    <div className="relative">
                      <Input
                        placeholder="00000-000"
                        value={newCep}
                        onChange={(e) => setNewCep(e.target.value)}
                        onBlur={() => cepLookup.fetchCep(newCep)}
                      />
                      {cepLookup.loading && (
                        <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-1 sm:col-span-1">
                    <Label className="text-xs">Rua</Label>
                    <Input
                      placeholder="Rua"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Numero</Label>
                    <Input
                      placeholder="N°"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Complemento</Label>
                    <Input
                      placeholder="Apto, Sala..."
                      value={newComplement}
                      onChange={(e) => setNewComplement(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Bairro</Label>
                    <Input
                      placeholder="Bairro"
                      value={newNeighborhood}
                      onChange={(e) => setNewNeighborhood(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Cidade</Label>
                    <Input
                      placeholder="Cidade"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Estado</Label>
                    <Input
                      placeholder="UF"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Endereco Completo</Label>
                  <div className="relative">
                    <Input
                      readOnly
                      value={
                        [newStreet, newNumber, newComplement, newNeighborhood, newCity, newState, newCep]
                          .filter(Boolean)
                          .join(", ") || ""
                      }
                      placeholder="Preenchido automaticamente"
                      className="bg-muted/30 pr-9"
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const addr = [newStreet, newNumber, newComplement, newNeighborhood, newCity, newState, newCep].filter(Boolean).join(", ");
                        navigator.clipboard.writeText(addr);
                        toast.success("Endereco copiado!");
                      }}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pets */}
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    🐾 Pets ({newPets.length}/10)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPet}
                    disabled={newPets.length >= 10}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1 size-3" />
                    Adicionar Pet
                  </Button>
                </div>

                {newPets.map((pet, idx) => (
                  <div key={idx} className="relative rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">
                        Pet {idx + 1}
                      </p>
                      {newPets.length > 1 && (
                        <button
                          onClick={() => removePet(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-amber-50">
                        🐾
                      </div>
                      <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div className="grid gap-1">
                          <Label className="text-xs">
                            Nome <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Nome do pet"
                            value={pet.name}
                            onChange={(e) => updatePet(idx, "name", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Raca</Label>
                          <Input
                            placeholder="Raca"
                            value={pet.breed}
                            onChange={(e) => updatePet(idx, "breed", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Data de Nascimento</Label>
                          <Input
                            type="date"
                            value={pet.birthDate}
                            onChange={(e) => updatePet(idx, "birthDate", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Idade</Label>
                          <Input
                            readOnly
                            value={pet.birthDate ? calculateAge(pet.birthDate) : ""}
                            placeholder="Calculada automaticamente"
                            className="bg-muted/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="grid gap-1">
                <Label className="text-xs">Observacoes</Label>
                <textarea
                  placeholder="Observacoes sobre o cliente..."
                  className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowNewClientModal(false); resetNewForm(); }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#8b5e5e] hover:bg-[#7a4f4f]"
                onClick={handleCreateCustomer}
                disabled={savingNew}
              >
                {savingNew && <Loader2 className="mr-2 size-4 animate-spin" />}
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Filter */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Novos Clientes
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dog className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Pets Cadastrados
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalPets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Compras
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalPurchases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-green-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Receita
              </p>
            </div>
            <p className="mt-2 text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Clientes Ativos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{activeClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Ticket Medio
              </p>
            </div>
            <p className="mt-2 text-lg font-bold text-blue-600">
              {paidOrdersInRange.length > 0 ? formatCurrency(totalRevenue / paidOrdersInRange.length) : "R$ 0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Lista de Clientes</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou pet..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(["todos", "ativo", "novo", "inativo"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-[#8b5e5e] text-white"
                      : "border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s === "todos" ? "Todos" : s === "ativo" ? "Ativos" : s === "novo" ? "Novos" : "Inativos"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
              <span className="ml-3 text-sm text-muted-foreground">Carregando clientes...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead className="hidden md:table-cell">Pets</TableHead>
                      <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                      <TableHead className="text-center">Pedidos</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Total Gasto</TableHead>
                      <TableHead className="hidden xl:table-cell">Ultimo Pedido</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((customer) => {
                      const orders = customer._orders;
                      const totalSpent = orders
                        .filter((o) => o.payment_status === "pago")
                        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                      const lastOrder = orders.length > 0 ? orders[0] : null;

                      return (
                        <TableRow key={customer.id}>
                          {/* Client avatar + name + status */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-xs font-bold text-[#8b5e5e]">
                                {getInitials(customer.name)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {customer.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1">
                                  <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${statusColor(customer._status)}`}>
                                    {statusLabel(customer._status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact */}
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-xs text-foreground">
                                <Phone className="size-3 text-muted-foreground" />
                                {customer.phone}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Mail className="size-3" />
                                {customer.email}
                              </span>
                            </div>
                          </TableCell>

                          {/* Pets */}
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {customer.pets.map((pet) => (
                                <span
                                  key={pet.id}
                                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800"
                                >
                                  🐾 {pet.name}
                                  {pet.breed && (
                                    <span className="text-amber-600/60">
                                      ({pet.breed})
                                    </span>
                                  )}
                                </span>
                              ))}
                              {customer.pets.length === 0 && (
                                <span className="text-[10px] text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>

                          {/* City */}
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {customer.city && customer.state
                              ? `${customer.city}, ${customer.state}`
                              : customer.city || customer.state || "-"}
                          </TableCell>

                          {/* Orders */}
                          <TableCell className="text-center">
                            <span className="text-sm font-semibold text-foreground">
                              {orders.length}
                            </span>
                          </TableCell>

                          {/* Total Spent */}
                          <TableCell className="text-right hidden sm:table-cell">
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(totalSpent)}
                            </span>
                          </TableCell>

                          {/* Last Order */}
                          <TableCell className="hidden xl:table-cell">
                            {lastOrder ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[10px] text-primary/70">{lastOrder.order_number}</span>
                                <span className="text-[10px] text-muted-foreground">{formatDate(lastOrder.created_at)}</span>
                                <Badge
                                  variant={paymentStatusVariant(lastOrder.payment_status)}
                                  className="w-fit text-[8px]"
                                >
                                  {paymentStatusLabel(lastOrder.payment_status)}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">-</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {/* History Sheet */}
                              <Sheet onOpenChange={(open) => {
                                if (open) fetchCustomerDetail(customer.id);
                              }}>
                                <SheetTrigger className="inline-flex size-7 items-center justify-center rounded-md text-[#8b5e5e] hover:bg-muted" title="Investigar cliente">
                                  <FileSearch className="size-3.5" />
                                </SheetTrigger>
                                <SheetContent className="w-full overflow-y-auto sm:min-w-[50vw] sm:max-w-[70vw] p-0">
                                  <div className="mx-auto w-[90%] py-6">
                                    <SheetHeader>
                                      <SheetTitle className="flex items-center gap-2 text-[#8b5e5e]">
                                        <FileSearch className="size-4" />
                                        Historico do Cliente
                                      </SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4">
                                      <ClientHistoryPanel
                                        customer={customer}
                                        orders={detailCustomerId === customer.id ? detailOrders : []}
                                        loadingDetail={detailCustomerId === customer.id && loadingDetail}
                                      />
                                    </div>
                                  </div>
                                </SheetContent>
                              </Sheet>

                              {/* Edit */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-[#8b5e5e]"
                                title="Editar cliente"
                                onClick={() => handleOpenEdit(customer)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>

                              {/* WhatsApp */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-green-600"
                                title="Enviar mensagem via WhatsApp"
                                onClick={() => {
                                  const phone = customer.phone.replace(/\D/g, "");
                                  const fullPhone = phone.startsWith("55") ? phone : `55${phone}`;
                                  const message = encodeURIComponent(
                                    `Ola ${customer.name.split(" ")[0]}, tudo bem? Aqui e a equipe Patas, Amor e Memorias! 🐾`
                                  );
                                  window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
                                }}
                              >
                                <MessageSquare className="size-3.5" />
                              </Button>

                              {/* Reset Password */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-amber-600"
                                title="Resetar senha do cliente"
                                disabled={resettingEmail === customer.email}
                                onClick={() => setResetTarget({ email: customer.email, name: customer.name })}
                              >
                                {resettingEmail === customer.email ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <KeyRound className="size-3.5" />
                                )}
                              </Button>

                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-red-500"
                                title="Excluir cliente"
                                onClick={() => setDeleteClient(customer)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredClients.length === 0 && !loading && (
                <div className="py-12 text-center">
                  <Users className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhum cliente encontrado
                  </p>
                </div>
              )}

              {/* Results count */}
              <div className="border-t px-4 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {filteredClients.length} de {customers.length} clientes
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteClient} onOpenChange={(open) => !open && setDeleteClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Confirmar Exclusao
            </DialogTitle>
            <DialogDescription className="pt-2">
              Tem certeza que deseja excluir o cliente{" "}
              <span className="font-semibold text-foreground">{deleteClient?.name}</span>?
              Esta acao nao podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteClient && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">
                Ao excluir este cliente, todos os dados associados serao removidos permanentemente,
                incluindo pets cadastrados.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteClient(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={deletingClient}
            >
              {deletingClient && <Loader2 className="mr-2 size-4 animate-spin" />}
              <Trash2 className="mr-2 size-4" />
              Excluir Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#8b5e5e]">
              <Pencil className="size-4" />
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Edite as informacoes de {editClient?.name}
            </DialogDescription>
          </DialogHeader>
          {editClient && (
            <div className="space-y-5">
              {/* Personal Info */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dados Pessoais
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      type="email"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={editCpf}
                      onChange={(e) => setEditCpf(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Endereco
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>CEP</Label>
                    <div className="relative">
                      <Input
                        value={editCep}
                        onChange={(e) => setEditCep(e.target.value)}
                        onBlur={() => editCepLookup.fetchCep(editCep)}
                        className="mt-1"
                        placeholder="00000-000"
                      />
                      {editCepLookup.loading && (
                        <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Rua</Label>
                    <Input
                      value={editStreet}
                      onChange={(e) => setEditStreet(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Numero</Label>
                    <Input
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input
                      value={editComplement}
                      onChange={(e) => setEditComplement(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Observacoes
                </p>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Observacoes sobre o cliente..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditClient(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#8b5e5e] text-white hover:bg-[#7a5050]"
              onClick={handleSaveEdit}
              disabled={savingEdit}
            >
              {savingEdit && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar Alteracoes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Resetar Senha</DialogTitle>
            <DialogDescription>
              Um email de redefinicao de senha sera enviado para{" "}
              <strong>{resetTarget?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">
                {resetTarget?.name} recebera um link para criar uma nova senha.
              </p>
              <p className="mt-1 text-xs text-amber-600">
                O link expira em 24 horas.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetTarget(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!!resettingEmail}
              onClick={async () => {
                if (resetTarget) {
                  await handleResetPassword(resetTarget.email, resetTarget.name);
                  setResetTarget(null);
                }
              }}
            >
              {resettingEmail ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Enviar Email de Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
