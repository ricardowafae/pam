"use client";

import { useState, useMemo } from "react";
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

/* ─── Seeded Random for deterministic mock data ─── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── Generate 360 days of daily mock data ─── */
function generateDailyMockData() {
  const data: { date: Date; day: string; revenue: number; visitors: number; orders: number; adSpend: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rng = seededRandom(42);

  for (let i = 360; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const month = d.getMonth(); // 0-11
    // Seasonality: Dec-Jan higher, Jun-Jul lower
    const seasonFactor = 1 + 0.3 * Math.sin(((month - 5) / 12) * 2 * Math.PI);
    // Weekend boost
    const dayOfWeek = d.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1;
    // Growth trend over time (newer = more revenue)
    const trendFactor = 0.85 + 0.15 * ((360 - i) / 360);

    const baseRevenue = 3500;
    const revenue = Math.round(baseRevenue * seasonFactor * weekendFactor * trendFactor * (0.6 + rng() * 0.8));
    const visitors = Math.round(120 * seasonFactor * weekendFactor * trendFactor * (0.7 + rng() * 0.6));
    const orders = Math.max(1, Math.round(revenue / (800 + rng() * 400)));
    const adSpend = Math.round(100 + rng() * 80);

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");

    data.push({ date: d, day: `${dd}/${mm}`, revenue, visitors, orders, adSpend });
  }
  return data;
}

const allDailyMetrics = generateDailyMockData();

/* ─── Helpers for computing KPIs from filtered data ─── */
function filterDailyByRange(data: typeof allDailyMetrics, range: DateRange) {
  if (!range.start || !range.end) return data;
  return data.filter((d) => d.date >= range.start! && d.date <= range.end!);
}

function computeKpis(filtered: typeof allDailyMetrics) {
  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  const ticketMedio = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const convRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : "0";
  const revenuePerVisitor = totalVisitors > 0 ? Math.round(totalRevenue / totalVisitors) : 0;

  // Compare with previous period of same length
  const days = filtered.length;
  const endIdx = allDailyMetrics.indexOf(filtered[0]);
  const prevStart = Math.max(0, endIdx - days);
  const prevSlice = allDailyMetrics.slice(prevStart, endIdx);
  const prevRevenue = prevSlice.reduce((s, d) => s + d.revenue, 0);
  const prevOrders = prevSlice.reduce((s, d) => s + d.orders, 0);
  const prevVisitors = prevSlice.reduce((s, d) => s + d.visitors, 0);
  const prevTicket = prevOrders > 0 ? Math.round(prevRevenue / prevOrders) : 0;
  const prevConvRate = prevVisitors > 0 ? ((prevOrders / prevVisitors) * 100) : 0;
  const prevRPV = prevVisitors > 0 ? Math.round(prevRevenue / prevVisitors) : 0;

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return "+100%";
    const change = ((curr - prev) / prev) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
  };

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ".")}` : String(n);
  const fmtBRL = (n: number) => `R$ ${n >= 1000 ? fmt(n) : n}`;

  return [
    { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`, change: pctChange(totalRevenue, prevRevenue), positive: totalRevenue >= prevRevenue, icon: DollarSign },
    { label: "Pedidos", value: String(totalOrders), change: pctChange(totalOrders, prevOrders), positive: totalOrders >= prevOrders, icon: ShoppingCart },
    { label: "Ticket Medio", value: `R$ ${ticketMedio.toLocaleString("pt-BR")}`, change: pctChange(ticketMedio, prevTicket), positive: ticketMedio >= prevTicket, icon: Receipt },
    { label: "Visitantes Unicos", value: totalVisitors.toLocaleString("pt-BR"), change: pctChange(totalVisitors, prevVisitors), positive: totalVisitors >= prevVisitors, icon: Users },
    { label: "Taxa de Conversao", value: `${convRate}%`, change: pctChange(parseFloat(convRate), prevConvRate), positive: parseFloat(convRate) >= prevConvRate, icon: Target },
    { label: "Receita / Visitante", value: `R$ ${revenuePerVisitor}`, change: pctChange(revenuePerVisitor, prevRPV), positive: revenuePerVisitor >= prevRPV, icon: Zap },
  ];
}

