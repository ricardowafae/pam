"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DateRangeFilter,
  type DateRange,
  isInRange,
  getDefault30DayRange,
} from "@/components/admin/DateRangeFilter";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  AlertTriangle,
  CreditCard,
  Send,
  MessageCircle,
  Mail,
  Tag,
  Eye,
  ChevronDown,
  ChevronUp,
  Target,
  UserCheck,
  UserX,
  XCircle,
  ArrowRight,
  BarChart3,
  Percent,
  DollarSign,
  Clock,
  RefreshCw,
  ExternalLink,
  Copy,
  Link2,
  Ticket,
  LayoutList,
  Columns3,
  GripVertical,
  CheckCircle2,
  Banknote,
  QrCode,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/* ────────────────────── Types ────────────────────── */

type LeadStatus =
  | "visitante"
  | "carrinho"
  | "checkout_iniciado"
  | "pagamento_falhou"
  | "pix_expirado"
  | "boleto_pendente"
  | "pix_pendente"
  | "boleto_compensado"
  | "pix_compensado"
  | "convertido"
  | "resgatado";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: LeadStatus;
  product: string;
  cartValue: number | null;
  source: string;
  influencerId: string | null;
  influencerName: string | null;
  recoveryLink: string;
  couponSent: boolean;
  couponId: string | null;
  couponCode: string | null;
  lastActivity: string;
  sessions: number;
  pagesViewed: number;
  recovered: boolean;
}

/* ────────────────────── Standard Coupons (from centralized config) ────────────────────── */

import { FIXED_COUPONS, formatBRL } from "@/lib/pricing-config";

const standardCoupons = FIXED_COUPONS.filter((c) => c.active).map((c) => ({
  code: c.code,
  value: c.type === "fixed" ? `R$ ${formatBRL(c.discountValue)}` : `${c.discountValue}%`,
  label: c.type === "fixed" ? `R$ ${formatBRL(c.discountValue)} OFF` : `${c.discountValue}% OFF`,
}));

/* ────────────────────── Helpers ────────────────────── */

function statusLabel(status: LeadStatus): string {
  switch (status) {
    case "visitante": return "Visitante";
    case "carrinho": return "Carrinho Abandonado";
    case "checkout_iniciado": return "Checkout Abandonado";
    case "pagamento_falhou": return "Pagamento Falhou";
    case "pix_expirado": return "PIX Expirado";
    case "boleto_pendente": return "Boleto Pendente";
    case "pix_pendente": return "PIX Pendente";
    case "boleto_compensado": return "Boleto Compensado";
    case "pix_compensado": return "PIX Compensado";
    case "convertido": return "Convertido";
    case "resgatado": return "Resgatado";
  }
}

