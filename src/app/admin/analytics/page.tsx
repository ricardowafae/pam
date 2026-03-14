"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DateRangeFilter,
  type DateRange,
  getDefault30DayRange,
} from "@/components/admin/DateRangeFilter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart,
} from "recharts";
import {
  Eye,
  Clock,
  XCircle,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  CreditCard,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MousePointerClick,
  Search,
  Instagram,
  MessageCircle,
  Repeat,
  Heart,
  Percent,
  Package,
  CalendarDays,
  ArrowRight,
  Zap,
  BarChart3,
  PiggyBank,
  Receipt,
  UserCheck,
  UserX,
  Star,
  MapPin,
  Share2,
  BookOpen,
  Camera,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════
   MOCK DATA — Comprehensive E-commerce Analytics
   ══════════════════════════════════════════════════════════ */

/* ─── Hero KPIs (GA4 + Shopify style) ─── */
const heroKpis = [
  { label: "Receita Total", value: "R$ 165.150", change: "+18%", positive: true, icon: DollarSign },
  { label: "Pedidos", value: "181", change: "+15%", positive: true, icon: ShoppingCart },
  { label: "Ticket Medio", value: "R$ 912", change: "+4%", positive: true, icon: Receipt },
  { label: "Visitantes Unicos", value: "3.842", change: "+12%", positive: true, icon: Users },
  { label: "Taxa de Conversao", value: "4.2%", change: "+0.8%", positive: true, icon: Target },
  { label: "Receita / Visitante", value: "R$ 43", change: "+6%", positive: true, icon: Zap },
];

/* ─── Revenue by Month STACKED by product type ─── */
const revenueByMonthByProduct = [
  { month: "Out", dogbook: 8200, pocket: 3600, estudio: 2200, completa: 1200, total: 15200 },
  { month: "Nov", dogbook: 9800, pocket: 4500, estudio: 2800, completa: 1400, total: 18500 },
  { month: "Dez", dogbook: 16500, pocket: 5200, estudio: 4400, completa: 2800, total: 28900 },
  { month: "Jan", dogbook: 11200, pocket: 4800, estudio: 3700, completa: 2600, total: 22300 },
  { month: "Fev", dogbook: 12400, pocket: 5100, estudio: 4200, completa: 2400, total: 24100 },
  { month: "Mar", dogbook: 14800, pocket: 6300, estudio: 5900, completa: 4200, total: 31200 },
];

/* ─── Daily Revenue + Visitors (Triple Whale style) ─── */
const dailyMetrics = [
  { day: "01/03", revenue: 2100, visitors: 98, orders: 4, adSpend: 120 },
  { day: "02/03", revenue: 3400, visitors: 115, orders: 5, adSpend: 130 },
  { day: "03/03", revenue: 1900, visitors: 132, orders: 3, adSpend: 125 },
  { day: "04/03", revenue: 4200, visitors: 108, orders: 6, adSpend: 140 },
  { day: "05/03", revenue: 2800, visitors: 145, orders: 4, adSpend: 110 },
  { day: "06/03", revenue: 5100, visitors: 168, orders: 7, adSpend: 150 },
  { day: "07/03", revenue: 3600, visitors: 155, orders: 5, adSpend: 135 },
  { day: "08/03", revenue: 4800, visitors: 178, orders: 6, adSpend: 160 },
  { day: "09/03", revenue: 5500, visitors: 192, orders: 8, adSpend: 155 },
  { day: "10/03", revenue: 3200, visitors: 165, orders: 5, adSpend: 145 },
  { day: "11/03", revenue: 2600, visitors: 148, orders: 4, adSpend: 130 },
  { day: "12/03", revenue: 4100, visitors: 172, orders: 6, adSpend: 140 },
  { day: "13/03", revenue: 4900, visitors: 188, orders: 7, adSpend: 150 },
];

/* ─── Conversion Funnel ─── */
const funnelData = [
  { name: "Visitantes", value: 3842, fill: "#8b5e5e" },
  { name: "Visualizaram produto", value: 1920, fill: "#9a6f6f" },
  { name: "Adicionaram ao carrinho", value: 580, fill: "#a98282" },
  { name: "Iniciaram checkout", value: 290, fill: "#b89494" },
  { name: "Pagamento iniciado", value: 210, fill: "#c7a7a7" },
  { name: "Compraram", value: 162, fill: "#d6b9b9" },
];

/* ─── Sales by Product (detailed) ─── */
const salesByProduct = [
  { product: "Dogbook Verao", category: "Dogbook", units: 42, revenue: 20580, avgTicket: 490, growth: "+15%", positive: true, margin: 72 },
  { product: "Dogbook Natal", category: "Dogbook", units: 55, revenue: 26950, avgTicket: 490, growth: "+22%", positive: true, margin: 72 },
  { product: "Dogbook Inverno", category: "Dogbook", units: 38, revenue: 18620, avgTicket: 490, growth: "+8%", positive: true, margin: 72 },
  { product: "Dogbook Caoniversario", category: "Dogbook", units: 20, revenue: 9800, avgTicket: 490, growth: "+35%", positive: true, margin: 72 },
  { product: "Dogbook Ano Novo", category: "Dogbook", units: 15, revenue: 7350, avgTicket: 490, growth: "-5%", positive: false, margin: 72 },
  { product: "Sessao Pocket", category: "Sessao", units: 28, revenue: 25200, avgTicket: 900, growth: "+18%", positive: true, margin: 45 },
  { product: "Sessao Estudio", category: "Sessao", units: 12, revenue: 44400, avgTicket: 3700, growth: "+28%", positive: true, margin: 52 },
  { product: "Sessao Completa", category: "Sessao", units: 6, revenue: 29400, avgTicket: 4900, growth: "+10%", positive: true, margin: 48 },
];

/* ─── Payment Methods (Shopify style) ─── */
const paymentMethods = [
  { method: "Cartao de Credito", orders: 98, revenue: 92400, pct: 56 },
  { method: "PIX", orders: 62, revenue: 54200, pct: 33 },
  { method: "Vale Presente", orders: 12, revenue: 10800, pct: 6 },
  { method: "Boleto", orders: 9, revenue: 7750, pct: 5 },
];

/* ─── Revenue by Category (pie) ─── */
const revenueByCategoryPie = [
  { name: "Dogbooks", value: 83300, fill: "#8b5e5e" },
  { name: "Sessao Pocket", value: 25200, fill: "#a67c7c" },
  { name: "Sessao Estudio", value: 44400, fill: "#c4a0a0" },
  { name: "Sessao Completa", value: 29400, fill: "#d4b8b8" },
];

/* ─── Traffic Sources (GA4 style) ─── */
const trafficSources = [
  { source: "Google Organico", visitors: 1420, pct: 37.0, bounce: 35, conversions: 62, convRate: 4.4, revenue: 58200, cpa: 0, roas: "∞", icon: Search },
  { source: "Instagram", visitors: 980, pct: 25.5, bounce: 28, conversions: 48, convRate: 4.9, revenue: 45800, cpa: 0, roas: "∞", icon: Instagram },
  { source: "Direto", visitors: 620, pct: 16.1, bounce: 22, conversions: 28, convRate: 4.5, revenue: 24500, cpa: 0, roas: "∞", icon: Globe },
  { source: "Google Ads", visitors: 410, pct: 10.7, bounce: 42, conversions: 15, convRate: 3.7, revenue: 14200, cpa: 85, roas: "9.5x", icon: MousePointerClick },
  { source: "WhatsApp", visitors: 245, pct: 6.4, bounce: 18, conversions: 12, convRate: 4.9, revenue: 11800, cpa: 0, roas: "∞", icon: MessageCircle },
  { source: "TikTok", visitors: 98, pct: 2.5, bounce: 45, conversions: 3, convRate: 3.1, revenue: 2900, cpa: 210, roas: "4.6x", icon: Globe },
  { source: "Facebook", visitors: 69, pct: 1.8, bounce: 40, conversions: 2, convRate: 2.9, revenue: 1800, cpa: 180, roas: "3.6x", icon: Globe },
];

/* ─── Visitors by Day ─── */
const visitorsByDay = [
  { day: "01", v: 120 }, { day: "02", v: 135 }, { day: "03", v: 98 },
  { day: "04", v: 142 }, { day: "05", v: 165 }, { day: "06", v: 178 },
  { day: "07", v: 155 }, { day: "08", v: 132 }, { day: "09", v: 148 },
  { day: "10", v: 190 }, { day: "11", v: 175 }, { day: "12", v: 160 },
  { day: "13", v: 145 }, { day: "14", v: 198 }, { day: "15", v: 210 },
  { day: "16", v: 185 }, { day: "17", v: 170 }, { day: "18", v: 155 },
  { day: "19", v: 142 }, { day: "20", v: 225 }, { day: "21", v: 238 },
  { day: "22", v: 195 }, { day: "23", v: 180 }, { day: "24", v: 165 },
  { day: "25", v: 205 }, { day: "26", v: 215 }, { day: "27", v: 190 },
  { day: "28", v: 175 }, { day: "29", v: 248 }, { day: "30", v: 260 },
];

/* ─── Visitors by Hour (donut) ─── */
const HOUR_COLORS = [
  "#5c3d2e", "#6b4c3d", "#7a5b4c", "#8b6a5b", "#9c7a6b",
  "#ad8a7b", "#b89485", "#c4a090", "#d0ac9b", "#dbb8a6",
  "#e6c4b1", "#f0d0bc", "#e8c4a8", "#d8b494", "#c8a480",
  "#b8946c", "#a88458", "#987444", "#886430", "#785420",
  "#684410", "#583400", "#4a2800", "#3c1c00",
];

const visitorsByHour = [
  { hour: "00h", v: 8, fill: HOUR_COLORS[0] },
  { hour: "01h", v: 4, fill: HOUR_COLORS[1] },
  { hour: "02h", v: 2, fill: HOUR_COLORS[2] },
  { hour: "03h", v: 1, fill: HOUR_COLORS[3] },
  { hour: "04h", v: 3, fill: HOUR_COLORS[4] },
  { hour: "05h", v: 6, fill: HOUR_COLORS[5] },
  { hour: "06h", v: 15, fill: HOUR_COLORS[6] },
  { hour: "07h", v: 35, fill: HOUR_COLORS[7] },
  { hour: "08h", v: 78, fill: HOUR_COLORS[8] },
  { hour: "09h", v: 120, fill: HOUR_COLORS[9] },
  { hour: "10h", v: 145, fill: HOUR_COLORS[10] },
  { hour: "11h", v: 168, fill: HOUR_COLORS[11] },
  { hour: "12h", v: 132, fill: HOUR_COLORS[12] },
  { hour: "13h", v: 155, fill: HOUR_COLORS[13] },
  { hour: "14h", v: 178, fill: HOUR_COLORS[14] },
  { hour: "15h", v: 165, fill: HOUR_COLORS[15] },
  { hour: "16h", v: 148, fill: HOUR_COLORS[16] },
  { hour: "17h", v: 130, fill: HOUR_COLORS[17] },
  { hour: "18h", v: 110, fill: HOUR_COLORS[18] },
  { hour: "19h", v: 145, fill: HOUR_COLORS[19] },
  { hour: "20h", v: 190, fill: HOUR_COLORS[20] },
  { hour: "21h", v: 175, fill: HOUR_COLORS[21] },
  { hour: "22h", v: 95, fill: HOUR_COLORS[22] },
  { hour: "23h", v: 42, fill: HOUR_COLORS[23] },
];

/* ─── Devices ─── */
const deviceData = [
  { name: "Mobile", value: 62, fill: "#8b5e5e" },
  { name: "Desktop", value: 31, fill: "#c4a0a0" },
  { name: "Tablet", value: 7, fill: "#e8d4d4" },
];

/* ─── Geography (Polar Analytics style) ─── */
const geoData = [
  { city: "Sao Paulo", state: "SP", visitors: 1820, orders: 82, revenue: 78400 },
  { city: "Rio de Janeiro", state: "RJ", visitors: 620, orders: 28, revenue: 24500 },
  { city: "Belo Horizonte", state: "MG", visitors: 380, orders: 18, revenue: 15200 },
  { city: "Curitiba", state: "PR", visitors: 290, orders: 14, revenue: 12800 },
  { city: "Campinas", state: "SP", visitors: 210, orders: 12, revenue: 10400 },
  { city: "Brasilia", state: "DF", visitors: 185, orders: 8, revenue: 7600 },
  { city: "Porto Alegre", state: "RS", visitors: 160, orders: 7, revenue: 5900 },
  { city: "Florianopolis", state: "SC", visitors: 95, orders: 5, revenue: 4800 },
];

/* ─── Customer Analytics (Lifetimely + Polar style) ─── */
const customerKpis = [
  { label: "Clientes Unicos", value: "142", change: "+10%", positive: true, icon: Users },
  { label: "Novos Clientes", value: "108", change: "+14%", positive: true, icon: UserCheck },
  { label: "Clientes Recorrentes", value: "34", change: "+6%", positive: true, icon: Repeat },
  { label: "Taxa de Recompra", value: "24%", change: "+3%", positive: true, icon: Heart },
  { label: "LTV Medio", value: "R$ 2.180", change: "+12%", positive: true, icon: Star },
  { label: "Tempo ate 2a Compra", value: "42 dias", change: "-8%", positive: true, icon: CalendarDays },
];

const customerCohorts = [
  { cohort: "Jan/2026", customers: 32, month1: "68%", month2: "42%", month3: "-", ltv: "R$ 1.420" },
  { cohort: "Fev/2026", customers: 38, month1: "72%", month2: "38%", month3: "-", ltv: "R$ 1.580" },
  { cohort: "Mar/2026", customers: 45, month1: "75%", month2: "-", month3: "-", ltv: "R$ 980" },
];

const newVsReturning = [
  { month: "Out", novos: 22, recorrentes: 6 },
  { month: "Nov", novos: 27, recorrentes: 8 },
  { month: "Dez", novos: 38, recorrentes: 14 },
  { month: "Jan", novos: 30, recorrentes: 11 },
  { month: "Fev", novos: 32, recorrentes: 12 },
  { month: "Mar", novos: 40, recorrentes: 16 },
];

/* ─── Top Pages ─── */
const topPages = [
  { page: "/", views: 3842, avgTime: "1m 12s", bounce: 32, exitRate: 18 },
  { page: "/dogbook", views: 1920, avgTime: "3m 45s", bounce: 22, exitRate: 12 },
  { page: "/sessoes", views: 1180, avgTime: "2m 58s", bounce: 25, exitRate: 15 },
  { page: "/sessoes/pocket", views: 680, avgTime: "2m 30s", bounce: 28, exitRate: 20 },
  { page: "/carrinho", views: 580, avgTime: "3m 15s", bounce: 45, exitRate: 38 },
  { page: "/vale-presente", views: 420, avgTime: "1m 50s", bounce: 35, exitRate: 25 },
  { page: "/faq", views: 380, avgTime: "4m 10s", bounce: 15, exitRate: 8 },
  { page: "/depoimentos", views: 310, avgTime: "2m 22s", bounce: 18, exitRate: 10 },
  { page: "/sessoes/estudio", views: 280, avgTime: "3m 05s", bounce: 20, exitRate: 14 },
  { page: "/sessoes/completa", views: 190, avgTime: "4m 20s", bounce: 15, exitRate: 10 },
];

/* ─── Marketing ROI (Triple Whale style) ─── */
const marketingKpis = [
  { label: "Investimento Total", value: "R$ 4.850", change: "+5%", positive: false },
  { label: "ROAS Geral", value: "34x", change: "+22%", positive: true },
  { label: "CPA Medio", value: "R$ 24", change: "-12%", positive: true },
  { label: "Receita Paga", value: "R$ 18.900", change: "+28%", positive: true },
  { label: "Receita Organica", value: "R$ 146.250", change: "+16%", positive: true },
  { label: "% Receita Organica", value: "89%", change: "+2%", positive: true },
];

const marketingByChannel = [
  { channel: "Google Ads", spend: 1500, revenue: 14200, roas: 9.5, orders: 15, cpa: 100 },
  { channel: "Instagram Ads", spend: 1800, revenue: 12800, roas: 7.1, orders: 12, cpa: 150 },
  { channel: "TikTok Ads", spend: 630, revenue: 2900, roas: 4.6, orders: 3, cpa: 210 },
  { channel: "Facebook Ads", spend: 500, revenue: 1800, roas: 3.6, orders: 2, cpa: 250 },
  { channel: "Influenciadores", spend: 420, revenue: 8200, roas: 19.5, orders: 9, cpa: 47 },
];

/* ─── Coupon Analytics ─── */
const couponData = [
  { code: "CAMILA10", uses: 8, revenue: 6280, discount: 628 },
  { code: "DOG15", uses: 5, revenue: 4900, discount: 735 },
  { code: "VIDA5", uses: 3, revenue: 2150, discount: 108 },
  { code: "VOLTA10", uses: 2, revenue: 1800, discount: 180 },
  { code: "RESGATE20", uses: 1, revenue: 4900, discount: 980 },
];

/* ─── Refund data ─── */
const refundRate = 1.8;
const totalRefunds = 3;
const refundValue = 2870;

/* ─── Helper ─── */
const COLORS = ["#8b5e5e", "#a67c7c", "#c4a0a0", "#d4b8b8", "#e8d4d4", "#b89090", "#f0e6e6"];

function KpiCard({ label, value, change, positive, icon: Icon }: {
  label: string; value: string; change: string; positive: boolean; icon: typeof DollarSign;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="size-4 text-[#8b5e5e]" />
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {change}
          </span>
        </div>
        <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function MiniKpi({ label, value, change, positive }: {
  label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{value}</span>
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
            {positive ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());

  const totalRevenue = salesByProduct.reduce((s, p) => s + p.revenue, 0);
  const totalUnits = salesByProduct.reduce((s, p) => s + p.units, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Painel completo de performance — Trafego, Receita, Clientes e Marketing
        </p>
      </div>

      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* ─── Hero KPIs ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {heroKpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList className="flex-wrap">
          <TabsTrigger value="visao-geral">Visao Geral</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="trafego">Trafego</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="comportamento">Comportamento</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* ═══════════════ VISÃO GERAL ═══════════════ */}
        <TabsContent value="visao-geral">
          <div className="mt-4 space-y-6">
            {/* Daily Revenue + Visitors (Triple Whale style) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Receita Diaria vs Visitantes</CardTitle>
                <CardDescription>Acompanhamento dia a dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8d4d4" />
                      <XAxis dataKey="day" fontSize={10} stroke="#6b4c4c" />
                      <YAxis yAxisId="left" fontSize={10} stroke="#8b5e5e" />
                      <YAxis yAxisId="right" orientation="right" fontSize={10} stroke="#c4a0a0" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="revenue" fill="#8b5e5e" radius={[3, 3, 0, 0]} name="Receita (R$)" />
                      <Line yAxisId="right" type="monotone" dataKey="visitors" stroke="#c4a0a0" strokeWidth={2} dot={{ fill: "#c4a0a0", r: 3 }} name="Visitantes" />
                      <Legend />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Revenue by month STACKED by product */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Receita Mensal por Tipo de Produto</CardTitle>
                  <CardDescription>Ultimos 6 meses — empilhado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByMonthByProduct}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8d4d4" />
                        <XAxis dataKey="month" fontSize={12} stroke="#6b4c4c" />
                        <YAxis fontSize={10} stroke="#6b4c4c" />
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                        <Legend />
                        <Bar dataKey="dogbook" stackId="a" fill="#8b5e5e" name="Dogbook" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="pocket" stackId="a" fill="#a67c7c" name="Sessao Pocket" />
                        <Bar dataKey="estudio" stackId="a" fill="#c4a0a0" name="Sessao Estudio" />
                        <Bar dataKey="completa" stackId="a" fill="#d4b8b8" name="Sessao Completa" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Funil de Conversao</CardTitle>
                  <CardDescription>Visitante → Compra ({((162 / 3842) * 100).toFixed(1)}% taxa geral)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                          <LabelList position="right" fill="#6b4c4c" stroke="none" dataKey="name" fontSize={10} />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary KPIs row */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              <MiniKpi label="Abandono Carrinho" value="62%" change="+2%" positive={false} />
              <MiniKpi label="Taxa Rejeicao" value="38%" change="-3%" positive={true} />
              <MiniKpi label="Duracao Media" value="2m 34s" change="+5%" positive={true} />
              <MiniKpi label="Pag / Sessao" value="3.2" change="+0.3" positive={true} />
              <MiniKpi label="CAC" value="R$ 24" change="-12%" positive={true} />
              <MiniKpi label="LTV" value="R$ 2.180" change="+12%" positive={true} />
              <MiniKpi label="LTV / CAC" value="91x" change="+28%" positive={true} />
              <MiniKpi label="Taxa Recompra" value="24%" change="+3%" positive={true} />
            </div>

            {/* Revenue by category pie + Top Products */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Receita por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueByCategoryPie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {revenueByCategoryPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top 5 Produtos por Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesByProduct.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((p, i) => (
                      <div key={p.product} className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-[10px] font-bold text-[#8b5e5e]">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{p.product}</span>
                            <span className="text-sm font-bold text-[#8b5e5e]">R$ {p.revenue.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-[#8b5e5e]" style={{ width: `${(p.revenue / totalRevenue) * 100}%` }} />
                          </div>
                          <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
                            <span>{p.units} unidades</span>
                            <span className={p.positive ? "text-green-600" : "text-red-500"}>{p.growth}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ RECEITA ═══════════════ */}
        <TabsContent value="receita">
          <div className="mt-4 space-y-6">
            {/* Revenue stacked chart (full width) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Receita Mensal por Produto</CardTitle>
                <CardDescription>Dogbook + Sessao Pocket + Sessao Estudio + Sessao Completa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByMonthByProduct}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8d4d4" />
                      <XAxis dataKey="month" fontSize={12} stroke="#6b4c4c" />
                      <YAxis fontSize={10} stroke="#6b4c4c" />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                      <Legend />
                      <Bar dataKey="dogbook" stackId="a" fill="#8b5e5e" name="Dogbook" />
                      <Bar dataKey="pocket" stackId="a" fill="#a67c7c" name="Pocket" />
                      <Bar dataKey="estudio" stackId="a" fill="#c4a0a0" name="Estudio" />
                      <Bar dataKey="completa" stackId="a" fill="#d4b8b8" name="Completa" radius={[3, 3, 0, 0]} />
                      <Line type="monotone" dataKey="total" stroke="#4a2c2c" strokeWidth={2} dot={{ fill: "#4a2c2c", r: 3 }} name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Product sales detail table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Detalhamento Completo por Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Categoria</TableHead>
                      <TableHead className="text-right">Unidades</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Ticket</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Margem</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">Crescimento</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">% Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByProduct.map((p) => {
                      const pct = ((p.revenue / totalRevenue) * 100).toFixed(1);
                      return (
                        <TableRow key={p.product}>
                          <TableCell className="font-medium">{p.product}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={p.category === "Dogbook" ? "default" : "secondary"} className="text-[9px]">
                              {p.category === "Dogbook" ? <BookOpen className="mr-1 inline size-2.5" /> : <Camera className="mr-1 inline size-2.5" />}
                              {p.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right"><Badge variant="outline">{p.units}</Badge></TableCell>
                          <TableCell className="text-right font-bold text-[#8b5e5e]">R$ {p.revenue.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right hidden md:table-cell text-muted-foreground">R$ {p.avgTicket.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right hidden md:table-cell text-muted-foreground">{p.margin}%</TableCell>
                          <TableCell className="text-right hidden lg:table-cell">
                            <span className={`text-xs font-medium ${p.positive ? "text-green-600" : "text-red-500"}`}>{p.growth}</span>
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-[#8b5e5e]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell />
                      <TableCell className="text-right">{totalUnits}</TableCell>
                      <TableCell className="text-right text-[#8b5e5e]">R$ {totalRevenue.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">R$ {Math.round(totalRevenue / totalUnits).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="hidden md:table-cell" />
                      <TableCell className="hidden lg:table-cell" />
                      <TableCell className="hidden lg:table-cell" />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Metodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((m) => (
                      <div key={m.method} className="flex items-center gap-3">
                        <CreditCard className="size-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{m.method}</span>
                            <span className="font-bold text-[#8b5e5e]">R$ {m.revenue.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-[#8b5e5e]" style={{ width: `${m.pct}%` }} />
                          </div>
                          <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
                            <span>{m.orders} pedidos</span>
                            <span>{m.pct}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Refunds + Discounts + Coupons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Reembolsos & Cupons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg bg-red-50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-red-600">Reembolsos</p>
                      <p className="text-lg font-bold text-red-600">{totalRefunds}</p>
                      <p className="text-[10px] text-red-500">R$ {refundValue.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-amber-600">Taxa Reemb.</p>
                      <p className="text-lg font-bold text-amber-600">{refundRate}%</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-blue-600">Desconto Med.</p>
                      <p className="text-lg font-bold text-blue-600">8.5%</p>
                    </div>
                  </div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Top Cupons Utilizados</p>
                  <div className="space-y-2">
                    {couponData.map((c) => (
                      <div key={c.code} className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-primary">{c.code}</span>
                        <span className="text-muted-foreground">{c.uses} usos</span>
                        <span className="font-medium text-foreground">R$ {c.revenue.toLocaleString("pt-BR")}</span>
                        <span className="text-red-500">-R$ {c.discount.toLocaleString("pt-BR")}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ TRÁFEGO ═══════════════ */}
        <TabsContent value="trafego">
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Visitantes por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visitorsByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8d4d4" />
                        <XAxis dataKey="day" fontSize={9} stroke="#6b4c4c" />
                        <YAxis fontSize={10} stroke="#6b4c4c" />
                        <Tooltip formatter={(value) => [`${value} visitantes`, "Visitantes"]} />
                        <Bar dataKey="v" fill="#8b5e5e" radius={[2, 2, 0, 0]} name="Visitantes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value"
                          label={({ name, value }) => `${name} ${value}%`}>
                          {deviceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex justify-center gap-3">
                    <div className="flex items-center gap-1 text-[10px]"><Smartphone className="size-3 text-[#8b5e5e]" /> Mobile 62%</div>
                    <div className="flex items-center gap-1 text-[10px]"><Monitor className="size-3 text-[#c4a0a0]" /> Desktop 31%</div>
                    <div className="flex items-center gap-1 text-[10px]"><Tablet className="size-3 text-[#e8d4d4]" /> Tablet 7%</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visitors by Hour — Horizontal Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Visitantes por Hora</CardTitle>
                <CardDescription>Distribuicao de acessos ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[480px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visitorsByHour}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8d4d4" horizontal={false} />
                      <XAxis type="number" fontSize={10} stroke="#6b4c4c" />
                      <YAxis type="category" dataKey="hour" fontSize={10} stroke="#6b4c4c" width={32} />
                      <Tooltip formatter={(value) => [`${value} visitantes`, "Visitantes"]} />
                      <Bar dataKey="v" fill="#8b5e5e" radius={[0, 3, 3, 0]} name="Visitantes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Full traffic sources table with revenue + ROAS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Fontes de Trafego — Performance Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fonte</TableHead>
                      <TableHead className="text-right">Visitantes</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Bounce</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Conversoes</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Conv. %</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">Receita</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">CPA</TableHead>
                      <TableHead className="text-right hidden xl:table-cell">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trafficSources.map((s) => {
                      const Icon = s.icon;
                      return (
                        <TableRow key={s.source}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="size-3.5 text-muted-foreground" />
                              <span className="font-medium">{s.source}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{s.visitors.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            <span className={s.bounce > 40 ? "text-red-600" : s.bounce > 30 ? "text-amber-600" : "text-green-600"}>{s.bounce}%</span>
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell">{s.conversions}</TableCell>
                          <TableCell className="text-right hidden md:table-cell">
                            <Badge variant={s.convRate >= 4.5 ? "default" : "outline"} className="text-[10px]">{s.convRate}%</Badge>
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell font-medium text-[#8b5e5e]">R$ {s.revenue.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right hidden lg:table-cell text-muted-foreground">{s.cpa > 0 ? `R$ ${s.cpa}` : "-"}</TableCell>
                          <TableCell className="text-right hidden xl:table-cell">
                            <Badge variant={s.roas === "∞" ? "default" : "secondary"} className="text-[10px]">{s.roas}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Geo data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium"><MapPin className="size-4" /> Cidades com Mais Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead className="text-right">Visitantes</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Receita</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Conv. %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geoData.map((g, i) => (
                      <TableRow key={g.city}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{g.city}, {g.state}</TableCell>
                        <TableCell className="text-right">{g.visitors.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">{g.orders}</TableCell>
                        <TableCell className="text-right hidden md:table-cell font-medium text-[#8b5e5e]">R$ {g.revenue.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">{((g.orders / g.visitors) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════ CLIENTES ═══════════════ */}
        <TabsContent value="clientes">
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {customerKpis.map((k) => (
                <KpiCard key={k.label} {...k} />
              ))}
            </div>

            {/* New vs Returning */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Novos vs Recorrentes (Mensal)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={newVsReturning}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8d4d4" />
                      <XAxis dataKey="month" fontSize={12} stroke="#6b4c4c" />
                      <YAxis fontSize={10} stroke="#6b4c4c" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="novos" fill="#8b5e5e" name="Novos Clientes" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="recorrentes" fill="#c4a0a0" name="Recorrentes" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Cohort table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Analise de Coorte</CardTitle>
                  <CardDescription>Retencao mensal por coorte de aquisicao</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coorte</TableHead>
                        <TableHead className="text-center">Clientes</TableHead>
                        <TableHead className="text-center">Mes 1</TableHead>
                        <TableHead className="text-center">Mes 2</TableHead>
                        <TableHead className="text-center">Mes 3</TableHead>
                        <TableHead className="text-right">LTV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerCohorts.map((c) => (
                        <TableRow key={c.cohort}>
                          <TableCell className="font-medium">{c.cohort}</TableCell>
                          <TableCell className="text-center">{c.customers}</TableCell>
                          <TableCell className="text-center"><Badge variant="default" className="text-[10px]">{c.month1}</Badge></TableCell>
                          <TableCell className="text-center">{c.month2 !== "-" ? <Badge variant="secondary" className="text-[10px]">{c.month2}</Badge> : "-"}</TableCell>
                          <TableCell className="text-center">{c.month3 !== "-" ? <Badge variant="outline" className="text-[10px]">{c.month3}</Badge> : "-"}</TableCell>
                          <TableCell className="text-right font-medium text-[#8b5e5e]">{c.ltv}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Customer segmentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Segmentacao de Clientes</CardTitle>
                  <CardDescription>Baseado em frequencia e valor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { segment: "Champions", desc: "Alta frequencia + alto valor", count: 12, pct: 8, color: "bg-green-100 text-green-700" },
                      { segment: "Leais", desc: "Compras regulares", count: 22, pct: 15, color: "bg-blue-100 text-blue-700" },
                      { segment: "Potencial Alto", desc: "1 compra de alto valor", count: 28, pct: 20, color: "bg-purple-100 text-purple-700" },
                      { segment: "Novos", desc: "Primeira compra recente", count: 45, pct: 32, color: "bg-amber-100 text-amber-700" },
                      { segment: "Em Risco", desc: "Nao compra ha 60+ dias", count: 18, pct: 13, color: "bg-orange-100 text-orange-700" },
                      { segment: "Inativos", desc: "Nao compra ha 90+ dias", count: 17, pct: 12, color: "bg-red-100 text-red-700" },
                    ].map((s) => (
                      <div key={s.segment} className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${s.color}`}>{s.segment}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{s.desc}</span>
                            <span className="font-medium">{s.count} ({s.pct}%)</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-[#8b5e5e]" style={{ width: `${s.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ COMPORTAMENTO ═══════════════ */}
        <TabsContent value="comportamento">
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
              <MiniKpi label="Pag / Sessao" value="3.2" change="+0.3" positive={true} />
              <MiniKpi label="Duracao Media" value="2m 34s" change="+12s" positive={true} />
              <MiniKpi label="Taxa Rejeicao" value="38%" change="-3%" positive={true} />
              <MiniKpi label="% Novos" value="68%" change="+5%" positive={true} />
              <MiniKpi label="% Retornantes" value="32%" change="-5%" positive={false} />
              <MiniKpi label="Scroll Medio" value="72%" change="+8%" positive={true} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Paginas Mais Visitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Pagina</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Tempo</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Bounce</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">Exit Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPages.map((p, i) => (
                      <TableRow key={p.page}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell><span className="font-mono text-xs font-medium text-primary">{p.page}</span></TableCell>
                        <TableCell className="text-right font-medium">{p.views.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">{p.avgTime}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <span className={p.bounce > 40 ? "text-red-600" : p.bounce > 30 ? "text-amber-600" : "text-green-600"}>{p.bounce}%</span>
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          <span className={p.exitRate > 30 ? "text-red-600" : p.exitRate > 20 ? "text-amber-600" : "text-green-600"}>{p.exitRate}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* User Journey */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Jornada do Usuario (Fluxo Mais Comum)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { page: "Home", pct: "100%" },
                    { page: "/dogbook", pct: "50%" },
                    { page: "/carrinho", pct: "15%" },
                    { page: "Checkout", pct: "7.5%" },
                    { page: "Compra", pct: "4.2%" },
                  ].map((step, i) => (
                    <div key={step.page} className="flex items-center gap-2">
                      <div className="rounded-lg border bg-background px-3 py-2 text-center">
                        <p className="font-medium text-foreground">{step.page}</p>
                        <p className="text-[10px] text-muted-foreground">{step.pct}</p>
                      </div>
                      {i < 4 && <ArrowRight className="size-3.5 text-muted-foreground/50" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════ MARKETING ═══════════════ */}
        <TabsContent value="marketing">
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {marketingKpis.map((k) => (
                <MiniKpi key={k.label} {...k} />
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">ROI por Canal</CardTitle>
                <CardDescription>Investimento vs Retorno — ROAS e CPA por canal</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Canal</TableHead>
                      <TableHead className="text-right">Investimento</TableHead>
                      <TableHead className="text-right">Receita Gerada</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Pedidos</TableHead>
                      <TableHead className="text-right hidden md:table-cell">CPA</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketingByChannel.map((m) => (
                      <TableRow key={m.channel}>
                        <TableCell className="font-medium">{m.channel}</TableCell>
                        <TableCell className="text-right text-red-600">R$ {m.spend.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">R$ {m.revenue.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">{m.orders}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <span className={m.cpa > 200 ? "text-red-600" : m.cpa > 100 ? "text-amber-600" : "text-green-600"}>R$ {m.cpa}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={m.roas >= 7 ? "default" : m.roas >= 4 ? "secondary" : "destructive"} className="text-[10px]">{m.roas}x</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right text-red-600">R$ {marketingByChannel.reduce((s, m) => s + m.spend, 0).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right text-green-600">R$ {marketingByChannel.reduce((s, m) => s + m.revenue, 0).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">{marketingByChannel.reduce((s, m) => s + m.orders, 0)}</TableCell>
                      <TableCell className="hidden md:table-cell" />
                      <TableCell className="text-right">
                        <Badge variant="default" className="text-[10px]">
                          {(marketingByChannel.reduce((s, m) => s + m.revenue, 0) / marketingByChannel.reduce((s, m) => s + m.spend, 0)).toFixed(1)}x
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Organic vs Paid revenue split */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Receita: Organica vs Paga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Organica", value: 146250 },
                            { name: "Paga", value: 18900 },
                          ]}
                          cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          <Cell fill="#8b5e5e" />
                          <Cell fill="#c4a0a0" />
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cupons de Influenciadores</CardTitle>
                  <CardDescription>Performance dos codigos de desconto ativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cupom</TableHead>
                        <TableHead className="text-right">Usos</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Desconto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {couponData.map((c) => (
                        <TableRow key={c.code}>
                          <TableCell className="font-mono text-xs font-medium text-primary">{c.code}</TableCell>
                          <TableCell className="text-right">{c.uses}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">R$ {c.revenue.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right text-red-500">-R$ {c.discount.toLocaleString("pt-BR")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