/* ─── Aggregate daily data into monthly buckets ─── */
function aggregateMonthly(filtered: typeof allDailyMetrics) {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const buckets: Record<string, { month: string; dogbook: number; pocket: number; estudio: number; completa: number; total: number }> = {};

  for (const d of filtered) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!buckets[key]) {
      buckets[key] = { month: monthNames[d.date.getMonth()], dogbook: 0, pocket: 0, estudio: 0, completa: 0, total: 0 };
    }
    // Distribute revenue across product types (mock split)
    const rng = seededRandom(d.date.getTime());
    const dogbookPct = 0.45 + rng() * 0.1;
    const pocketPct = 0.2 + rng() * 0.05;
    const estudioPct = 0.2 + rng() * 0.05;
    const completaPct = 1 - dogbookPct - pocketPct - estudioPct;

    buckets[key].dogbook += Math.round(d.revenue * dogbookPct);
    buckets[key].pocket += Math.round(d.revenue * pocketPct);
    buckets[key].estudio += Math.round(d.revenue * estudioPct);
    buckets[key].completa += Math.round(d.revenue * completaPct);
    buckets[key].total += d.revenue;
  }

  return Object.values(buckets);
}

/* ─── Visitors by Hour base distribution (shape stays the same, values scale) ─── */
const HOUR_COLORS = [
  "#5c3d2e", "#6b4c3d", "#7a5b4c", "#8b6a5b", "#9c7a6b",
  "#ad8a7b", "#b89485", "#c4a090", "#d0ac9b", "#dbb8a6",
  "#e6c4b1", "#f0d0bc", "#e8c4a8", "#d8b494", "#c8a480",
  "#b8946c", "#a88458", "#987444", "#886430", "#785420",
  "#684410", "#583400", "#4a2800", "#3c1c00",
];

const hourDistribution = [8, 4, 2, 1, 3, 6, 15, 35, 78, 120, 145, 168, 132, 155, 178, 165, 148, 130, 110, 145, 190, 175, 95, 42];
const hourTotal = hourDistribution.reduce((s, v) => s + v, 0);

/* ─── Base proportions for secondary data (used by generator functions) ─── */
const productDefs = [
  { product: "Dogbook Verao", category: "Dogbook", revPct: 0.112, avgTicket: 490, margin: 72, baseGrowth: 15 },
  { product: "Dogbook Natal", category: "Dogbook", revPct: 0.147, avgTicket: 490, margin: 72, baseGrowth: 22 },
  { product: "Dogbook Inverno", category: "Dogbook", revPct: 0.101, avgTicket: 490, margin: 72, baseGrowth: 8 },
  { product: "Dogbook Caoniversario", category: "Dogbook", revPct: 0.053, avgTicket: 490, margin: 72, baseGrowth: 35 },
  { product: "Dogbook Ano Novo", category: "Dogbook", revPct: 0.040, avgTicket: 490, margin: 72, baseGrowth: -5 },
  { product: "Sessao Pocket", category: "Sessao", revPct: 0.137, avgTicket: 900, margin: 45, baseGrowth: 18 },
  { product: "Sessao Estudio", category: "Sessao", revPct: 0.242, avgTicket: 3700, margin: 52, baseGrowth: 28 },
  { product: "Sessao Completa", category: "Sessao", revPct: 0.160, avgTicket: 4900, margin: 48, baseGrowth: 10 },
];

const trafficSourceDefs = [
  { source: "Google Organico", pctOfVisitors: 0.37, bounce: 35, convRate: 4.4, pctOfRevenue: 0.352, cpaBase: 0, icon: Search },
  { source: "Instagram", pctOfVisitors: 0.255, bounce: 28, convRate: 4.9, pctOfRevenue: 0.277, cpaBase: 0, icon: Instagram },
  { source: "Direto", pctOfVisitors: 0.161, bounce: 22, convRate: 4.5, pctOfRevenue: 0.148, cpaBase: 0, icon: Globe },
  { source: "Google Ads", pctOfVisitors: 0.107, bounce: 42, convRate: 3.7, pctOfRevenue: 0.086, cpaBase: 85, icon: MousePointerClick },
  { source: "WhatsApp", pctOfVisitors: 0.064, bounce: 18, convRate: 4.9, pctOfRevenue: 0.071, cpaBase: 0, icon: MessageCircle },
  { source: "TikTok", pctOfVisitors: 0.025, bounce: 45, convRate: 3.1, pctOfRevenue: 0.018, cpaBase: 210, icon: Globe },
  { source: "Facebook", pctOfVisitors: 0.018, bounce: 40, convRate: 2.9, pctOfRevenue: 0.011, cpaBase: 180, icon: Globe },
];