function statusBadgeColor(status: LeadStatus): string {
  switch (status) {
    case "convertido": return "bg-green-100 text-green-700 border-green-200";
    case "resgatado": return "bg-blue-100 text-blue-700 border-blue-200";
    case "carrinho": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "checkout_iniciado": return "bg-orange-100 text-orange-700 border-orange-200";
    case "pagamento_falhou": return "bg-red-100 text-red-700 border-red-200";
    case "pix_expirado": return "bg-red-100 text-red-600 border-red-200";
    case "boleto_pendente": return "bg-amber-100 text-amber-700 border-amber-200";
    case "pix_pendente": return "bg-amber-100 text-amber-600 border-amber-200";
    case "boleto_compensado": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pix_compensado": return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "visitante": return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

/** Derive a human-readable abandon/failure reason from the status itself */
function reasonFromStatus(status: LeadStatus): string {
  switch (status) {
    case "carrinho": return "Desistiu no carrinho";
    case "checkout_iniciado": return "Abandonou checkout";
    case "pagamento_falhou": return "Erro no pagamento";
    case "pix_expirado": return "PIX expirou";
    case "boleto_pendente": return "Boleto pendente";
    case "pix_pendente": return "PIX pendente";
    default: return "-";
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCartValue(value: number | null): string {
  if (value === null || value === 0) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getRecoveryLinkLabel(lead: Lead): string {
  if (lead.influencerName) {
    return `Link do ${lead.influencerName}`;
  }
  if (lead.status === "carrinho" || lead.status === "checkout_iniciado") {
    return "Carrinho";
  }
  return "Loja";
}

function getFullRecoveryUrl(lead: Lead): string {
  const base = "https://patasamorememorias.com.br";
  if (lead.recoveryLink) {
    return `${base}${lead.recoveryLink.startsWith("/") ? "" : "/"}${lead.recoveryLink}`;
  }
  return `${base}/`;
}

/** Statuses that count as "abandoned / failed" (not converted, not visitor, not recovered) */
const ABANDON_STATUSES: LeadStatus[] = [
  "carrinho",
  "checkout_iniciado",
  "pagamento_falhou",
  "pix_expirado",
  "boleto_pendente",
  "pix_pendente",
];

/** Statuses that count as converted revenue */
const CONVERTED_STATUSES: LeadStatus[] = [
  "convertido",
  "resgatado",
  "boleto_compensado",
  "pix_compensado",
];

/* ────────────────────── Data fetching ────────────────────── */

async function fetchLeads(): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      name,
      email,
      phone,
      status,
      source,
      product_interest,
      influencer_id,
      cart_value,
      recovery_link,
      coupon_sent,
      coupon_id,
      recovered,
      sessions_count,
      pages_viewed,
      last_activity,
      created_at,
      updated_at,
      coupons ( id, code ),
      influencers ( id, name, slug )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    date: row.created_at ?? "",
    status: row.status as LeadStatus,
    product: row.product_interest ?? "-",
    cartValue: row.cart_value != null ? Number(row.cart_value) : null,
    source: row.source ?? "",
    influencerId: row.influencer_id,
    influencerName: row.influencers?.name ?? null,
    recoveryLink: row.recovery_link ?? "/",
    couponSent: row.coupon_sent ?? false,
    couponId: row.coupon_id,
    couponCode: row.coupons?.code ?? null,
    lastActivity: row.last_activity ?? row.updated_at ?? row.created_at ?? "",
    sessions: row.sessions_count ?? 0,
    pagesViewed: row.pages_viewed ?? 0,
    recovered: row.recovered ?? false,
  }));
}

/* ────────────────────── Page ────────────────────── */

export default function ConversaoPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "todos" | "nao_convertidos">("todos");
  const [sourceFilter, setSourceFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [couponDialogLead, setCouponDialogLead] = useState<Lead | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");

  /* ─── Load data ─── */
  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLeads();
      setLeads(data);
    } catch (err: any) {
      console.error("Failed to load leads:", err);
      toast.error("Erro ao carregar leads", {
        description: err?.message ?? "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  /* ─── Supabase actions ─── */
  async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const supabase = createClient();
    setActionLoading(leadId);
    try {
      const updatePayload: Record<string, any> = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === "resgatado") {
        updatePayload.recovered = true;
      }
      const { error } = await supabase.from("leads").update(updatePayload).eq("id", leadId);
      if (error) throw error;
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status: newStatus, recovered: newStatus === "resgatado" ? true : l.recovered }
            : l
        )
      );
      toast.success("Status atualizado com sucesso");
    } catch (err: any) {
      toast.error("Erro ao atualizar status", { description: err?.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function sendCouponToLead(lead: Lead, couponCode: string) {
    const supabase = createClient();
    setActionLoading(lead.id);
    try {
      // Find the coupon id from the coupons table
      const { data: couponData, error: couponError } = await supabase
        .from("coupons")
        .select("id, code")
        .eq("code", couponCode)
        .single();

      if (couponError) throw couponError;

      const { error } = await supabase
        .from("leads")
        .update({
          coupon_sent: true,
          coupon_id: couponData.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, couponSent: true, couponId: couponData.id, couponCode: couponData.code }
            : l
        )
      );
      setCouponDialogLead(null);
      toast.success("Cupom vinculado ao lead", {
        description: `Cupom ${couponCode} enviado para ${lead.name}`,
      });
    } catch (err: any) {
      toast.error("Erro ao enviar cupom", { description: err?.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function markAsRecovered(lead: Lead) {
    await updateLeadStatus(lead.id, "resgatado");
  }

  /* ─── KPIs (filtered by date range) ─── */
  const leadsInRange = leads.filter((l) => isInRange(l.date, dateRange));

  const totalLeads = leadsInRange.length;
  const convertidos = leadsInRange.filter((l) => l.status === "convertido").length;
  const resgatados = leadsInRange.filter((l) => l.status === "resgatado").length;
  const carrinhoAbandonado = leadsInRange.filter((l) => l.status === "carrinho").length;
  const checkoutAbandonado = leadsInRange.filter((l) => l.status === "checkout_iniciado").length;
  const pagamentoFalhou = leadsInRange.filter((l) => l.status === "pagamento_falhou").length;
  const pixExpirado = leadsInRange.filter((l) => l.status === "pix_expirado").length;
  const visitantes = leadsInRange.filter((l) => l.status === "visitante").length;
  const boletoPendente = leadsInRange.filter((l) => l.status === "boleto_pendente").length;
  const pixPendente = leadsInRange.filter((l) => l.status === "pix_pendente").length;

  const totalConvertidos = leadsInRange.filter((l) => CONVERTED_STATUSES.includes(l.status)).length;
  const taxaConversao = totalLeads > 0
    ? ((totalConvertidos / totalLeads) * 100).toFixed(1)
    : "0.0";

  const totalAbandoned = leadsInRange.filter((l) => ABANDON_STATUSES.includes(l.status)).length;
  const taxaAbandono = totalLeads > 0
    ? ((totalAbandoned / totalLeads) * 100).toFixed(1)
    : "0.0";

  const taxaResgate = (totalAbandoned + resgatados) > 0
    ? (
        (resgatados /
          (totalAbandoned + resgatados)) *
        100
      ).toFixed(1)
    : "0.0";

  const receitaConvertida = leadsInRange
    .filter((l) => CONVERTED_STATUSES.includes(l.status))
    .reduce((sum, l) => sum + (l.cartValue ?? 0), 0);

  const receitaPerdida = leadsInRange
    .filter((l) => ABANDON_STATUSES.includes(l.status))
    .reduce((sum, l) => sum + (l.cartValue ?? 0), 0);

  const couponsSent = leadsInRange.filter((l) => l.couponSent).length;
  const pendingRecovery = leadsInRange.filter(
    (l) =>
      !l.couponSent &&
      !l.recovered &&
      !CONVERTED_STATUSES.includes(l.status) &&
      l.status !== "visitante"
  ).length;

  /* ─── Sources ─── */
  const allSources = Array.from(new Set(leads.map((l) => l.source).filter(Boolean)));

  /* ─── Filtered ─── */
  const filteredLeads = leadsInRange.filter((l) => {
    const matchesSearch =
      searchTerm === "" ||
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "nao_convertidos"
        ? !CONVERTED_STATUSES.includes(l.status) && l.status !== "visitante"
        : l.status === statusFilter);
    const matchesSource =
      sourceFilter === "todos" || l.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  /* ─── Coupon Dialog Handlers ─── */
  function openCouponDialog(lead: Lead) {
    setCouponDialogLead(lead);
    setSelectedCoupon("");
  }

  /* ─── Recovery Link Cell ─── */
  function RecoveryLinkCell({ lead }: { lead: Lead }) {
    const fullUrl = getFullRecoveryUrl(lead);
    const label = getRecoveryLinkLabel(lead);

    return (
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-[#8b5e5e]">
            {label}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {lead.recoveryLink}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-[#8b5e5e] hover:bg-[#8b5e5e]/10"
          title="Copiar link"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(fullUrl);
            toast.success("Link copiado!");
          }}
        >
          <Copy className="size-3.5" />
        </Button>
      </div>
    );
  }

  /* ─── Action Buttons Component ─── */
  function ActionButtons({ lead, size = "default" }: { lead: Lead; size?: "default" | "large" }) {
    const isLarge = size === "large";
    const btnClass = isLarge
      ? "h-9 gap-1.5 px-3 text-xs font-medium"
      : "h-8 gap-1.5 px-2.5 text-[11px] font-medium";
    const iconClass = isLarge ? "size-4" : "size-3.5";
    const isLoading = actionLoading === lead.id;

    const showActions =
      !CONVERTED_STATUSES.includes(lead.status) &&
      lead.status !== "visitante" &&
      !lead.couponSent;

    const showMarkRecovered =
      !CONVERTED_STATUSES.includes(lead.status) &&
      lead.status !== "visitante" &&
      !lead.recovered &&
      lead.couponSent;

    return (
      <div className="flex items-center gap-1.5">
        {showActions && (
          <>
            <Button
              variant="outline"
              className={`${btnClass} border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700`}
              title="Enviar por e-mail"
              disabled={isLoading}
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className={iconClass} />
              E-mail
            </Button>
            <Button
              variant="outline"
              className={`${btnClass} border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700`}
              title="Enviar por WhatsApp"
              disabled={isLoading}
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className={iconClass} />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className={`${btnClass} border-[#8b5e5e]/30 text-[#8b5e5e] hover:bg-[#8b5e5e]/10`}
              title="Enviar cupom"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                openCouponDialog(lead);
              }}
            >
              <Ticket className={iconClass} />
              Cupom
            </Button>
          </>
        )}
        {showMarkRecovered && (
          <Button
            variant="outline"
            className={`${btnClass} border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700`}
            title="Marcar como resgatado"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              markAsRecovered(lead);
            }}
          >
            {isLoading ? (
              <Loader2 className={`${iconClass} animate-spin`} />
            ) : (
              <CheckCircle2 className={iconClass} />
            )}
            Resgatado
          </Button>
        )}
      </div>
    );
  }

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
        <p className="text-sm text-muted-foreground">Carregando leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Conversao
          </h1>
          <p className="text-sm text-muted-foreground">
            Analise leads, carrinhos abandonados e oportunidades de resgate
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={loadLeads}
          disabled={loading}
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* ─── Date Filter ─── */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* ─── KPI Dashboard ─── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Total Leads
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalLeads}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-green-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Taxa de Conversao
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {taxaConversao}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              {totalConvertidos} convertidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Taxa de Abandono
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {taxaAbandono}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              {totalAbandoned} nao convertidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="size-4 text-blue-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Taxa de Resgate
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {taxaResgate}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              {resgatados} resgatados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-red-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Receita Perdida
              </p>
            </div>
            <p className="mt-2 text-lg font-bold text-red-600">
              {receitaPerdida.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Potencial de recuperacao
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Funnel Summary ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="size-4 text-primary/60" />
            Funil de Conversao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
            {[
              { label: "Visitantes", count: visitantes, color: "bg-gray-200", textColor: "text-gray-700" },
              { label: "Carrinho", count: carrinhoAbandonado, color: "bg-yellow-200", textColor: "text-yellow-700" },
              { label: "Checkout", count: checkoutAbandonado, color: "bg-orange-200", textColor: "text-orange-700" },
              { label: "Pgto. Falhou", count: pagamentoFalhou, color: "bg-red-200", textColor: "text-red-700" },
              { label: "PIX Expirado", count: pixExpirado, color: "bg-red-100", textColor: "text-red-600" },
              { label: "Resgatados", count: resgatados, color: "bg-blue-200", textColor: "text-blue-700" },
              { label: "Convertidos", count: convertidos, color: "bg-green-200", textColor: "text-green-700" },
            ].map((step, idx) => (
              <div key={step.label} className="flex flex-1 items-center">
                <div className={`flex-1 rounded-lg ${step.color} p-3 text-center`}>
                  <p className={`text-lg font-bold ${step.textColor}`}>
                    {step.count}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {step.label}
                  </p>
                </div>
                {idx < 6 && (
                  <ArrowRight className="mx-1 hidden size-4 text-muted-foreground/40 sm:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Recovery Stats ─── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Pendentes de Resgate
            </p>
            <p className="mt-1 text-xl font-bold text-amber-600">
              {pendingRecovery}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Sem cupom enviado
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Cupons Enviados
            </p>
            <p className="mt-1 text-xl font-bold text-blue-600">
              {couponsSent}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Receita Convertida
            </p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {receitaConvertida.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-400">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Receita Perdida
            </p>
            <p className="mt-1 text-lg font-bold text-red-600">
              {receitaPerdida.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Todos os Leads</TabsTrigger>
          <TabsTrigger value="abandonos">Abandonos & Falhas</TabsTrigger>
          <TabsTrigger value="resgate">Resgate</TabsTrigger>
        </TabsList>

        {/* ════════════════════ Leads Tab ════════════════════ */}
        <TabsContent value="leads">
          {/* Filters */}
          <div className="mb-4 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, email ou produto..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as LeadStatus | "todos" | "nao_convertidos"
                  )
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todos os Status</option>
                <option value="nao_convertidos">Nao Convertidos</option>
                <option value="visitante">Visitante</option>
                <option value="carrinho">Carrinho Abandonado</option>
                <option value="checkout_iniciado">Checkout Abandonado</option>
                <option value="pagamento_falhou">Pagamento Falhou</option>
                <option value="pix_expirado">PIX Expirado</option>
                <option value="boleto_pendente">Boleto Pendente</option>
                <option value="pix_pendente">PIX Pendente</option>
                <option value="boleto_compensado">Boleto Compensado</option>
                <option value="pix_compensado">PIX Compensado</option>
                <option value="convertido">Convertido</option>
                <option value="resgatado">Resgatado</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todas as Fontes</option>
                {allSources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
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
                      <TableHead>Lead</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Motivo
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Valor
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Fonte
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Link2 className="size-3" />
                          Link de Retorno
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Cupom</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const isExpanded = expandedLeadId === lead.id;
                      return (
                        <>
                          <TableRow
                            key={lead.id}
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() =>
                              setExpandedLeadId(isExpanded ? null : lead.id)
                            }
                          >
                            <TableCell className="w-8 px-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedLeadId(
                                    isExpanded ? null : lead.id
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
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {lead.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {lead.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[180px] text-sm text-foreground">
                              <span className="line-clamp-1">{lead.product}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadgeColor(lead.status)}`}
                              >
                                {statusLabel(lead.status)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {reasonFromStatus(lead.status)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm font-medium text-foreground">
                              {formatCartValue(lead.cartValue)}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                              {lead.source || "-"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {lead.status !== "visitante" && lead.cartValue ? (
                                <RecoveryLinkCell lead={lead} />
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {lead.couponSent ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge variant="default" className="text-[9px]">
                                    {lead.couponCode ?? "Enviado"}
                                  </Badge>
                                </div>
                              ) : !CONVERTED_STATUSES.includes(lead.status) &&
                                lead.status !== "visitante" ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] text-amber-600"
                                >
                                  Pendente
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <ActionButtons lead={lead} />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded details */}
                          {isExpanded && (
                            <TableRow
                              key={`${lead.id}-detail`}
                              className="bg-muted/10"
                            >
                              <TableCell colSpan={10}>
                                <div className="space-y-3 px-4 py-3">
                                  <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                                    <div>
                                      <span className="font-medium uppercase">
                                        Telefone:
                                      </span>{" "}
                                      {lead.phone || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium uppercase">
                                        Sessoes:
                                      </span>{" "}
                                      {lead.sessions}
                                    </div>
                                    <div>
                                      <span className="font-medium uppercase">
                                        Paginas Visitadas:
                                      </span>{" "}
                                      {lead.pagesViewed}
                                    </div>
                                    <div>
                                      <span className="font-medium uppercase">
                                        Fonte:
                                      </span>{" "}
                                      {lead.source || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium uppercase">
                                        Data:
                                      </span>{" "}
                                      {formatDate(lead.date)}
                                    </div>
                                    <div>
                                      <span className="font-medium uppercase">
                                        Ultima Atividade:
                                      </span>{" "}
                                      {formatDate(lead.lastActivity)}
                                    </div>
                                    {lead.influencerName && (
                                      <div>
                                        <span className="font-medium uppercase">
                                          Influenciador:
                                        </span>{" "}
                                        <span className="text-[#8b5e5e] font-medium">
                                          {lead.influencerName}
                                        </span>
                                      </div>
                                    )}
                                    {lead.couponSent && (
                                      <div>
                                        <span className="font-medium uppercase">
                                          Cupom Enviado:
                                        </span>{" "}
                                        <span className="font-mono">
                                          {lead.couponCode ?? "Sim"}
                                        </span>
                                      </div>
                                    )}
                                    {lead.recovered && (
                                      <div>
                                        <Badge
                                          variant="default"
                                          className="bg-blue-600 text-[9px]"
                                        >
                                          Resgatado com sucesso
                                        </Badge>
                                      </div>
                                    )}
                                  </div>

                                  {/* Recovery link in expanded area */}
                                  {lead.status !== "visitante" && lead.cartValue && (
                                    <div className="flex items-center gap-2 rounded-lg bg-[#fdf8f4] p-2">
                                      <Link2 className="size-4 text-[#8b5e5e]" />
                                      <span className="text-xs font-medium text-[#8b5e5e]">
                                        Link de retorno:
                                      </span>
                                      <code className="rounded bg-white px-2 py-0.5 text-xs text-[#6b4c4c]">
                                        {getFullRecoveryUrl(lead)}
                                      </code>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 text-[#8b5e5e]"
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            getFullRecoveryUrl(lead)
                                          );
                                          toast.success("Link copiado!");
                                        }}
                                      >
                                        <Copy className="size-3" />
                                      </Button>
                                    </div>
                                  )}
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

              {filteredLeads.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhum lead encontrado com os filtros atuais
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════ Abandonos Tab ════════════════════ */}
        <TabsContent value="abandonos">
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Leads que nao finalizaram a compra — oportunidades de resgate via cupom ou contato direto.
            </p>

            {/* Abandon breakdown */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card className="border-l-4 border-l-yellow-400">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="size-3.5 text-yellow-600" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      Carrinho Abandonado
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-yellow-600">
                    {carrinhoAbandonado}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-400">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="size-3.5 text-orange-600" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      Checkout Abandonado
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-orange-600">
                    {checkoutAbandonado}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-3.5 text-red-600" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      Pagamento Falhou
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-red-600">
                    {pagamentoFalhou}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-red-500" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      PIX Expirado
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-red-500">
                    {pixExpirado}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Abandon leads table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Link2 className="size-3" />
                            Link de Retorno
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          Cupom
                        </TableHead>
                        <TableHead className="text-right">
                          Acoes de Resgate
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsInRange
                        .filter((l) => ABANDON_STATUSES.includes(l.status))
                        .map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {lead.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {lead.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              {lead.product}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadgeColor(lead.status)}`}
                              >
                                {reasonFromStatus(lead.status)}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {formatCartValue(lead.cartValue)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {lead.source || "-"}
                            </TableCell>
                            <TableCell>
                              <RecoveryLinkCell lead={lead} />
                            </TableCell>
                            <TableCell className="text-center">
                              {lead.couponSent ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge
                                    variant="default"
                                    className="text-[9px]"
                                  >
                                    {lead.couponCode ?? "Enviado"}
                                  </Badge>
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] text-amber-600"
                                >
                                  Nao enviado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <ActionButtons lead={lead} size="large" />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {leadsInRange.filter((l) => ABANDON_STATUSES.includes(l.status)).length === 0 && (
                  <div className="py-12 text-center">
                    <ShoppingCart className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nenhum abandono no periodo selecionado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════ Resgate Tab ════════════════════ */}
        <TabsContent value="resgate">
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Leads que foram resgatados com sucesso apos envio de cupons ou contato.
            </p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-blue-400">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Resgatados
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {resgatados}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-400">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Taxa de Resgate
                  </p>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {taxaResgate}%
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-400">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Receita Resgatada
                  </p>
                  <p className="mt-1 text-lg font-bold text-purple-600">
                    {leadsInRange
                      .filter((l) => l.status === "resgatado")
                      .reduce((sum, l) => sum + (l.cartValue ?? 0), 0)
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Motivo Original</TableHead>
                        <TableHead>Cupom Usado</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Link2 className="size-3" />
                            Link
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsInRange
                        .filter((l) => l.status === "resgatado")
                        .map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {lead.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {lead.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              {lead.product}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              -
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                {lead.couponCode ? (
                                  <Badge variant="default" className="text-[9px] w-fit">
                                    {lead.couponCode}
                                  </Badge>
                                ) : (
                                  <span className="text-[9px] text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {formatCartValue(lead.cartValue)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {lead.source || "-"}
                            </TableCell>
                            <TableCell>
                              <RecoveryLinkCell lead={lead} />
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {formatDate(lead.lastActivity)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {leadsInRange.filter((l) => l.status === "resgatado")
                  .length === 0 && (
                  <div className="py-12 text-center">
                    <RefreshCw className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nenhum lead resgatado no periodo
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ════════════════════ Coupon Dialog ════════════════════ */}
      <Dialog
        open={!!couponDialogLead}
        onOpenChange={(open) => {
          if (!open) setCouponDialogLead(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#3d2b2b]">
              Enviar Cupom de Desconto
            </DialogTitle>
          </DialogHeader>

          {couponDialogLead && (
            <div className="space-y-4 py-2">
              {/* Lead info */}
              <div className="rounded-lg bg-[#fdf8f4] p-3">
                <p className="text-sm font-medium text-[#3d2b2b]">
                  {couponDialogLead.name}
                </p>
                <p className="text-xs text-[#6b4c4c]">
                  {couponDialogLead.email} · {couponDialogLead.phone}
                </p>
                <p className="mt-1 text-xs text-[#6b4c4c]">
                  Produto: <span className="font-medium">{couponDialogLead.product}</span> · {formatCartValue(couponDialogLead.cartValue)}
                </p>
                {couponDialogLead.influencerName && (
                  <p className="mt-1 text-xs text-[#8b5e5e]">
                    <span className="font-medium">Canal:</span>{" "}
                    Influenciador {couponDialogLead.influencerName}
                  </p>
                )}
              </div>

              {/* Coupon selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selecionar Cupom</Label>
                <div className="grid grid-cols-3 gap-2">
                  {standardCoupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCoupon(c.code)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-all ${
                        selectedCoupon === c.code
                          ? "border-[#8b5e5e] bg-[#8b5e5e]/5"
                          : "border-gray-200 hover:border-[#8b5e5e]/30"
                      }`}
                    >
                      <Ticket className={`size-5 ${
                        selectedCoupon === c.code ? "text-[#8b5e5e]" : "text-gray-400"
                      }`} />
                      <span className="text-sm font-bold text-[#3d2b2b]">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated coupon code preview */}
              {selectedCoupon && (
                <div className="rounded-lg border border-dashed border-[#8b5e5e]/30 bg-[#fdf8f4] p-3">
                  <p className="text-xs text-[#6b4c4c]">Codigo do cupom:</p>
                  <p className="mt-1 font-mono text-lg font-bold text-[#8b5e5e]">
                    {selectedCoupon}
                  </p>
                </div>
              )}

              {/* Recovery link */}
              <div className="space-y-1">
                <Label className="text-xs text-[#6b4c4c]">
                  Link de retorno que sera enviado junto:
                </Label>
                <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                  <Link2 className="size-3.5 text-[#8b5e5e]" />
                  <code className="flex-1 text-xs text-[#6b4c4c]">
                    {getFullRecoveryUrl(couponDialogLead)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-[#8b5e5e]"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        getFullRecoveryUrl(couponDialogLead)
                      );
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCouponDialogLead(null)}>
              Cancelar
            </Button>
            <Button
              className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50"
              variant="outline"
              disabled={!selectedCoupon || actionLoading === couponDialogLead?.id}
              onClick={() => {
                if (couponDialogLead && selectedCoupon) {
                  sendCouponToLead(couponDialogLead, selectedCoupon);
                }
              }}
            >
              {actionLoading === couponDialogLead?.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Enviar por E-mail
            </Button>
            <Button
              className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
              disabled={!selectedCoupon || actionLoading === couponDialogLead?.id}
              onClick={() => {
                if (couponDialogLead && selectedCoupon) {
                  sendCouponToLead(couponDialogLead, selectedCoupon);
                }
              }}
            >
              {actionLoading === couponDialogLead?.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageCircle className="size-4" />
              )}
              Enviar por WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
