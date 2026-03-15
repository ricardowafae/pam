"use client";

import { useState } from "react";
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
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

type LeadStatus =
  | "visitante"
  | "carrinho"
  | "checkout_iniciado"
  | "pagamento_falhou"
  | "pix_expirado"
  | "convertido"
  | "resgatado";

type AbandonReason =
  | "desistiu_carrinho"
  | "erro_cartao"
  | "pix_expirado"
  | "checkout_abandonado"
  | "outro";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: LeadStatus;
  abandonReason: AbandonReason | null;
  product: string;
  cartValue: string;
  source: string;
  /** Slug do influenciador (se veio por influenciador) */
  influencerSlug: string | null;
  /** Nome do influenciador */
  influencerName: string | null;
  /** Link de retorno para o lead retomar a compra */
  recoveryLink: string;
  couponSent: boolean;
  couponCode: string | null;
  couponValue: string | null;
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

/* ────────────────────── Mock Data ────────────────────── */

const mockLeads: Lead[] = [
  {
    id: 1,
    name: "Ana Souza",
    email: "ana@email.com",
    phone: "(11) 99123-4567",
    date: "2026-03-10",
    status: "convertido",
    abandonReason: null,
    product: "Dogbook Verao",
    cartValue: "R$ 490,00",
    source: "Instagram",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-10",
    sessions: 3,
    pagesViewed: 12,
    recovered: false,
  },
  {
    id: 2,
    name: "Carlos Mendes",
    email: "carlos@email.com",
    phone: "(11) 98765-4321",
    date: "2026-03-09",
    status: "convertido",
    abandonReason: null,
    product: "Dogbook Natal + Sessao Estudio",
    cartValue: "R$ 5.531,00",
    source: "Influenciador (Camila Pet)",
    influencerSlug: "camila-pet",
    influencerName: "Camila Pet",
    recoveryLink: "/p/camila-pet",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-09",
    sessions: 5,
    pagesViewed: 22,
    recovered: false,
  },
  {
    id: 3,
    name: "Juliana Martins",
    email: "juliana.m@email.com",
    phone: "(11) 97654-1111",
    date: "2026-03-11",
    status: "carrinho",
    abandonReason: "desistiu_carrinho",
    product: "Dogbook Caoniversario",
    cartValue: "R$ 490,00",
    source: "Google Organico",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-11",
    sessions: 2,
    pagesViewed: 8,
    recovered: false,
  },
  {
    id: 4,
    name: "Lucas Ferreira",
    email: "lucas.f@email.com",
    phone: "(11) 96543-2222",
    date: "2026-03-08",
    status: "pagamento_falhou",
    abandonReason: "erro_cartao",
    product: "Sessao Pocket",
    cartValue: "R$ 900,00",
    source: "Instagram",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: true,
    couponCode: "PAM10OFF",
    couponValue: "R$ 10",
    lastActivity: "2026-03-09",
    sessions: 4,
    pagesViewed: 15,
    recovered: false,
  },
  {
    id: 5,
    name: "Patricia Lima",
    email: "patricia@email.com",
    phone: "(11) 95432-3333",
    date: "2026-03-07",
    status: "pix_expirado",
    abandonReason: "pix_expirado",
    product: "Dogbook Inverno",
    cartValue: "R$ 490,00",
    source: "TikTok",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: true,
    couponCode: "PAM20OFF",
    couponValue: "R$ 20",
    lastActivity: "2026-03-08",
    sessions: 1,
    pagesViewed: 5,
    recovered: false,
  },
  {
    id: 6,
    name: "Roberto Silva",
    email: "roberto.s@email.com",
    phone: "(21) 99876-4444",
    date: "2026-03-06",
    status: "checkout_iniciado",
    abandonReason: "checkout_abandonado",
    product: "Dogbook Verao + Dogbook Natal",
    cartValue: "R$ 931,00",
    source: "Google Ads",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-06",
    sessions: 3,
    pagesViewed: 18,
    recovered: false,
  },
  {
    id: 7,
    name: "Camila Dias",
    email: "camila.d@email.com",
    phone: "(11) 94321-5555",
    date: "2026-03-05",
    status: "resgatado",
    abandonReason: "desistiu_carrinho",
    product: "Sessao Completa",
    cartValue: "R$ 4.900,00",
    source: "Influenciador (Doglovers SP)",
    influencerSlug: "doglovers-sp",
    influencerName: "Doglovers SP",
    recoveryLink: "/p/doglovers-sp",
    couponSent: true,
    couponCode: "PAM50OFF",
    couponValue: "R$ 50",
    lastActivity: "2026-03-12",
    sessions: 6,
    pagesViewed: 25,
    recovered: true,
  },
  {
    id: 8,
    name: "Marcos Oliveira",
    email: "marcos.o@email.com",
    phone: "(11) 93210-6666",
    date: "2026-03-12",
    status: "visitante",
    abandonReason: null,
    product: "-",
    cartValue: "-",
    source: "Google Organico",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-12",
    sessions: 1,
    pagesViewed: 3,
    recovered: false,
  },
  {
    id: 9,
    name: "Fernanda Costa",
    email: "fernanda.c@email.com",
    phone: "(11) 92109-7777",
    date: "2026-03-10",
    status: "pagamento_falhou",
    abandonReason: "erro_cartao",
    product: "Sessao Estudio",
    cartValue: "R$ 3.700,00",
    source: "WhatsApp",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-10",
    sessions: 2,
    pagesViewed: 10,
    recovered: false,
  },
  {
    id: 10,
    name: "Diego Nunes",
    email: "diego.n@email.com",
    phone: "(11) 91098-8888",
    date: "2026-03-04",
    status: "resgatado",
    abandonReason: "pix_expirado",
    product: "Dogbook Ano Novo",
    cartValue: "R$ 490,00",
    source: "Influenciador (PetStyle)",
    influencerSlug: "petstyle",
    influencerName: "PetStyle",
    recoveryLink: "/p/petstyle",
    couponSent: true,
    couponCode: "PAM10OFF",
    couponValue: "R$ 10",
    lastActivity: "2026-03-11",
    sessions: 4,
    pagesViewed: 14,
    recovered: true,
  },
  {
    id: 11,
    name: "Amanda Ribeiro",
    email: "amanda.r@email.com",
    phone: "(11) 90987-9999",
    date: "2026-03-13",
    status: "carrinho",
    abandonReason: "desistiu_carrinho",
    product: "Dogbook Caoniversario + Sessao Pocket",
    cartValue: "R$ 1.390,00",
    source: "Influenciador (Mundo Pet SP)",
    influencerSlug: "mundo-pet-sp",
    influencerName: "Mundo Pet SP",
    recoveryLink: "/p/mundo-pet-sp",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-13",
    sessions: 2,
    pagesViewed: 9,
    recovered: false,
  },
  {
    id: 12,
    name: "Gustavo Pereira",
    email: "gustavo@email.com",
    phone: "(11) 99877-0000",
    date: "2026-03-02",
    status: "convertido",
    abandonReason: null,
    product: "Sessao Pocket",
    cartValue: "R$ 900,00",
    source: "Indicacao",
    influencerSlug: null,
    influencerName: null,
    recoveryLink: "/carrinho",
    couponSent: false,
    couponCode: null,
    couponValue: null,
    lastActivity: "2026-03-02",
    sessions: 2,
    pagesViewed: 7,
    recovered: false,
  },
];