const geoDefs = [
  { city: "Sao Paulo", state: "SP", pctV: 0.474, pctO: 0.478 },
  { city: "Rio de Janeiro", state: "RJ", pctV: 0.161, pctO: 0.163 },
  { city: "Belo Horizonte", state: "MG", pctV: 0.099, pctO: 0.105 },
  { city: "Curitiba", state: "PR", pctV: 0.075, pctO: 0.082 },
  { city: "Campinas", state: "SP", pctV: 0.055, pctO: 0.070 },
  { city: "Brasilia", state: "DF", pctV: 0.048, pctO: 0.047 },
  { city: "Porto Alegre", state: "RS", pctV: 0.042, pctO: 0.041 },
  { city: "Florianopolis", state: "SC", pctV: 0.025, pctO: 0.029 },
];

const marketingChannelDefs = [
  { channel: "Google Ads", spendPct: 0.309, revPct: 0.353 },
  { channel: "Instagram Ads", spendPct: 0.371, revPct: 0.318 },
  { channel: "TikTok Ads", spendPct: 0.130, revPct: 0.072 },
  { channel: "Facebook Ads", spendPct: 0.103, revPct: 0.045 },
  { channel: "Influenciadores", spendPct: 0.087, revPct: 0.204 },
];

const couponDefs = [
  { code: "CAMILA10", usesPct: 0.42, discountRate: 0.10 },
  { code: "DOG15", usesPct: 0.26, discountRate: 0.15 },
  { code: "VIDA5", usesPct: 0.16, discountRate: 0.05 },
  { code: "VOLTA10", usesPct: 0.11, discountRate: 0.10 },
  { code: "RESGATE20", usesPct: 0.05, discountRate: 0.20 },
];

const topPageDefs = [
  { page: "/", viewsPct: 0.392, avgTime: "1m 12s", bounce: 32, exitRate: 18 },
  { page: "/dogbook", viewsPct: 0.196, avgTime: "3m 45s", bounce: 22, exitRate: 12 },
  { page: "/sessoes", viewsPct: 0.120, avgTime: "2m 58s", bounce: 25, exitRate: 15 },
  { page: "/sessoes/pocket", viewsPct: 0.069, avgTime: "2m 30s", bounce: 28, exitRate: 20 },
  { page: "/carrinho", viewsPct: 0.059, avgTime: "3m 15s", bounce: 45, exitRate: 38 },
  { page: "/vale-presente", viewsPct: 0.043, avgTime: "1m 50s", bounce: 35, exitRate: 25 },
  { page: "/faq", viewsPct: 0.039, avgTime: "4m 10s", bounce: 15, exitRate: 8 },
  { page: "/depoimentos", viewsPct: 0.032, avgTime: "2m 22s", bounce: 18, exitRate: 10 },
  { page: "/sessoes/estudio", viewsPct: 0.029, avgTime: "3m 05s", bounce: 20, exitRate: 14 },
  { page: "/sessoes/completa", viewsPct: 0.019, avgTime: "4m 20s", bounce: 15, exitRate: 10 },
];

/* ─── Generator functions — derive all data from filteredDaily ─── */

function generateSalesByProduct(filtered: typeof allDailyMetrics) {
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  return productDefs.map((p) => {
    const revenue = Math.round(totalRev * p.revPct);
    const units = Math.max(1, Math.round(revenue / p.avgTicket));
    const rng = seededRandom(p.product.length * 100 + filtered.length);
    const growthVariation = rng() * 10 - 5;
    const growth = Math.round(p.baseGrowth + growthVariation);
    return {
      product: p.product, category: p.category, units, revenue,
      avgTicket: p.avgTicket, growth: `${growth >= 0 ? "+" : ""}${growth}%`,
      positive: growth >= 0, margin: p.margin,
    };
  });
}

function generateFunnelData(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  return [
    { name: "Visitantes", value: totalVisitors, fill: "#8b5e5e" },
    { name: "Visualizaram produto", value: Math.round(totalVisitors * 0.50), fill: "#9a6f6f" },
    { name: "Adicionaram ao carrinho", value: Math.round(totalVisitors * 0.151), fill: "#a98282" },
    { name: "Iniciaram checkout", value: Math.round(totalVisitors * 0.075), fill: "#b89494" },
    { name: "Pagamento iniciado", value: Math.round(totalVisitors * 0.055), fill: "#c7a7a7" },
    { name: "Compraram", value: Math.round(totalVisitors * 0.042), fill: "#d6b9b9" },
  ];
}

