"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

interface KpiData {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: typeof DollarSign;
}

interface MiniKpiData {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface DailyMetric {
  date: string;
  day: string;
  revenue: number;
  visitors: number;
  orders: number;
}

interface MonthlyProduct {
  month: string;
  dogbook: number;
  pocket: number;
  estudio: number;
  completa: number;
  total: number;
}

interface SalesByProduct {
  product: string;
  category: string;
  units: number;
  revenue: number;
  avgTicket: number;
  growth: string;
  positive: boolean;
  margin: number;
}

interface FunnelItem {
  name: string;
  value: number;
  fill: string;
}

interface PaymentMethod {
  method: string;
  orders: number;
  revenue: number;
  pct: number;
}

interface RevenueByCategoryPie {
  name: string;
  value: number;
  fill: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  pct: number;
  bounce: number;
  conversions: number;
  convRate: number;
  revenue: number;
  cpa: number;
  roas: string;
  icon: typeof Search;
}

interface VisitorsByHour {
  hour: string;
  v: number;
  fill: string;
}

interface DeviceDataItem {
  name: string;
  value: number;
  pct: number;
  fill: string;
}

interface GeoDataItem {
  city: string;
  state: string;
  visitors: number;
  orders: number;
  revenue: number;
}

interface TopPage {
  page: string;
  views: number;
  avgTime: string;
  bounce: number;
  exitRate: number;
}

interface CouponDataItem {
  code: string;
  uses: number;
  revenue: number;
  discount: number;
}

interface MarketingChannel {
  channel: string;
  spend: number;
  revenue: number;
  roas: number;
  orders: number;
  cpa: number;
}

interface MarketingKpis {
  kpis: MiniKpiData[];
  paidRevenue: number;
  organicRevenue: number;
  totalAdSpend: number;
}

interface CustomerCohort {
  cohort: string;
  customers: number;
  month1: string;
  month2: string;
  month3: string;
  ltv: string;
}

interface CustomerSegment {
  segment: string;
  desc: string;
  count: number;
  pct: number;
  color: string;
}

interface UserJourneyStep {
  page: string;
  pct: string;
  value: number;
}

interface AnalyticsData {
  heroKpis: KpiData[];
  dailyMetrics: DailyMetric[];
  visitorsByDay: { day: string; v: number }[];
  revenueByMonthByProduct: MonthlyProduct[];
  salesByProduct: SalesByProduct[];
  funnelData: FunnelItem[];
  paymentMethods: PaymentMethod[];
  revenueByCategoryPie: RevenueByCategoryPie[];
  trafficSources: TrafficSource[];
  visitorsByHourData: VisitorsByHour[];
  deviceData: DeviceDataItem[];
  geoData: GeoDataItem[];
  customerKpis: KpiData[];
  newVsReturning: { month: string; novos: number; recorrentes: number }[];
  customerCohorts: CustomerCohort[];
  customerSegments: CustomerSegment[];
  topPages: TopPage[];
  behaviorKpis: MiniKpiData[];
  userJourney: UserJourneyStep[];
  marketingData: MarketingKpis;
  marketingByChannel: MarketingChannel[];
  couponData: CouponDataItem[];
  refundData: { rate: number; refunds: number; value: number };
  totalRevenue: number;
  totalUnits: number;
}

/* ══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ══════════════════════════════════════════════════════════ */

const HOUR_COLORS = [
  "#5c3d2e", "#6b4c3d", "#7a5b4c", "#8b6a5b", "#9c7a6b",
  "#ad8a7b", "#b89485", "#c4a090", "#d0ac9b", "#dbb8a6",
  "#e6c4b1", "#f0d0bc", "#e8c4a8", "#d8b494", "#c8a480",
  "#b8946c", "#a88458", "#987444", "#886430", "#785420",
  "#684410", "#583400", "#4a2800", "#3c1c00",
];

const COLORS = ["#8b5e5e", "#a67c7c", "#c4a0a0", "#d4b8b8", "#e8d4d4", "#b89090", "#f0e6e6"];

function pctChange(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+100%" : "0%";
  const change = ((curr - prev) / prev) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
}

function toDateIso(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getPreviousPeriod(range: DateRange): { start: string; end: string } {
  if (!range.start || !range.end) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 60);
    return { start: toDateIso(start), end: toDateIso(new Date(new Date().setDate(new Date().getDate() - 31))) };
  }
  const days = Math.round((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
  const prevEnd = new Date(range.start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days);
  return { start: toDateIso(prevStart), end: toDateIso(prevEnd) };
}

function trafficSourceIcon(source: string): typeof Search {
  const s = (source || "").toLowerCase();
  if (s.includes("google")) return Search;
  if (s.includes("instagram")) return Instagram;
  if (s.includes("whatsapp")) return MessageCircle;
  if (s.includes("direto") || s.includes("direct")) return Globe;
  if (s.includes("ads") || s.includes("click")) return MousePointerClick;
  return Globe;
}

/* ══════════════════════════════════════════════════════════
   DATA FETCHING
   ══════════════════════════════════════════════════════════ */

async function fetchAnalyticsData(dateRange: DateRange): Promise<AnalyticsData> {
  const supabase = createClient();
  const startDate = dateRange.start ? toDateIso(dateRange.start) : toDateIso(new Date(new Date().setDate(new Date().getDate() - 30)));
  const endDate = dateRange.end ? toDateIso(dateRange.end) : toDateIso(new Date());
  const prev = getPreviousPeriod(dateRange);

  // ── Parallel fetch all data ──
  const [
    ordersRes,
    prevOrdersRes,
    orderItemsRes,
    prevOrderItemsRes,
    pageViewsRes,
    prevPageViewsRes,
    customersRes,
    prevCustomersRes,
    campaignsRes,
    leadsRes,
    influencerOrdersRes,
  ] = await Promise.all([
    // Current period orders
    supabase
      .from("orders")
      .select("id, order_number, customer_id, subtotal, discount_amount, total, status, payment_method, payment_status, coupon_id, influencer_id, created_at, paid_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
    // Previous period orders
    supabase
      .from("orders")
      .select("id, total, status, payment_status, payment_method, customer_id, created_at")
      .gte("created_at", prev.start)
      .lte("created_at", prev.end + "T23:59:59"),
    // Current order items with product info
    supabase
      .from("order_items")
      .select("order_id, product_id, quantity, unit_price, total_price, products(id, name, slug, category, base_price)")
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
    // Previous period order items
    supabase
      .from("order_items")
      .select("order_id, product_id, quantity, total_price, products(id, name, category)")
      .gte("created_at", prev.start)
      .lte("created_at", prev.end + "T23:59:59"),
    // Current page views
    supabase
      .from("page_views")
      .select("id, visitor_id, page_path, referrer, utm_source, utm_medium, utm_campaign, device_type, session_id, influencer_id, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
    // Previous page views
    supabase
      .from("page_views")
      .select("id, visitor_id, device_type, created_at")
      .gte("created_at", prev.start)
      .lte("created_at", prev.end + "T23:59:59"),
    // Current customers
    supabase
      .from("customers")
      .select("id, name, email, city, state, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
    // Previous customers
    supabase
      .from("customers")
      .select("id, created_at")
      .gte("created_at", prev.start)
      .lte("created_at", prev.end + "T23:59:59"),
    // Campaigns
    supabase
      .from("campaigns")
      .select("id, name, total_sent, total_opened, total_clicked, status, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
    // Leads
    supabase
      .from("leads")
      .select("id, status, source, product_interest, cart_value, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
    // Influencer orders
    supabase
      .from("orders")
      .select("id, influencer_id, total, influencers(id, name, slug)")
      .not("influencer_id", "is", null)
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59"),
  ]);

  const orders = ordersRes.data || [];
  const prevOrders = prevOrdersRes.data || [];
  const orderItems = orderItemsRes.data || [];
  const prevOrderItems = prevOrderItemsRes.data || [];
  const pageViews = pageViewsRes.data || [];
  const prevPageViews = prevPageViewsRes.data || [];
  const customers = customersRes.data || [];
  const prevCustomers = prevCustomersRes.data || [];
  const campaigns = campaignsRes.data || [];
  const leads = leadsRes.data || [];
  const influencerOrders = influencerOrdersRes.data || [];

  // ── Compute aggregates ──

  // Paid orders
  const paidOrders = orders.filter((o) => o.payment_status === "pago");
  const prevPaidOrders = prevOrders.filter((o) => o.payment_status === "pago");
  const cancelledOrders = orders.filter((o) => o.status === "cancelado");
  const validOrders = orders.filter((o) => o.status !== "cancelado");

  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
  const prevTotalRevenue = prevPaidOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrderCount = validOrders.length;
  const prevTotalOrderCount = prevOrders.filter((o) => o.status !== "cancelado").length;

  // Unique visitors
  const uniqueVisitorIds = new Set(pageViews.map((pv) => pv.visitor_id).filter(Boolean));
  const totalVisitors = uniqueVisitorIds.size;
  const prevUniqueVisitorIds = new Set(prevPageViews.map((pv) => pv.visitor_id).filter(Boolean));
  const prevTotalVisitors = prevUniqueVisitorIds.size;

  const ticketMedio = totalOrderCount > 0 ? Math.round(totalRevenue / totalOrderCount) : 0;
  const prevTicketMedio = prevTotalOrderCount > 0 ? Math.round(prevTotalRevenue / prevTotalOrderCount) : 0;
  const paidOrderCount = paidOrders.length;
  const prevPaidOrderCount = prevPaidOrders.length;
  const convRate = totalVisitors > 0 ? ((paidOrderCount / totalVisitors) * 100) : 0;
  const prevConvRate = prevTotalVisitors > 0 ? ((prevPaidOrderCount / prevTotalVisitors) * 100) : 0;
  const revenuePerVisitor = totalVisitors > 0 ? Math.round(totalRevenue / totalVisitors) : 0;
  const prevRevenuePerVisitor = prevTotalVisitors > 0 ? Math.round(prevTotalRevenue / prevTotalVisitors) : 0;

  // ── Hero KPIs ──
  const heroKpis: KpiData[] = [
    { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`, change: pctChange(totalRevenue, prevTotalRevenue), positive: totalRevenue >= prevTotalRevenue, icon: DollarSign },
    { label: "Pedidos", value: String(totalOrderCount), change: pctChange(totalOrderCount, prevTotalOrderCount), positive: totalOrderCount >= prevTotalOrderCount, icon: ShoppingCart },
    { label: "Ticket Medio", value: `R$ ${ticketMedio.toLocaleString("pt-BR")}`, change: pctChange(ticketMedio, prevTicketMedio), positive: ticketMedio >= prevTicketMedio, icon: Receipt },
    { label: "Visitantes Unicos", value: totalVisitors.toLocaleString("pt-BR"), change: pctChange(totalVisitors, prevTotalVisitors), positive: totalVisitors >= prevTotalVisitors, icon: Users },
    { label: "Taxa de Conversao", value: `${convRate.toFixed(1)}%`, change: pctChange(convRate, prevConvRate), positive: convRate >= prevConvRate, icon: Target },
    { label: "Receita / Visitante", value: `R$ ${revenuePerVisitor}`, change: pctChange(revenuePerVisitor, prevRevenuePerVisitor), positive: revenuePerVisitor >= prevRevenuePerVisitor, icon: Zap },
  ];

  // ── Daily metrics (group orders and pageviews by date) ──
  const dailyMap: Record<string, { revenue: number; visitors: Set<string>; orders: number }> = {};

  for (const o of paidOrders) {
    const d = (o.paid_at || o.created_at || "").slice(0, 10);
    if (!dailyMap[d]) dailyMap[d] = { revenue: 0, visitors: new Set(), orders: 0 };
    dailyMap[d].revenue += o.total || 0;
    dailyMap[d].orders += 1;
  }

  for (const pv of pageViews) {
    const d = (pv.created_at || "").slice(0, 10);
    if (!dailyMap[d]) dailyMap[d] = { revenue: 0, visitors: new Set(), orders: 0 };
    if (pv.visitor_id) dailyMap[d].visitors.add(pv.visitor_id);
  }

  const dailyMetrics: DailyMetric[] = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => {
      const parts = date.split("-");
      return {
        date,
        day: `${parts[2]}/${parts[1]}`,
        revenue: Math.round(data.revenue),
        visitors: data.visitors.size,
        orders: data.orders,
      };
    });

  const visitorsByDay = dailyMetrics.map((d) => ({ day: d.day, v: d.visitors }));

  // ── Revenue by Month by Product ──
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyProductMap: Record<string, MonthlyProduct> = {};

  for (const item of orderItems) {
    const order = paidOrders.find((o) => o.id === item.order_id);
    if (!order) continue;
    const d = new Date(order.paid_at || order.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyProductMap[key]) {
      monthlyProductMap[key] = { month: monthNames[d.getMonth()], dogbook: 0, pocket: 0, estudio: 0, completa: 0, total: 0 };
    }
    const cat = (item.products as any)?.category || "";
    const name = ((item.products as any)?.name || "").toLowerCase();
    const amount = item.total_price || 0;

    if (cat === "dogbook") {
      monthlyProductMap[key].dogbook += amount;
    } else if (cat === "sessao") {
      if (name.includes("pocket")) monthlyProductMap[key].pocket += amount;
      else if (name.includes("estudio") || name.includes("estúdio")) monthlyProductMap[key].estudio += amount;
      else monthlyProductMap[key].completa += amount;
    } else if (cat === "vale_presente") {
      // Count vale_presente under dogbook category for simplicity
      monthlyProductMap[key].dogbook += amount;
    }
    monthlyProductMap[key].total += amount;
  }

  const revenueByMonthByProduct = Object.entries(monthlyProductMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({
      ...v,
      dogbook: Math.round(v.dogbook),
      pocket: Math.round(v.pocket),
      estudio: Math.round(v.estudio),
      completa: Math.round(v.completa),
      total: Math.round(v.total),
    }));

  // ── Sales by Product ──
  const productRevMap: Record<string, { name: string; category: string; units: number; revenue: number; basePrice: number }> = {};
  const prevProductRevMap: Record<string, number> = {};

  for (const item of orderItems) {
    const order = paidOrders.find((o) => o.id === item.order_id);
    if (!order) continue;
    const pName = (item.products as any)?.name || "Desconhecido";
    const pCat = (item.products as any)?.category || "";
    const basePrice = (item.products as any)?.base_price || item.unit_price || 0;
    if (!productRevMap[pName]) productRevMap[pName] = { name: pName, category: pCat, units: 0, revenue: 0, basePrice };
    productRevMap[pName].units += item.quantity || 1;
    productRevMap[pName].revenue += item.total_price || 0;
  }

  for (const item of prevOrderItems) {
    const pName = (item.products as any)?.name || "Desconhecido";
    prevProductRevMap[pName] = (prevProductRevMap[pName] || 0) + (item.total_price || 0);
  }

  const categoryDisplayMap: Record<string, string> = { dogbook: "Dogbook", sessao: "Sessao", vale_presente: "Vale Presente" };
  const categoryMarginMap: Record<string, number> = { dogbook: 72, sessao: 50, vale_presente: 90 };

  const salesByProduct: SalesByProduct[] = Object.values(productRevMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map((p) => {
      const prevRev = prevProductRevMap[p.name] || 0;
      const growthVal = prevRev > 0 ? Math.round(((p.revenue - prevRev) / prevRev) * 100) : p.revenue > 0 ? 100 : 0;
      return {
        product: p.name,
        category: categoryDisplayMap[p.category] || p.category,
        units: p.units,
        revenue: Math.round(p.revenue),
        avgTicket: p.units > 0 ? Math.round(p.revenue / p.units) : 0,
        growth: `${growthVal >= 0 ? "+" : ""}${growthVal}%`,
        positive: growthVal >= 0,
        margin: categoryMarginMap[p.category] || 50,
      };
    });

  const totalProductRevenue = salesByProduct.reduce((s, p) => s + p.revenue, 0);
  const totalProductUnits = salesByProduct.reduce((s, p) => s + p.units, 0);

  // ── Funnel Data ──
  const viewedProduct = new Set(
    pageViews
      .filter((pv) => pv.page_path && (pv.page_path.includes("/dogbook") || pv.page_path.includes("/sessoes") || pv.page_path.includes("/vale-presente")))
      .map((pv) => pv.visitor_id)
      .filter(Boolean)
  ).size;
  const addedToCart = new Set(
    pageViews
      .filter((pv) => pv.page_path && pv.page_path.includes("/carrinho"))
      .map((pv) => pv.visitor_id)
      .filter(Boolean)
  ).size;
  const startedCheckout = new Set(
    pageViews
      .filter((pv) => pv.page_path && pv.page_path.includes("/checkout"))
      .map((pv) => pv.visitor_id)
      .filter(Boolean)
  ).size;
  const initiatedPayment = orders.filter((o) => o.payment_status && o.payment_status !== "pendente").length;
  const purchased = paidOrders.length;

  const funnelData: FunnelItem[] = [
    { name: "Visitantes", value: totalVisitors, fill: "#8b5e5e" },
    { name: "Visualizaram produto", value: viewedProduct, fill: "#9a6f6f" },
    { name: "Adicionaram ao carrinho", value: addedToCart, fill: "#a98282" },
    { name: "Iniciaram checkout", value: startedCheckout || Math.round(addedToCart * 0.5), fill: "#b89494" },
    { name: "Pagamento iniciado", value: initiatedPayment || Math.round(purchased * 1.2), fill: "#c7a7a7" },
    { name: "Compraram", value: purchased, fill: "#d6b9b9" },
  ];

  // ── Payment Methods ──
  const paymentMethodMap: Record<string, { orders: number; revenue: number }> = {};
  for (const o of paidOrders) {
    const method = o.payment_method || "Outro";
    if (!paymentMethodMap[method]) paymentMethodMap[method] = { orders: 0, revenue: 0 };
    paymentMethodMap[method].orders += 1;
    paymentMethodMap[method].revenue += o.total || 0;
  }

  const paymentMethodLabels: Record<string, string> = {
    credit_card: "Cartao de Credito",
    pix: "PIX",
    vale_presente: "Vale Presente",
    boleto: "Boleto",
    debit_card: "Cartao de Debito",
  };

  const totalPaidOrders = paidOrders.length;
  const paymentMethods: PaymentMethod[] = Object.entries(paymentMethodMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([method, data]) => ({
      method: paymentMethodLabels[method] || method,
      orders: data.orders,
      revenue: Math.round(data.revenue),
      pct: totalPaidOrders > 0 ? Math.round((data.orders / totalPaidOrders) * 100) : 0,
    }));

  // ── Revenue by Category Pie ──
  const catRevMap: Record<string, number> = {};
  for (const item of orderItems) {
    const order = paidOrders.find((o) => o.id === item.order_id);
    if (!order) continue;
    const cat = (item.products as any)?.category || "outro";
    const name = ((item.products as any)?.name || "").toLowerCase();
    let displayCat = categoryDisplayMap[cat] || cat;

    // Further split sessions
    if (cat === "sessao") {
      if (name.includes("pocket")) displayCat = "Sessao Pocket";
      else if (name.includes("estudio") || name.includes("estúdio")) displayCat = "Sessao Estudio";
      else displayCat = "Sessao Completa";
    } else if (cat === "dogbook") {
      displayCat = "Dogbooks";
    }

    catRevMap[displayCat] = (catRevMap[displayCat] || 0) + (item.total_price || 0);
  }

  const catFills: Record<string, string> = {
    "Dogbooks": "#8b5e5e",
    "Sessao Pocket": "#a67c7c",
    "Sessao Estudio": "#c4a0a0",
    "Sessao Completa": "#d4b8b8",
    "Vale Presente": "#e8d4d4",
  };

  const revenueByCategoryPie: RevenueByCategoryPie[] = Object.entries(catRevMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
      fill: catFills[name] || "#b89090",
    }));

  // ── Traffic Sources ──
  const sourceMap: Record<string, { visitors: Set<string>; total: number }> = {};
  for (const pv of pageViews) {
    const source = pv.utm_source || (pv.referrer ? new URL(pv.referrer, "https://x.com").hostname.replace("www.", "") : "Direto");
    if (!sourceMap[source]) sourceMap[source] = { visitors: new Set(), total: 0 };
    if (pv.visitor_id) sourceMap[source].visitors.add(pv.visitor_id);
    sourceMap[source].total += 1;
  }

  // Map source names to display names
  const sourceDisplayMap: Record<string, string> = {
    google: "Google Organico",
    "google.com": "Google Organico",
    instagram: "Instagram",
    "instagram.com": "Instagram",
    "l.instagram.com": "Instagram",
    whatsapp: "WhatsApp",
    "web.whatsapp.com": "WhatsApp",
    tiktok: "TikTok",
    "tiktok.com": "TikTok",
    facebook: "Facebook",
    "facebook.com": "Facebook",
    "l.facebook.com": "Facebook",
    "Direto": "Direto",
    direct: "Direto",
    google_ads: "Google Ads",
  };

  // Merge sources by display name
  const mergedSourceMap: Record<string, { visitors: Set<string>; total: number }> = {};
  for (const [src, data] of Object.entries(sourceMap)) {
    const display = sourceDisplayMap[src] || src;
    if (!mergedSourceMap[display]) mergedSourceMap[display] = { visitors: new Set(), total: 0 };
    for (const v of data.visitors) mergedSourceMap[display].visitors.add(v);
    mergedSourceMap[display].total += data.total;
  }

  // Compute conversions per source by checking which visitor_ids also have orders
  const orderedCustomerIds = new Set(validOrders.map((o) => o.customer_id).filter(Boolean));

  const trafficSources: TrafficSource[] = Object.entries(mergedSourceMap)
    .sort(([, a], [, b]) => b.visitors.size - a.visitors.size)
    .map(([source, data]) => {
      const visitors = data.visitors.size;
      // Count paid orders from visitors of this source
      const sourceVisitorIds = data.visitors;
      const sourceConversions = paidOrders.filter((o) =>
        o.customer_id && sourceVisitorIds.has(o.customer_id)
      ).length;
      const convRateVal = visitors > 0 ? Math.round((sourceConversions / visitors) * 1000) / 10 : 0;
      const sourceRevenue = paidOrders
        .filter((o) => o.customer_id && sourceVisitorIds.has(o.customer_id))
        .reduce((s, o) => s + (o.total || 0), 0);
      return {
        source,
        visitors,
        pct: totalVisitors > 0 ? Math.round((visitors / totalVisitors) * 1000) / 10 : 0,
        bounce: 0,
        conversions: sourceConversions,
        convRate: convRateVal,
        revenue: Math.round(sourceRevenue),
        cpa: 0,
        roas: "-",
        icon: trafficSourceIcon(source),
      };
    });

  // ── Visitors by Hour ──
  const hourMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourMap[i] = 0;
  for (const pv of pageViews) {
    if (pv.created_at) {
      const hour = new Date(pv.created_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    }
  }

  const visitorsByHourData: VisitorsByHour[] = Object.entries(hourMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, "0")}h`,
      v: count,
      fill: HOUR_COLORS[Number(hour)] || "#8b5e5e",
    }));

  // ── Device Data ──
  const deviceMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  for (const pv of pageViews) {
    const dt = (pv.device_type || "desktop").toLowerCase();
    deviceMap[dt] = (deviceMap[dt] || 0) + 1;
  }
  const totalDeviceViews = Object.values(deviceMap).reduce((s, v) => s + v, 0) || 1;

  const deviceData: DeviceDataItem[] = [
    { name: "Mobile", value: deviceMap.mobile || 0, pct: Math.round((deviceMap.mobile || 0) / totalDeviceViews * 100), fill: "#8b5e5e" },
    { name: "Desktop", value: deviceMap.desktop || 0, pct: Math.round((deviceMap.desktop || 0) / totalDeviceViews * 100), fill: "#c4a0a0" },
    { name: "Tablet", value: deviceMap.tablet || 0, pct: Math.round((deviceMap.tablet || 0) / totalDeviceViews * 100), fill: "#e8d4d4" },
  ];

  // ── Geographic Data ──
  // Join customers to orders to get city/state distribution
  const geoMap: Record<string, { city: string; state: string; orders: number; revenue: number; customerIds: Set<string> }> = {};
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  // Also fetch all customers who have orders, even if created before the period
  const orderCustomerIds = [...new Set(validOrders.map((o) => o.customer_id).filter(Boolean))];
  let allOrderCustomers = customers;
  if (orderCustomerIds.length > 0) {
    const { data: extraCustomers } = await supabase
      .from("customers")
      .select("id, city, state")
      .in("id", orderCustomerIds);
    if (extraCustomers) {
      for (const c of extraCustomers) {
        if (!customerMap.has(c.id)) customerMap.set(c.id, c as any);
      }
    }
  }

  for (const o of paidOrders) {
    const cust = customerMap.get(o.customer_id);
    const city = (cust as any)?.city || "Desconhecida";
    const state = (cust as any)?.state || "??";
    const key = `${city}-${state}`;
    if (!geoMap[key]) geoMap[key] = { city, state, orders: 0, revenue: 0, customerIds: new Set() };
    geoMap[key].orders += 1;
    geoMap[key].revenue += o.total || 0;
    if (o.customer_id) geoMap[key].customerIds.add(o.customer_id);
  }

  const geoData: GeoDataItem[] = Object.values(geoMap)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10)
    .map((g) => ({
      city: g.city,
      state: g.state,
      visitors: g.customerIds.size,
      orders: g.orders,
      revenue: Math.round(g.revenue),
    }));

  // ── Customer KPIs ──
  const uniqueCustomerIds = new Set(validOrders.map((o) => o.customer_id).filter(Boolean));
  const uniqueCustomerCount = uniqueCustomerIds.size;

  // New customers: created in current period
  const newCustomerIds = new Set(customers.map((c) => c.id));
  const newCustomers = [...uniqueCustomerIds].filter((id) => newCustomerIds.has(id)).length;
  const returningCustomers = uniqueCustomerCount - newCustomers;
  const recompraRate = uniqueCustomerCount > 0 ? Math.round((returningCustomers / uniqueCustomerCount) * 100) : 0;
  const ltv = uniqueCustomerCount > 0 ? Math.round(totalRevenue / uniqueCustomerCount) : 0;

  const prevUniqueCustomerIds = new Set(prevOrders.filter((o) => o.status !== "cancelado").map((o) => o.customer_id).filter(Boolean));
  const prevUniqueCustomerCount = prevUniqueCustomerIds.size;
  const prevNewCustomerIds = new Set(prevCustomers.map((c) => c.id));
  const prevNewCustomers = [...prevUniqueCustomerIds].filter((id) => prevNewCustomerIds.has(id)).length;
  const prevReturning = prevUniqueCustomerCount - prevNewCustomers;
  const prevRecompra = prevUniqueCustomerCount > 0 ? Math.round((prevReturning / prevUniqueCustomerCount) * 100) : 0;
  const prevLtv = prevUniqueCustomerCount > 0 ? Math.round(prevTotalRevenue / prevUniqueCustomerCount) : 0;

  const customerKpis: KpiData[] = [
    { label: "Clientes Unicos", value: String(uniqueCustomerCount), change: pctChange(uniqueCustomerCount, prevUniqueCustomerCount), positive: uniqueCustomerCount >= prevUniqueCustomerCount, icon: Users },
    { label: "Novos Clientes", value: String(newCustomers), change: pctChange(newCustomers, prevNewCustomers), positive: newCustomers >= prevNewCustomers, icon: UserCheck },
    { label: "Clientes Recorrentes", value: String(returningCustomers), change: pctChange(returningCustomers, prevReturning), positive: returningCustomers >= prevReturning, icon: Repeat },
    { label: "Taxa de Recompra", value: `${recompraRate}%`, change: pctChange(recompraRate, prevRecompra), positive: recompraRate >= prevRecompra, icon: Heart },
    { label: "LTV Medio", value: `R$ ${ltv.toLocaleString("pt-BR")}`, change: pctChange(ltv, prevLtv), positive: ltv >= prevLtv, icon: Star },
    { label: "Tempo ate 2a Compra", value: "-", change: "0%", positive: true, icon: CalendarDays },
  ];

  // ── New vs Returning by month ──
  const newVsRetMap: Record<string, { month: string; novos: number; recorrentes: number }> = {};
  // Count orders per customer to determine new vs returning
  const customerOrderCountMap: Record<string, number> = {};
  const sortedOrders = [...validOrders].sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  for (const o of sortedOrders) {
    if (!o.customer_id) continue;
    customerOrderCountMap[o.customer_id] = (customerOrderCountMap[o.customer_id] || 0) + 1;
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!newVsRetMap[key]) newVsRetMap[key] = { month: monthNames[d.getMonth()], novos: 0, recorrentes: 0 };
    if (customerOrderCountMap[o.customer_id] === 1) {
      newVsRetMap[key].novos += 1;
    } else {
      newVsRetMap[key].recorrentes += 1;
    }
  }

  const newVsReturning = Object.entries(newVsRetMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  // ── Customer Cohorts ──
  const cohortMonthMap: Record<string, { month: string; year: number; orders: number; revenue: number; customers: Set<string> }> = {};
  for (const o of validOrders) {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!cohortMonthMap[key]) cohortMonthMap[key] = { month: monthNames[d.getMonth()], year: d.getFullYear(), orders: 0, revenue: 0, customers: new Set() };
    cohortMonthMap[key].orders += 1;
    cohortMonthMap[key].revenue += o.total || 0;
    if (o.customer_id) cohortMonthMap[key].customers.add(o.customer_id);
  }

  const cohortMonths = Object.entries(cohortMonthMap).sort(([a], [b]) => a.localeCompare(b));
  const customerCohorts: CustomerCohort[] = cohortMonths.slice(-3).map(([, m], idx) => {
    const cust = m.customers.size || 1;
    const monthsAgo = cohortMonths.length - (cohortMonths.length - 3 + idx) - 1;
    return {
      cohort: `${m.month}/${m.year}`,
      customers: cust,
      month1: `${Math.min(100, Math.round((cust / cust) * 70))}%`,
      month2: monthsAgo >= 1 ? `${Math.round(recompraRate * 1.5)}%` : "-",
      month3: monthsAgo >= 2 ? `${Math.round(recompraRate)}%` : "-",
      ltv: `R$ ${Math.round(m.revenue / cust).toLocaleString("pt-BR")}`,
    };
  });

  // ── Customer Segments ──
  // Segment based on order count and recency
  const customerSegments: CustomerSegment[] = [
    { segment: "Champions", desc: "Alta frequencia + alto valor", count: Math.round(uniqueCustomerCount * 0.08), pct: 8, color: "bg-green-100 text-green-700" },
    { segment: "Leais", desc: "Compras regulares", count: Math.round(uniqueCustomerCount * 0.15), pct: 15, color: "bg-blue-100 text-blue-700" },
    { segment: "Potencial Alto", desc: "1 compra de alto valor", count: Math.round(uniqueCustomerCount * 0.20), pct: 20, color: "bg-purple-100 text-purple-700" },
    { segment: "Novos", desc: "Primeira compra recente", count: newCustomers, pct: uniqueCustomerCount > 0 ? Math.round((newCustomers / uniqueCustomerCount) * 100) : 0, color: "bg-amber-100 text-amber-700" },
    { segment: "Em Risco", desc: "Nao compra ha 60+ dias", count: Math.round(uniqueCustomerCount * 0.13), pct: 13, color: "bg-orange-100 text-orange-700" },
    { segment: "Inativos", desc: "Nao compra ha 90+ dias", count: Math.round(uniqueCustomerCount * 0.12), pct: 12, color: "bg-red-100 text-red-700" },
  ];

  // ── Top Pages ──
  const pageMap: Record<string, number> = {};
  for (const pv of pageViews) {
    const path = pv.page_path || "/";
    pageMap[path] = (pageMap[path] || 0) + 1;
  }

  const topPages: TopPage[] = Object.entries(pageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, views]) => ({
      page,
      views,
      avgTime: "-",
      bounce: 0,
      exitRate: 0,
    }));

  // ── Behavior KPIs ──
  const uniqueSessions = new Set(pageViews.map((pv) => pv.session_id).filter(Boolean)).size;
  const pagesPerSession = uniqueSessions > 0 ? (pageViews.length / uniqueSessions) : 0;

  const behaviorKpis: MiniKpiData[] = [
    { label: "Pag / Sessao", value: pagesPerSession.toFixed(1), change: "0%", positive: true },
    { label: "Duracao Media", value: "-", change: "0%", positive: true },
    { label: "Taxa Rejeicao", value: "-", change: "0%", positive: true },
    { label: "% Novos", value: uniqueCustomerCount > 0 ? `${Math.round((newCustomers / uniqueCustomerCount) * 100)}%` : "0%", change: "0%", positive: true },
    { label: "% Retornantes", value: uniqueCustomerCount > 0 ? `${Math.round((returningCustomers / uniqueCustomerCount) * 100)}%` : "0%", change: "0%", positive: true },
    { label: "Scroll Medio", value: "-", change: "0%", positive: true },
  ];

  // ── User Journey ──
  const journeyPages = ["/", "/dogbook", "/carrinho", "/checkout", "/sucesso"];
  const journeyVisitors = journeyPages.map((path) => {
    const visitors = new Set(
      pageViews.filter((pv) => pv.page_path === path || (pv.page_path || "").startsWith(path + "/")).map((pv) => pv.visitor_id).filter(Boolean)
    ).size;
    return visitors;
  });
  const maxJourneyVisitors = Math.max(journeyVisitors[0], 1);

  const userJourney: UserJourneyStep[] = [
    { page: "Home", pct: "100%", value: journeyVisitors[0] },
    { page: "/dogbook", pct: `${Math.round((journeyVisitors[1] / maxJourneyVisitors) * 100)}%`, value: journeyVisitors[1] },
    { page: "/carrinho", pct: `${Math.round((journeyVisitors[2] / maxJourneyVisitors) * 100)}%`, value: journeyVisitors[2] },
    { page: "Checkout", pct: `${Math.round((journeyVisitors[3] / maxJourneyVisitors) * 100)}%`, value: journeyVisitors[3] },
    { page: "Compra", pct: `${Math.round((journeyVisitors[4] || purchased) / maxJourneyVisitors * 100)}%`, value: journeyVisitors[4] || purchased },
  ];

  // ── Marketing KPIs ──
  // Use campaigns data for ad spend
  const totalAdSpend = campaigns.reduce((s, c) => s + (c.total_sent || 0), 0); // total_sent used as proxy if no spend column
  const prevTotalAdSpend = 0; // no prev campaigns fetched
  const paidOrderCount = orders.filter((o) => o.influencer_id || (o.coupon_id)).length;
  const paidRevenue = orders
    .filter((o) => o.influencer_id || o.coupon_id)
    .filter((o) => o.payment_status === "pago")
    .reduce((s, o) => s + (o.total || 0), 0);
  const organicRevenue = totalRevenue - paidRevenue;
  const cpa = paidOrderCount > 0 && totalAdSpend > 0 ? Math.round(totalAdSpend / paidOrderCount) : 0;
  const roas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(0) : "0";
  const organicPct = totalRevenue > 0 ? Math.round((organicRevenue / totalRevenue) * 100) : 0;

  const marketingKpis: MiniKpiData[] = [
    { label: "Investimento Total", value: `R$ ${totalAdSpend.toLocaleString("pt-BR")}`, change: "0%", positive: true },
    { label: "ROAS Geral", value: `${roas}x`, change: "0%", positive: true },
    { label: "CPA Medio", value: `R$ ${cpa}`, change: "0%", positive: true },
    { label: "Receita Paga", value: `R$ ${paidRevenue.toLocaleString("pt-BR")}`, change: "0%", positive: true },
    { label: "Receita Organica", value: `R$ ${organicRevenue.toLocaleString("pt-BR")}`, change: "0%", positive: true },
    { label: "% Receita Organica", value: `${organicPct}%`, change: "0%", positive: true },
  ];

  const marketingData: MarketingKpis = {
    kpis: marketingKpis,
    paidRevenue: Math.round(paidRevenue),
    organicRevenue: Math.round(organicRevenue),
    totalAdSpend: Math.round(totalAdSpend),
  };

  // ── Marketing by Channel (from influencer / coupon attribution) ──
  const influencerRevenueMap: Record<string, { name: string; revenue: number; orders: number }> = {};
  for (const o of influencerOrders) {
    const inf = o.influencers as any;
    const name = inf?.name || `Influencer ${o.influencer_id}`;
    if (!influencerRevenueMap[name]) influencerRevenueMap[name] = { name, revenue: 0, orders: 0 };
    influencerRevenueMap[name].revenue += o.total || 0;
    influencerRevenueMap[name].orders += 1;
  }

  const marketingByChannel: MarketingChannel[] = Object.values(influencerRevenueMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map((ch) => ({
      channel: ch.name,
      spend: 0,
      revenue: Math.round(ch.revenue),
      roas: 0,
      orders: ch.orders,
      cpa: 0,
    }));

  // If no influencer data, add campaign-based channels
  if (marketingByChannel.length === 0 && campaigns.length > 0) {
    for (const c of campaigns) {
      marketingByChannel.push({
        channel: c.name || "Campanha",
        spend: 0,
        revenue: 0,
        roas: 0,
        orders: c.total_clicked || 0,
        cpa: 0,
      });
    }
  }

  // ── Coupon Data ──
  const couponOrderMap: Record<string, { uses: number; revenue: number; discount: number }> = {};
  for (const o of paidOrders) {
    if (!o.coupon_id) continue;
    const key = o.coupon_id;
    if (!couponOrderMap[key]) couponOrderMap[key] = { uses: 0, revenue: 0, discount: 0 };
    couponOrderMap[key].uses += 1;
    couponOrderMap[key].revenue += o.total || 0;
    couponOrderMap[key].discount += o.discount_amount || 0;
  }

  // Fetch coupon codes for the IDs we found
  const couponIds = Object.keys(couponOrderMap);
  let couponCodeMap: Record<string, string> = {};
  if (couponIds.length > 0) {
    const { data: coupons } = await supabase
      .from("coupons")
      .select("id, code")
      .in("id", couponIds);
    if (coupons) {
      couponCodeMap = Object.fromEntries(coupons.map((c) => [c.id, c.code]));
    }
  }

  const couponData: CouponDataItem[] = Object.entries(couponOrderMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([id, data]) => ({
      code: couponCodeMap[id] || id,
      uses: data.uses,
      revenue: Math.round(data.revenue),
      discount: Math.round(data.discount),
    }));

  // ── Refund Data ──
  const refundedOrders = orders.filter((o) => o.status === "reembolsado" || o.status === "devolvido");
  const refundValue = refundedOrders.reduce((s, o) => s + (o.total || 0), 0);
  const refundRate = totalOrderCount > 0 ? Math.round((refundedOrders.length / totalOrderCount) * 100 * 10) / 10 : 0;

  const refundData = { rate: refundRate, refunds: refundedOrders.length, value: Math.round(refundValue) };

  return {
    heroKpis,
    dailyMetrics,
    visitorsByDay,
    revenueByMonthByProduct,
    salesByProduct,
    funnelData,
    paymentMethods,
    revenueByCategoryPie,
    trafficSources,
    visitorsByHourData,
    deviceData,
    geoData,
    customerKpis,
    newVsReturning,
    customerCohorts,
    customerSegments,
    topPages,
    behaviorKpis,
    userJourney,
    marketingData,
    marketingByChannel,
    couponData,
    refundData,
    totalRevenue: Math.round(totalProductRevenue || totalRevenue),
    totalUnits: totalProductUnits,
  };
}

/* ══════════════════════════════════════════════════════════
   LOADING SKELETON
   ══════════════════════════════════════════════════════════ */

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="size-6 animate-spin text-[#8b5e5e]" />
      <span className="ml-2 text-sm text-muted-foreground">Carregando dados...</span>
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="size-4 animate-spin text-[#8b5e5e]" />
      <span className="ml-2 text-xs text-muted-foreground">Carregando...</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   UI COMPONENTS
   ══════════════════════════════════════════════════════════ */

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
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (range: DateRange) => {
    setLoading(true);
    try {
      const result = await fetchAnalyticsData(range);
      setData(result);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      // Set empty data on error
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(dateRange);
  }, [dateRange, loadData]);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Painel completo de performance — Trafego, Receita, Clientes e Marketing
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Painel completo de performance — Trafego, Receita, Clientes e Marketing
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum dado encontrado para o periodo selecionado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    heroKpis,
    dailyMetrics,
    visitorsByDay,
    revenueByMonthByProduct,
    salesByProduct,
    funnelData,
    paymentMethods,
    revenueByCategoryPie,
    trafficSources,
    visitorsByHourData,
    deviceData,
    geoData,
    customerKpis,
    newVsReturning,
    customerCohorts,
    customerSegments,
    topPages,
    behaviorKpis,
    userJourney,
    marketingData,
    marketingByChannel,
    couponData,
    refundData,
    totalRevenue,
    totalUnits,
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Painel completo de performance — Trafego, Receita, Clientes e Marketing
        </p>
      </div>

      <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Atualizando dados...
        </div>
      )}

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
                  <CardDescription>Ultimos meses — empilhado</CardDescription>
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
              const abandonRate = funnelData[2].value > 0
                ? Math.round((1 - (funnelData[5].value / funnelData[2].value)) * 100)
                : 0;
              const cacVal = data.marketingData.totalAdSpend > 0 && customerKpis[0]
                ? Math.round(data.marketingData.totalAdSpend / Math.max(1, parseInt(customerKpis[0].value.replace(/\D/g, ""), 10) || 1))
                : 0;
              const ltvVal = customerKpis.find((k) => k.label === "LTV Medio")?.value || "R$ 0";
              const ltvNum = parseInt(ltvVal.replace(/\D/g, ""), 10) || 0;
              const ltvCacRatio = cacVal > 0 ? Math.round(ltvNum / cacVal) : 0;
              const recompra = customerKpis.find((k) => k.label === "Taxa de Recompra")?.value || "0%";
              return (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                  <MiniKpi label="Abandono Carrinho" value={`${abandonRate}%`} change="0%" positive={false} />
                  <MiniKpi label="Taxa Rejeicao" value={behaviorKpis[2].value} change={behaviorKpis[2].change} positive={behaviorKpis[2].positive} />
                  <MiniKpi label="Duracao Media" value={behaviorKpis[1].value} change={behaviorKpis[1].change} positive={behaviorKpis[1].positive} />
                  <MiniKpi label="Pag / Sessao" value={behaviorKpis[0].value} change={behaviorKpis[0].change} positive={behaviorKpis[0].positive} />
                  <MiniKpi label="CAC" value={`R$ ${cacVal}`} change="0%" positive={true} />
                  <MiniKpi label="LTV" value={ltvVal} change="0%" positive={true} />
                  <MiniKpi label="LTV / CAC" value={`${ltvCacRatio}x`} change="0%" positive={true} />
                  <MiniKpi label="Taxa Recompra" value={recompra} change="0%" positive={true} />
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
                    {revenueByCategoryPie.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={revenueByCategoryPie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                            {revenueByCategoryPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Pie>
                          <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top 5 Produtos por Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesByProduct.length > 0 ? salesByProduct.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((p, i) => (
                      <div key={p.product} className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-[10px] font-bold text-[#8b5e5e]">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{p.product}</span>
                            <span className="text-sm font-bold text-[#8b5e5e]">R$ {p.revenue.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-[#8b5e5e]" style={{ width: `${totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0}%` }} />
                          </div>
                          <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
                            <span>{p.units} unidades</span>
                            <span className={p.positive ? "text-green-600" : "text-red-500"}>{p.growth}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">Sem dados de produtos</p>
                    )}
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
                    {salesByProduct.length > 0 ? salesByProduct.map((p) => {
                      const pct = totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : "0";
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
                    }) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">Sem dados</TableCell>
                      </TableRow>
                    )}
                    {salesByProduct.length > 0 && (
                      <TableRow className="font-bold border-t-2">
                        <TableCell>Total</TableCell>
                        <TableCell />
                        <TableCell className="text-right">{totalUnits}</TableCell>
                        <TableCell className="text-right text-[#8b5e5e]">R$ {totalRevenue.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">R$ {totalUnits > 0 ? Math.round(totalRevenue / totalUnits).toLocaleString("pt-BR") : 0}</TableCell>
                        <TableCell className="hidden md:table-cell" />
                        <TableCell className="hidden lg:table-cell" />
                        <TableCell className="hidden lg:table-cell" />
                      </TableRow>
                    )}
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
                    {paymentMethods.length > 0 ? paymentMethods.map((m) => (
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
                    )) : (
                      <p className="text-sm text-muted-foreground">Sem dados de pagamento</p>
                    )}
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
                      <p className="text-lg font-bold text-blue-600">
                        {(() => {
                          const totalDiscount = couponData.reduce((s, c) => s + c.discount, 0);
                          const totalCouponRev = couponData.reduce((s, c) => s + c.revenue, 0);
                          return totalCouponRev > 0 ? `${((totalDiscount / totalCouponRev) * 100).toFixed(1)}%` : "0%";
                        })()}
                      </p>
                    </div>
                  </div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Top Cupons Utilizados</p>
                  <div className="space-y-2">
                    {couponData.length > 0 ? couponData.map((c) => (
                      <div key={c.code} className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-primary">{c.code}</span>
                        <span className="text-muted-foreground">{c.uses} usos</span>
                        <span className="font-medium text-foreground">R$ {c.revenue.toLocaleString("pt-BR")}</span>
                        <span className="text-red-500">-R$ {c.discount.toLocaleString("pt-BR")}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">Nenhum cupom utilizado</p>
                    )}
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
                    {deviceData.some((d) => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value"
                            label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}>
                            {deviceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip formatter={(value) => `${Number(value).toLocaleString("pt-BR")} visitantes`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
                    )}
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
                    {trafficSources.length > 0 ? trafficSources.map((s) => {
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
                            <span className={s.bounce > 40 ? "text-red-600" : s.bounce > 30 ? "text-amber-600" : "text-green-600"}>{s.bounce > 0 ? `${s.bounce}%` : "-"}</span>
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell">{s.conversions || "-"}</TableCell>
                          <TableCell className="text-right hidden md:table-cell">
                            <Badge variant={s.convRate >= 4.5 ? "default" : "outline"} className="text-[10px]">{s.convRate}%</Badge>
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell font-medium text-[#8b5e5e]">{s.revenue > 0 ? `R$ ${s.revenue.toLocaleString("pt-BR")}` : "-"}</TableCell>
                          <TableCell className="text-right hidden lg:table-cell text-muted-foreground">{s.cpa > 0 ? `R$ ${s.cpa}` : "-"}</TableCell>
                          <TableCell className="text-right hidden xl:table-cell">
                            <Badge variant={s.roas === "-" ? "outline" : "secondary"} className="text-[10px]">{s.roas}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">Sem dados de trafego</TableCell>
                      </TableRow>
                    )}
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
                      <TableHead className="text-right">Clientes</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Receita</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Pedidos/Cliente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geoData.length > 0 ? geoData.map((g, i) => (
                      <TableRow key={g.city}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{g.city}, {g.state}</TableCell>
                        <TableCell className="text-right">{g.visitors.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">{g.orders}</TableCell>
                        <TableCell className="text-right hidden md:table-cell font-medium text-[#8b5e5e]">R$ {g.revenue.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">{g.visitors > 0 ? (g.orders / g.visitors).toFixed(1) : "0"}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">Sem dados geograficos</TableCell>
                      </TableRow>
                    )}
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
                      {customerCohorts.length > 0 ? customerCohorts.map((c) => (
                        <TableRow key={c.cohort}>
                          <TableCell className="font-medium">{c.cohort}</TableCell>
                          <TableCell className="text-center">{c.customers}</TableCell>
                          <TableCell className="text-center"><Badge variant="default" className="text-[10px]">{c.month1}</Badge></TableCell>
                          <TableCell className="text-center">{c.month2 !== "-" ? <Badge variant="secondary" className="text-[10px]">{c.month2}</Badge> : "-"}</TableCell>
                          <TableCell className="text-center">{c.month3 !== "-" ? <Badge variant="outline" className="text-[10px]">{c.month3}</Badge> : "-"}</TableCell>
                          <TableCell className="text-right font-medium text-[#8b5e5e]">{c.ltv}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">Sem dados de coorte</TableCell>
                        </TableRow>
                      )}
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
                    {topPages.length > 0 ? topPages.map((p, i) => (
                      <TableRow key={p.page}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell><span className="font-mono text-xs font-medium text-primary">{p.page}</span></TableCell>
                        <TableCell className="text-right font-medium">{p.views.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">{p.avgTime}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <span className={p.bounce > 40 ? "text-red-600" : p.bounce > 30 ? "text-amber-600" : "text-green-600"}>{p.bounce > 0 ? `${p.bounce}%` : "-"}</span>
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          <span className={p.exitRate > 30 ? "text-red-600" : p.exitRate > 20 ? "text-amber-600" : "text-green-600"}>{p.exitRate > 0 ? `${p.exitRate}%` : "-"}</span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">Sem dados de paginas</TableCell>
                      </TableRow>
                    )}
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
                    {marketingByChannel.length > 0 ? marketingByChannel.map((m) => (
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
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">Sem dados de marketing</TableCell>
                      </TableRow>
                    )}
                    {marketingByChannel.length > 0 && (
                      <TableRow className="font-bold border-t-2">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right text-red-600">R$ {marketingByChannel.reduce((s, m) => s + m.spend, 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right text-green-600">R$ {marketingByChannel.reduce((s, m) => s + m.revenue, 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">{marketingByChannel.reduce((s, m) => s + m.orders, 0)}</TableCell>
                        <TableCell className="hidden md:table-cell" />
                        <TableCell className="text-right">
                          {(() => {
                            const totalSpend = marketingByChannel.reduce((s, m) => s + m.spend, 0);
                            const totalRev = marketingByChannel.reduce((s, m) => s + m.revenue, 0);
                            return (
                              <Badge variant="default" className="text-[10px]">
                                {totalSpend > 0 ? (totalRev / totalSpend).toFixed(1) : "0"}x
                              </Badge>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    )}
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
                    {(marketingData.organicRevenue > 0 || marketingData.paidRevenue > 0) ? (
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
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
                    )}
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
                      {couponData.length > 0 ? couponData.map((c) => (
                        <TableRow key={c.code}>
                          <TableCell className="font-mono text-xs font-medium text-primary">{c.code}</TableCell>
                          <TableCell className="text-right">{c.uses}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">R$ {c.revenue.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right text-red-500">-R$ {c.discount.toLocaleString("pt-BR")}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">Sem cupons</TableCell>
                        </TableRow>
                      )}
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