/* ────────────────────── Helpers ────────────────────── */

function statusLabel(status: LeadStatus): string {
  switch (status) {
    case "visitante": return "Visitante";
    case "carrinho": return "Carrinho Abandonado";
    case "checkout_iniciado": return "Checkout Abandonado";
    case "pagamento_falhou": return "Pagamento Falhou";
    case "pix_expirado": return "PIX Expirado";
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
    case "visitante": return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function reasonLabel(reason: AbandonReason | null): string {
  if (!reason) return "-";
  switch (reason) {
    case "desistiu_carrinho": return "Desistiu no carrinho";
    case "erro_cartao": return "Erro no cartao";
    case "pix_expirado": return "PIX expirou";
    case "checkout_abandonado": return "Abandonou checkout";
    case "outro": return "Outro";
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getRecoveryLinkLabel(lead: Lead): string {
  if (lead.influencerSlug) {
    return `Link do ${lead.influencerName}`;
  }
  if (lead.status === "carrinho" || lead.status === "checkout_iniciado") {
    return "Carrinho";
  }
  return "Loja";
}

function getFullRecoveryUrl(lead: Lead): string {
  const base = "https://patasamorememorias.com.br";
  if (lead.influencerSlug) {
    return `${base}/p/${lead.influencerSlug}`;
  }
  return `${base}${lead.recoveryLink}`;
}

/* ────────────────────── Page ────────────────────── */

export default function ConversaoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "todos" | "nao_convertidos">("todos");
  const [sourceFilter, setSourceFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);
  const [couponDialogLead, setCouponDialogLead] = useState<Lead | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");

  /* ─── KPIs (filtered by date range) ─── */
  const leadsInRange = mockLeads.filter((l) => isInRange(l.date, dateRange));

  const totalLeads = leadsInRange.length;
  const convertidos = leadsInRange.filter((l) => l.status === "convertido").length;
  const resgatados = leadsInRange.filter((l) => l.status === "resgatado").length;
  const carrinhoAbandonado = leadsInRange.filter((l) => l.status === "carrinho").length;
  const checkoutAbandonado = leadsInRange.filter((l) => l.status === "checkout_iniciado").length;
  const pagamentoFalhou = leadsInRange.filter((l) => l.status === "pagamento_falhou").length;
  const pixExpirado = leadsInRange.filter((l) => l.status === "pix_expirado").length;
  const visitantes = leadsInRange.filter((l) => l.status === "visitante").length;

  const totalConvertidos = convertidos + resgatados;
  const taxaConversao = totalLeads > 0
    ? ((totalConvertidos / totalLeads) * 100).toFixed(1)
    : "0.0";
  const taxaAbandono = totalLeads > 0
    ? ((
        (carrinhoAbandonado + checkoutAbandonado + pagamentoFalhou + pixExpirado) /
        totalLeads
      ) * 100).toFixed(1)
    : "0.0";
  const taxaResgate = (carrinhoAbandonado + checkoutAbandonado + pagamentoFalhou + pixExpirado + resgatados) > 0
    ? (
        (resgatados /
          (carrinhoAbandonado + checkoutAbandonado + pagamentoFalhou + pixExpirado + resgatados)) *
        100
      ).toFixed(1)
    : "0.0";

  const receitaConvertida = leadsInRange
    .filter((l) => l.status === "convertido" || l.status === "resgatado")
    .reduce((sum, l) => {
      const num = parseFloat(
        l.cartValue.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
      );
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  const receitaPerdida = leadsInRange
    .filter(
      (l) =>
        l.status === "carrinho" ||
        l.status === "checkout_iniciado" ||
        l.status === "pagamento_falhou" ||
        l.status === "pix_expirado"
    )
    .reduce((sum, l) => {
      if (l.cartValue === "-") return sum;
      const num = parseFloat(
        l.cartValue.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
      );
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  const couponsSent = leadsInRange.filter((l) => l.couponSent).length;
  const pendingRecovery = leadsInRange.filter(
    (l) =>
      !l.couponSent &&
      !l.recovered &&
      l.status !== "convertido" &&
      l.status !== "visitante"
  ).length;

  /* ─── Sources ─── */
  const allSources = Array.from(new Set(mockLeads.map((l) => l.source)));

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
        ? l.status !== "convertido" && l.status !== "visitante"
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

  function getCouponForLead(lead: Lead): string {
    // Se veio por influenciador, gerar cupom vinculado ao influenciador
    if (lead.influencerSlug) {
      const slug = lead.influencerSlug.toUpperCase().replace(/-/g, "");
      const coupon = standardCoupons.find((c) => c.code === selectedCoupon);
      if (coupon) {
        return `${slug}${coupon.value.replace("R$ ", "")}OFF`;
      }
      return `${slug}10OFF`;
    }
    return selectedCoupon || "PAM10OFF";
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

    const showActions =
      lead.status !== "convertido" &&
      lead.status !== "visitante" &&
      !lead.couponSent;

    if (!showActions) return null;

    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          className={`${btnClass} border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700`}
          title="Enviar por e-mail"
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className={iconClass} />
          E-mail
        </Button>
        <Button
          variant="outline"
          className={`${btnClass} border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700`}
          title="Enviar por WhatsApp"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className={iconClass} />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          className={`${btnClass} border-[#8b5e5e]/30 text-[#8b5e5e] hover:bg-[#8b5e5e]/10`}
          title="Enviar cupom"
          onClick={(e) => {
            e.stopPropagation();
            openCouponDialog(lead);
          }}
        >
          <Ticket className={iconClass} />
          Cupom
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Conversao
        </h1>
        <p className="text-sm text-muted-foreground">
          Analise leads, carrinhos abandonados e oportunidades de resgate
        </p>
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
              {carrinhoAbandonado + checkoutAbandonado + pagamentoFalhou + pixExpirado} nao convertidos
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
                              {reasonLabel(lead.abandonReason)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm font-medium text-foreground">
                              {lead.cartValue}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                              {lead.source}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {lead.status !== "visitante" && lead.cartValue !== "-" ? (
                                <RecoveryLinkCell lead={lead} />
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {lead.couponSent ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <Badge variant="default" className="text-[9px]">
                                    {lead.couponCode}
                                  </Badge>
                                  {lead.couponValue && (
                                    <span className="text-[9px] text-muted-foreground">
                                      {lead.couponValue}
                                    </span>
                                  )}
                                </div>
                              ) : lead.status !== "convertido" &&
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
                                      {lead.phone}
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
                                      {lead.source}
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
                                    {lead.influencerSlug && (
                                      <div>
                                        <span className="font-medium uppercase">
                                          Influenciador:
                                        </span>{" "}
                                        <span className="text-[#8b5e5e] font-medium">
                                          {lead.influencerName}
                                        </span>{" "}
                                        <span className="font-mono text-[10px]">
                                          (/p/{lead.influencerSlug})
                                        </span>
                                      </div>
                                    )}
                                    {lead.couponSent && (
                                      <div>
                                        <span className="font-medium uppercase">
                                          Cupom Enviado:
                                        </span>{" "}
                                        <span className="font-mono">
                                          {lead.couponCode}
                                        </span>
                                        {lead.couponValue && (
                                          <span className="ml-1 text-green-600">
                                            ({lead.couponValue})
                                          </span>
                                        )}
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
                                  {lead.status !== "visitante" && lead.cartValue !== "-" && (
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
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            getFullRecoveryUrl(lead)
                                          )
                                        }
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
                      Erro no Cartao
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
                        .filter(
                          (l) =>
                            l.status === "carrinho" ||
                            l.status === "checkout_iniciado" ||
                            l.status === "pagamento_falhou" ||
                            l.status === "pix_expirado"
                        )
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
                                {reasonLabel(lead.abandonReason)}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {lead.cartValue}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {lead.source}
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
                                    {lead.couponCode}
                                  </Badge>
                                  {lead.couponValue && (
                                    <span className="text-[9px] text-muted-foreground">
                                      {lead.couponValue}
                                    </span>
                                  )}
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
                      .reduce((sum, l) => {
                        const num = parseFloat(
                          l.cartValue
                            .replace("R$ ", "")
                            .replace(/\./g, "")
                            .replace(",", ".")
                        );
                        return sum + (isNaN(num) ? 0 : num);
                      }, 0)
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
                              {reasonLabel(lead.abandonReason)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <Badge variant="default" className="text-[9px] w-fit">
                                  {lead.couponCode}
                                </Badge>
                                {lead.couponValue && (
                                  <span className="text-[9px] text-green-600">
                                    {lead.couponValue}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {lead.cartValue}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {lead.source}
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
                  Produto: <span className="font-medium">{couponDialogLead.product}</span> · {couponDialogLead.cartValue}
                </p>
                {couponDialogLead.influencerSlug && (
                  <p className="mt-1 text-xs text-[#8b5e5e]">
                    <span className="font-medium">Canal:</span>{" "}
                    Influenciador {couponDialogLead.influencerName} (/p/{couponDialogLead.influencerSlug})
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
                    {getCouponForLead(couponDialogLead)}
                  </p>
                  {couponDialogLead.influencerSlug && (
                    <p className="mt-1 text-[10px] text-[#6b4c4c]">
                      Cupom vinculado ao influenciador {couponDialogLead.influencerName}
                    </p>
                  )}
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
                    onClick={() =>
                      navigator.clipboard.writeText(
                        getFullRecoveryUrl(couponDialogLead)
                      )
                    }
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
              disabled={!selectedCoupon}
            >
              <Mail className="size-4" />
              Enviar por E-mail
            </Button>
            <Button
              className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
              disabled={!selectedCoupon}
            >
              <MessageCircle className="size-4" />
              Enviar por WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