function generatePaymentMethods(filtered: typeof allDailyMetrics) {
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  return [
    { method: "Cartao de Credito", orders: Math.round(totalOrders * 0.54), revenue: Math.round(totalRev * 0.56), pct: 56 },
    { method: "PIX", orders: Math.round(totalOrders * 0.34), revenue: Math.round(totalRev * 0.33), pct: 33 },
    { method: "Vale Presente", orders: Math.round(totalOrders * 0.07), revenue: Math.round(totalRev * 0.06), pct: 6 },
    { method: "Boleto", orders: Math.round(totalOrders * 0.05), revenue: Math.round(totalRev * 0.05), pct: 5 },
  ];
}

function generateRevenueByCategoryPie(filtered: typeof allDailyMetrics) {
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  return [
    { name: "Dogbooks", value: Math.round(totalRev * 0.453), fill: "#8b5e5e" },
    { name: "Sessao Pocket", value: Math.round(totalRev * 0.137), fill: "#a67c7c" },
    { name: "Sessao Estudio", value: Math.round(totalRev * 0.242), fill: "#c4a0a0" },
    { name: "Sessao Completa", value: Math.round(totalRev * 0.160), fill: "#d4b8b8" },
  ];
}

function generateTrafficSources(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  return trafficSourceDefs.map((t) => {
    const visitors = Math.round(totalVisitors * t.pctOfVisitors);
    const conversions = Math.round(visitors * t.convRate / 100);
    const revenue = Math.round(totalRev * t.pctOfRevenue);
    const cpa = t.cpaBase > 0 ? Math.round(t.cpaBase * (filtered.length / 30)) : 0;
    const spend = cpa > 0 ? cpa * conversions : 0;
    return {
      source: t.source, visitors, pct: +(t.pctOfVisitors * 100).toFixed(1),
      bounce: t.bounce, conversions, convRate: t.convRate, revenue,
      cpa: t.cpaBase, roas: spend > 0 ? `${(revenue / spend).toFixed(1)}x` : "∞" as string,
      icon: t.icon,
    };
  });
}

function generateVisitorsByHour(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  return hourDistribution.map((base, i) => ({
    hour: `${String(i).padStart(2, "0")}h`,
    v: Math.round((base / hourTotal) * totalVisitors),
    fill: HOUR_COLORS[i],
  }));
}

function generateDeviceData(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  return [
    { name: "Mobile", value: Math.round(totalVisitors * 0.62), pct: 62, fill: "#8b5e5e" },
    { name: "Desktop", value: Math.round(totalVisitors * 0.31), pct: 31, fill: "#c4a0a0" },
    { name: "Tablet", value: Math.round(totalVisitors * 0.07), pct: 7, fill: "#e8d4d4" },
  ];
}

function generateGeoData(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  return geoDefs.map((g) => ({
    city: g.city, state: g.state,
    visitors: Math.round(totalVisitors * g.pctV),
    orders: Math.round(totalOrders * g.pctO),
    revenue: Math.round(totalRev * g.pctO),
  }));
}

function generateCustomerKpis(filtered: typeof allDailyMetrics, prevFiltered: typeof allDailyMetrics) {
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const prevOrders = prevFiltered.reduce((s, d) => s + d.orders, 0);
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  const prevRev = prevFiltered.reduce((s, d) => s + d.revenue, 0);

  const uniqueCustomers = Math.round(totalOrders * 0.78);
  const newCustomers = Math.round(uniqueCustomers * 0.76);
  const returningCustomers = uniqueCustomers - newCustomers;
  const recompraRate = uniqueCustomers > 0 ? Math.round((returningCustomers / uniqueCustomers) * 100) : 0;
  const ltv = uniqueCustomers > 0 ? Math.round(totalRev / uniqueCustomers) : 0;

  const prevUnique = Math.round(prevOrders * 0.78);
  const prevNew = Math.round(prevUnique * 0.76);
  const prevReturning = prevUnique - prevNew;
  const prevRecompra = prevUnique > 0 ? Math.round((prevReturning / prevUnique) * 100) : 0;
  const prevLtv = prevUnique > 0 ? Math.round(prevRev / prevUnique) : 0;

  const pct = (c: number, p: number) => {
    if (p === 0) return "+100%";
    const ch = ((c - p) / p) * 100;
    return `${ch >= 0 ? "+" : ""}${ch.toFixed(0)}%`;
  };

  return [
    { label: "Clientes Unicos", value: String(uniqueCustomers), change: pct(uniqueCustomers, prevUnique), positive: uniqueCustomers >= prevUnique, icon: Users },
    { label: "Novos Clientes", value: String(newCustomers), change: pct(newCustomers, prevNew), positive: newCustomers >= prevNew, icon: UserCheck },
    { label: "Clientes Recorrentes", value: String(returningCustomers), change: pct(returningCustomers, prevReturning), positive: returningCustomers >= prevReturning, icon: Repeat },
    { label: "Taxa de Recompra", value: `${recompraRate}%`, change: pct(recompraRate, prevRecompra), positive: recompraRate >= prevRecompra, icon: Heart },
    { label: "LTV Medio", value: `R$ ${ltv.toLocaleString("pt-BR")}`, change: pct(ltv, prevLtv), positive: ltv >= prevLtv, icon: Star },
    { label: "Tempo ate 2a Compra", value: "42 dias", change: "-8%", positive: true, icon: CalendarDays },
  ];
}

function generateNewVsReturning(filtered: typeof allDailyMetrics) {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const buckets: Record<string, { month: string; novos: number; recorrentes: number }> = {};
  for (const d of filtered) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!buckets[key]) {
      buckets[key] = { month: monthNames[d.date.getMonth()], novos: 0, recorrentes: 0 };
    }
    buckets[key].novos += Math.round(d.orders * 0.76);
    buckets[key].recorrentes += Math.round(d.orders * 0.24);
  }
  return Object.values(buckets);
}

function generateCohorts(filtered: typeof allDailyMetrics) {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const buckets: Record<string, { month: string; year: number; orders: number; revenue: number }> = {};
  for (const d of filtered) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!buckets[key]) {
      buckets[key] = { month: monthNames[d.date.getMonth()], year: d.date.getFullYear(), orders: 0, revenue: 0 };
    }
    buckets[key].orders += d.orders;
    buckets[key].revenue += d.revenue;
  }
  const months = Object.values(buckets);
  return months.slice(-3).map((m, idx) => {
    const customers = Math.round(m.orders * 0.78);
    const monthsAgo = months.length - (months.length - 3 + idx) - 1;
    return {
      cohort: `${m.month}/${m.year}`,
      customers,
      month1: `${68 + Math.round(Math.random() * 10)}%`,
      month2: monthsAgo >= 1 ? `${38 + Math.round(Math.random() * 8)}%` : "-",
      month3: monthsAgo >= 2 ? `${22 + Math.round(Math.random() * 8)}%` : "-",
      ltv: `R$ ${Math.round(m.revenue / customers).toLocaleString("pt-BR")}`,
    };
  });
}

function generateTopPages(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  // Pages get ~2.5x the visitor count in total views (multiple pages per session)
  const totalPageViews = Math.round(totalVisitors * 2.5);
  return topPageDefs.map((p) => ({
    ...p, views: Math.round(totalPageViews * p.viewsPct),
  }));
}

function generateBehaviorKpis(filtered: typeof allDailyMetrics, prevFiltered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  const prevVisitors = prevFiltered.reduce((s, d) => s + d.visitors, 0);
  const pagesPerSession = 3.2;
  const rng = seededRandom(filtered.length * 7);
  const bounceRate = Math.round(36 + rng() * 6);
  const newPct = Math.round(66 + rng() * 6);
  const scrollPct = Math.round(68 + rng() * 10);
  const duration = `${Math.round(2 + rng())}m ${Math.round(10 + rng() * 50)}s`;

  return [
    { label: "Pag / Sessao", value: pagesPerSession.toFixed(1), change: "+0.3", positive: true },
    { label: "Duracao Media", value: duration, change: "+12s", positive: true },
    { label: "Taxa Rejeicao", value: `${bounceRate}%`, change: `${bounceRate < 38 ? "-" : "+"}3%`, positive: bounceRate < 38 },
    { label: "% Novos", value: `${newPct}%`, change: "+5%", positive: true },
    { label: "% Retornantes", value: `${100 - newPct}%`, change: "-5%", positive: false },
    { label: "Scroll Medio", value: `${scrollPct}%`, change: "+8%", positive: true },
  ];
}

function generateMarketingKpis(filtered: typeof allDailyMetrics, prevFiltered: typeof allDailyMetrics) {
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalAdSpend = filtered.reduce((s, d) => s + d.adSpend, 0);
  const prevRev = prevFiltered.reduce((s, d) => s + d.revenue, 0);
  const prevAdSpend = prevFiltered.reduce((s, d) => s + d.adSpend, 0);
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const paidOrders = Math.round(totalOrders * 0.22);
  const paidRevenue = Math.round(totalRev * 0.115);
  const organicRevenue = totalRev - paidRevenue;
  const cpa = paidOrders > 0 ? Math.round(totalAdSpend / paidOrders) : 0;
  const roas = totalAdSpend > 0 ? (totalRev / totalAdSpend).toFixed(0) : "0";
  const organicPct = totalRev > 0 ? Math.round((organicRevenue / totalRev) * 100) : 0;

  const prevPaidRev = Math.round(prevRev * 0.115);
  const prevOrgRev = prevRev - prevPaidRev;
  const prevPaidOrders = Math.round(prevFiltered.reduce((s, d) => s + d.orders, 0) * 0.22);
  const prevCpa = prevPaidOrders > 0 ? Math.round(prevAdSpend / prevPaidOrders) : 0;

  const pct = (c: number, p: number) => {
    if (p === 0) return "+100%";
    const ch = ((c - p) / p) * 100;
    return `${ch >= 0 ? "+" : ""}${ch.toFixed(0)}%`;
  };

  return {
    kpis: [
      { label: "Investimento Total", value: `R$ ${totalAdSpend.toLocaleString("pt-BR")}`, change: pct(totalAdSpend, prevAdSpend), positive: totalAdSpend <= prevAdSpend },
      { label: "ROAS Geral", value: `${roas}x`, change: pct(+roas, prevAdSpend > 0 ? +(prevRev / prevAdSpend).toFixed(0) : 0), positive: true },
      { label: "CPA Medio", value: `R$ ${cpa}`, change: pct(cpa, prevCpa), positive: cpa <= prevCpa },
      { label: "Receita Paga", value: `R$ ${paidRevenue.toLocaleString("pt-BR")}`, change: pct(paidRevenue, prevPaidRev), positive: paidRevenue >= prevPaidRev },
      { label: "Receita Organica", value: `R$ ${organicRevenue.toLocaleString("pt-BR")}`, change: pct(organicRevenue, prevOrgRev), positive: organicRevenue >= prevOrgRev },
      { label: "% Receita Organica", value: `${organicPct}%`, change: "+2%", positive: true },
    ],
    paidRevenue,
    organicRevenue,
    totalAdSpend,
  };
}

function generateMarketingByChannel(filtered: typeof allDailyMetrics) {
  const totalAdSpend = filtered.reduce((s, d) => s + d.adSpend, 0);
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  const paidRevenue = Math.round(totalRev * 0.115);
  return marketingChannelDefs.map((m) => {
    const spend = Math.round(totalAdSpend * m.spendPct);
    const revenue = Math.round(paidRevenue * m.revPct / marketingChannelDefs.reduce((s, d) => s + d.revPct, 0));
    const orders = Math.max(1, Math.round(revenue / 950));
    const cpa = orders > 0 ? Math.round(spend / orders) : 0;
    const roas = spend > 0 ? +((revenue / spend).toFixed(1)) : 0;
    return { channel: m.channel, spend, revenue, roas, orders, cpa };
  });
}

function generateCouponData(filtered: typeof allDailyMetrics) {
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const couponOrders = Math.round(totalOrders * 0.10);
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  return couponDefs.map((c) => {
    const uses = Math.max(1, Math.round(couponOrders * c.usesPct));
    const avgOrderValue = totalOrders > 0 ? totalRev / totalOrders : 800;
    const revenue = Math.round(uses * avgOrderValue);
    const discount = Math.round(revenue * c.discountRate);
    return { code: c.code, uses, revenue, discount };
  });
}

function generateRefundData(filtered: typeof allDailyMetrics) {
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const totalRev = filtered.reduce((s, d) => s + d.revenue, 0);
  const rate = 1.8;
  const refunds = Math.max(0, Math.round(totalOrders * rate / 100));
  const value = Math.round(totalRev * rate / 100);
  return { rate, refunds, value };
}

function generateCustomerSegments(filtered: typeof allDailyMetrics) {
  const totalOrders = filtered.reduce((s, d) => s + d.orders, 0);
  const uniqueCustomers = Math.round(totalOrders * 0.78);
  return [
    { segment: "Champions", desc: "Alta frequencia + alto valor", count: Math.round(uniqueCustomers * 0.08), pct: 8, color: "bg-green-100 text-green-700" },
    { segment: "Leais", desc: "Compras regulares", count: Math.round(uniqueCustomers * 0.15), pct: 15, color: "bg-blue-100 text-blue-700" },
    { segment: "Potencial Alto", desc: "1 compra de alto valor", count: Math.round(uniqueCustomers * 0.20), pct: 20, color: "bg-purple-100 text-purple-700" },
    { segment: "Novos", desc: "Primeira compra recente", count: Math.round(uniqueCustomers * 0.32), pct: 32, color: "bg-amber-100 text-amber-700" },
    { segment: "Em Risco", desc: "Nao compra ha 60+ dias", count: Math.round(uniqueCustomers * 0.13), pct: 13, color: "bg-orange-100 text-orange-700" },
    { segment: "Inativos", desc: "Nao compra ha 90+ dias", count: Math.round(uniqueCustomers * 0.12), pct: 12, color: "bg-red-100 text-red-700" },
  ];
}

function generateUserJourney(filtered: typeof allDailyMetrics) {
  const totalVisitors = filtered.reduce((s, d) => s + d.visitors, 0);
  return [
    { page: "Home", pct: "100%", value: totalVisitors },
    { page: "/dogbook", pct: "50%", value: Math.round(totalVisitors * 0.50) },
    { page: "/carrinho", pct: "15%", value: Math.round(totalVisitors * 0.15) },
    { page: "Checkout", pct: "7.5%", value: Math.round(totalVisitors * 0.075) },
    { page: "Compra", pct: "4.2%", value: Math.round(totalVisitors * 0.042) },
  ];
}

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

  const filteredDaily = useMemo(() => filterDailyByRange(allDailyMetrics, dateRange), [dateRange]);
  const heroKpis = useMemo(() => computeKpis(filteredDaily), [filteredDaily]);
  const revenueByMonthByProduct = useMemo(() => aggregateMonthly(filteredDaily), [filteredDaily]);
  const dailyMetrics = filteredDaily;
  const visitorsByDay = useMemo(
    () => filteredDaily.map((d) => ({ day: d.day, v: d.visitors })),
    [filteredDaily]
  );

  // Previous period for comparison
  const prevFiltered = useMemo(() => {
    const days = filteredDaily.length;
    const endIdx = allDailyMetrics.indexOf(filteredDaily[0]);
    const prevStart = Math.max(0, endIdx - days);
    return allDailyMetrics.slice(prevStart, endIdx);
  }, [filteredDaily]);

  // All data derived from filtered daily — responds to date range
  const salesByProduct = useMemo(() => generateSalesByProduct(filteredDaily), [filteredDaily]);
  const funnelData = useMemo(() => generateFunnelData(filteredDaily), [filteredDaily]);
  const paymentMethods = useMemo(() => generatePaymentMethods(filteredDaily), [filteredDaily]);
  const revenueByCategoryPie = useMemo(() => generateRevenueByCategoryPie(filteredDaily), [filteredDaily]);
  const trafficSources = useMemo(() => generateTrafficSources(filteredDaily), [filteredDaily]);
  const visitorsByHourData = useMemo(() => generateVisitorsByHour(filteredDaily), [filteredDaily]);
  const deviceData = useMemo(() => generateDeviceData(filteredDaily), [filteredDaily]);
  const geoData = useMemo(() => generateGeoData(filteredDaily), [filteredDaily]);
  const customerKpis = useMemo(() => generateCustomerKpis(filteredDaily, prevFiltered), [filteredDaily, prevFiltered]);
  const newVsReturning = useMemo(() => generateNewVsReturning(filteredDaily), [filteredDaily]);
  const customerCohorts = useMemo(() => generateCohorts(filteredDaily), [filteredDaily]);
  const customerSegments = useMemo(() => generateCustomerSegments(filteredDaily), [filteredDaily]);
  const topPages = useMemo(() => generateTopPages(filteredDaily), [filteredDaily]);
  const behaviorKpis = useMemo(() => generateBehaviorKpis(filteredDaily, prevFiltered), [filteredDaily, prevFiltered]);
  const userJourney = useMemo(() => generateUserJourney(filteredDaily), [filteredDaily]);
  const marketingData = useMemo(() => generateMarketingKpis(filteredDaily, prevFiltered), [filteredDaily, prevFiltered]);
  const marketingByChannel = useMemo(() => generateMarketingByChannel(filteredDaily), [filteredDaily]);
  const couponData = useMemo(() => generateCouponData(filteredDaily), [filteredDaily]);
  const refundData = useMemo(() => generateRefundData(filteredDaily), [filteredDaily]);

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
                  <CardDescription>Visitante → Compra ({funnelData[0].value > 0 ? ((funnelData[5].value / funnelData[0].value) * 100).toFixed(1) : "0"}% taxa geral)</CardDescription>
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
            {(() => {
              const totalOrders = filteredDaily.reduce((s, d) => s + d.orders, 0);
              const totalVisitors = filteredDaily.reduce((s, d) => s + d.visitors, 0);
              const totalAdSpend = filteredDaily.reduce((s, d) => s + d.adSpend, 0);
              const uniqueCustomers = Math.round(totalOrders * 0.78);
              const returningCustomers = Math.round(uniqueCustomers * 0.24);
              const cac = uniqueCustomers > 0 ? Math.round(totalAdSpend / uniqueCustomers) : 0;
              const ltv = customerKpis.find((k) => k.label === "LTV Medio")?.value || "R$ 0";
              const ltvNum = parseInt(ltv.replace(/\D/g, ""), 10) || 0;
              const ltvCacRatio = cac > 0 ? Math.round(ltvNum / cac) : 0;
              const recompra = uniqueCustomers > 0 ? Math.round((returningCustomers / uniqueCustomers) * 100) : 0;
              const abandonRate = Math.round((1 - (funnelData[5].value / Math.max(1, funnelData[2].value))) * 100);
              return (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                  <MiniKpi label="Abandono Carrinho" value={`${abandonRate}%`} change="+2%" positive={false} />
                  <MiniKpi label="Taxa Rejeicao" value={behaviorKpis[2].value} change={behaviorKpis[2].change} positive={behaviorKpis[2].positive} />
                  <MiniKpi label="Duracao Media" value={behaviorKpis[1].value} change={behaviorKpis[1].change} positive={behaviorKpis[1].positive} />
                  <MiniKpi label="Pag / Sessao" value={behaviorKpis[0].value} change={behaviorKpis[0].change} positive={behaviorKpis[0].positive} />
                  <MiniKpi label="CAC" value={`R$ ${cac}`} change="-12%" positive={true} />
                  <MiniKpi label="LTV" value={ltv} change="+12%" positive={true} />
                  <MiniKpi label="LTV / CAC" value={`${ltvCacRatio}x`} change="+28%" positive={true} />
                  <MiniKpi label="Taxa Recompra" value={`${recompra}%`} change="+3%" positive={true} />
                </div>
              );
            })()}

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
                      <p className="text-lg font-bold text-red-600">{refundData.refunds}</p>
                      <p className="text-[10px] text-red-500">R$ {refundData.value.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <p className="text-[10px] font-medium uppercase text-amber-600">Taxa Reemb.</p>
                      <p className="text-lg font-bold text-amber-600">{refundData.rate}%</p>
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
                          label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}>
                          {deviceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString("pt-BR")} visitantes`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex justify-center gap-3">
                    <div className="flex items-center gap-1 text-[10px]"><Smartphone className="size-3 text-[#8b5e5e]" /> Mobile {deviceData[0].pct}%</div>
                    <div className="flex items-center gap-1 text-[10px]"><Monitor className="size-3 text-[#c4a0a0]" /> Desktop {deviceData[1].pct}%</div>
                    <div className="flex items-center gap-1 text-[10px]"><Tablet className="size-3 text-[#e8d4d4]" /> Tablet {deviceData[2].pct}%</div>
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
                      data={visitorsByHourData}
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
                    {customerSegments.map((s) => (
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
              {behaviorKpis.map((k) => (
                <MiniKpi key={k.label} {...k} />
              ))}
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
                  {userJourney.map((step, i) => (
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
              {marketingData.kpis.map((k) => (
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
                            { name: "Organica", value: marketingData.organicRevenue },
                            { name: "Paga", value: marketingData.paidRevenue },
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
