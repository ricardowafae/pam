"use client";

import {
  Link2,
  Copy,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  CalendarDays,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

/* ─────────── Types ─────────── */

interface Influencer {
  id: string;
  name: string;
  slug: string;
  email: string;
  total_sales: number;
  total_commission: number;
}

interface Commission {
  id: string;
  influencer_id: string;
  order_id: string | null;
  product_type: string | null;
  product_name: string | null;
  sale_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

interface PageView {
  id: string;
  page_path: string;
  influencer_id: string;
  session_id: string | null;
  visitor_id: string | null;
  device_type: string | null;
  created_at: string;
}

/* ─────────── Constants ─────────── */

const HOUR_COLORS = [
  "#e8d5c4", "#e0c8b4", "#d8bca5", "#d0b096",  // 00-03
  "#c8a487", "#c09878", "#b88c69", "#b0805a",  // 04-07
  "#a8744b", "#a0683c", "#985c2d", "#90501e",  // 08-11
  "#88440f", "#804000", "#7a3c00", "#743800",  // 12-15
  "#6e3400", "#683000", "#622c00", "#5c2800",  // 16-19
  "#562400", "#502000", "#4a1c00", "#441800",  // 20-23
];

const PERIOD_OPTIONS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "60 dias", days: 60 },
  { label: "90 dias", days: 90 },
  { label: "180 dias", days: 180 },
  { label: "360 dias", days: 360 },
];

const CHART_COLORS = {
  dogbook: "var(--color-primary)",      // brown/primary
  pocket: "#c4a07a",                    // tan
  estudio: "#a68b6b",                   // darker tan
  completa: "#e8d5c4",                  // light beige
  line: "#4a3728",                      // dark brown
  visitors: "#b08968",                  // warm brown
};

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/* ─────────── Helpers ─────────── */

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getDateRange(
  selectedPeriod: number,
  customStart: string,
  customEnd: string
): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  if (customStart && customEnd) {
    start = new Date(customStart + "T00:00:00");
    return { start, end: new Date(customEnd + "T23:59:59") };
  }

  start = new Date();
  start.setDate(start.getDate() - (selectedPeriod || 30));
  return { start, end };
}

/* ─────────── Component ─────────── */

export default function InfluenciadorPage() {
  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch influencer identity ──
  useEffect(() => {
    async function loadInfluencer() {
      // Try localStorage slug first
      const storedSlug =
        typeof window !== "undefined"
          ? localStorage.getItem("pam_influencer_portal")
          : null;

      if (storedSlug) {
        const { data, error: err } = await supabase
          .from("influencers")
          .select("*")
          .eq("slug", storedSlug)
          .single();

        if (data && !err) {
          setInfluencer(data as Influencer);
          return;
        }
      }

      // Fallback: match by authenticated user email
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setError("Nenhum influenciador encontrado. Faca login novamente.");
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from("influencers")
        .select("*")
        .eq("email", user.email)
        .single();

      if (err || !data) {
        setError("Influenciador nao encontrado para este email.");
        setLoading(false);
        return;
      }

      setInfluencer(data as Influencer);
    }

    loadInfluencer();
  }, [supabase]);

  // ── Fetch commissions and page views whenever influencer or period changes ──
  const fetchData = useCallback(async () => {
    if (!influencer) return;

    setLoading(true);
    setError(null);

    const { start, end } = getDateRange(selectedPeriod, customStart, customEnd);
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    try {
      const [commissionsRes, pageViewsRes] = await Promise.all([
        supabase
          .from("commissions")
          .select("*")
          .eq("influencer_id", influencer.id)
          .gte("created_at", startISO)
          .lte("created_at", endISO)
          .order("created_at", { ascending: false }),
        supabase
          .from("page_views")
          .select("*")
          .eq("influencer_id", influencer.id)
          .gte("created_at", startISO)
          .lte("created_at", endISO)
          .order("created_at", { ascending: false }),
      ]);

      if (commissionsRes.error) throw commissionsRes.error;
      if (pageViewsRes.error) throw pageViewsRes.error;

      setCommissions((commissionsRes.data ?? []) as Commission[]);
      setPageViews((pageViewsRes.data ?? []) as PageView[]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [influencer, selectedPeriod, customStart, customEnd, supabase]);

  useEffect(() => {
    if (influencer) {
      fetchData();
    }
  }, [influencer, fetchData]);

  // ── Derived data ──

  const influencerLink = influencer
    ? `https://patasamorememorias.com.br/p/${influencer.slug}`
    : "";

  // KPI calculations
  const kpis = useMemo(() => {
    const totalSales = commissions.reduce((sum, c) => sum + c.sale_amount, 0);
    const totalCommission = commissions.reduce(
      (sum, c) => sum + c.commission_amount,
      0
    );
    const pendingCommission = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commission_amount, 0);
    const avgPerSale =
      commissions.length > 0 ? totalCommission / commissions.length : 0;

    return [
      {
        label: "Vendas Totais",
        value: formatCurrency(totalSales),
        icon: DollarSign,
        color: "text-green-600",
      },
      {
        label: "Comissao Total",
        value: formatCurrency(totalCommission),
        icon: TrendingUp,
        color: "text-primary",
      },
      {
        label: "Comissao Pendente",
        value: formatCurrency(pendingCommission),
        icon: Clock,
        color: "text-amber-600",
      },
      {
        label: "Valor por Venda",
        value: formatCurrency(Math.round(avgPerSale)),
        icon: CheckCircle,
        color: "text-blue-600",
      },
    ];
  }, [commissions]);

  // Revenue by month grouped by product type
  const revenueWithTotal = useMemo(() => {
    const monthMap: Record<
      string,
      { Dogbook: number; Pocket: number; Estudio: number; Completa: number }
    > = {};

    for (const c of commissions) {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!monthMap[key]) {
        monthMap[key] = { Dogbook: 0, Pocket: 0, Estudio: 0, Completa: 0 };
      }

      const type = (c.product_type ?? "").toLowerCase();
      if (type.includes("dogbook")) {
        monthMap[key].Dogbook += c.sale_amount;
      } else if (type.includes("pocket")) {
        monthMap[key].Pocket += c.sale_amount;
      } else if (type.includes("estudio") || type.includes("studio")) {
        monthMap[key].Estudio += c.sale_amount;
      } else if (type.includes("completa")) {
        monthMap[key].Completa += c.sale_amount;
      } else {
        // default to Dogbook for unrecognized types
        monthMap[key].Dogbook += c.sale_amount;
      }
    }

    return Object.keys(monthMap)
      .sort()
      .map((key) => {
        const monthIndex = parseInt(key.split("-")[1], 10);
        const data = monthMap[key];
        return {
          month: MONTH_NAMES[monthIndex],
          ...data,
          Total: data.Dogbook + data.Pocket + data.Estudio + data.Completa,
        };
      });
  }, [commissions]);

  // Visitors by day
  const visitorsByDay = useMemo(() => {
    const dayMap: Record<string, number> = {};

    for (const pv of pageViews) {
      const d = new Date(pv.created_at);
      const dayKey = String(d.getDate()).padStart(2, "0");
      dayMap[dayKey] = (dayMap[dayKey] ?? 0) + 1;
    }

    return Object.keys(dayMap)
      .sort()
      .map((day) => ({ day, v: dayMap[day] }));
  }, [pageViews]);

  // Visitors by hour (new vs returning based on visitor_id frequency)
  const visitorsByHour = useMemo(() => {
    // Count how many times each visitor_id appears to determine new vs returning
    const visitorCounts: Record<string, number> = {};
    for (const pv of pageViews) {
      const vid = pv.visitor_id ?? pv.session_id ?? "unknown";
      visitorCounts[vid] = (visitorCounts[vid] ?? 0) + 1;
    }

    const hourData: { novos: number; recorrentes: number }[] = Array.from(
      { length: 24 },
      () => ({ novos: 0, recorrentes: 0 })
    );

    for (const pv of pageViews) {
      const hour = new Date(pv.created_at).getHours();
      const vid = pv.visitor_id ?? pv.session_id ?? "unknown";
      if (visitorCounts[vid] > 1) {
        hourData[hour].recorrentes += 1;
      } else {
        hourData[hour].novos += 1;
      }
    }

    return hourData.map((d, i) => ({
      hour: `${String(i).padStart(2, "0")}h`,
      novos: d.novos,
      recorrentes: d.recorrentes,
    }));
  }, [pageViews]);

  function handleCopy() {
    navigator.clipboard.writeText(influencerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleApplyPeriod() {
    // Trigger refetch by toggling selectedPeriod to 0 (custom range)
    setSelectedPeriod(0);
  }

  // ── Loading / Error states ──

  if (!influencer && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando painel...</span>
      </div>
    );
  }

  if (error && !influencer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Painel do Influenciador
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu link personalizado e acompanhe suas vendas.
        </p>
      </div>

      {/* Personalized Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-4 text-primary" />
            Seu Link Personalizado
          </CardTitle>
          <CardDescription>
            Compartilhe este link com seus seguidores para rastrear suas vendas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={influencerLink}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleCopy}>
              {copied ? (
                <CheckCircle className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copiado!" : "Copiar Link"}
            </Button>
            <a
              href={influencerLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <ExternalLink className="size-4" />
                Abrir
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Slug: /p/{influencer?.slug}
          </p>
        </CardContent>
      </Card>

      {/* ─── Period Filters ─── */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="size-4" />
            Periodo de Analise
          </div>

          {/* Quick-select buttons */}
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.days}
                size="sm"
                variant={selectedPeriod === opt.days ? "default" : "outline"}
                onClick={() => {
                  setSelectedPeriod(opt.days);
                  setCustomStart("");
                  setCustomEnd("");
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Custom date range */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Data Inicial
              </Label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setSelectedPeriod(0);
                }}
                className="w-40 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Data Final
              </Label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setSelectedPeriod(0);
                }}
                className="w-40 text-sm"
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={!customStart || !customEnd}
              onClick={handleApplyPeriod}
            >
              Aplicar Periodo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading overlay for data */}
      {loading && influencer && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Carregando dados...
          </span>
        </div>
      )}

      {error && influencer && (
        <div className="text-center py-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className={`size-8 ${kpi.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Revenue Chart ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita Mensal por Produto</CardTitle>
          <CardDescription>
            Dogbook + Sessao Pocket + Sessao Estudio + Sessao Completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenueWithTotal.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhuma venda registrada neste periodo.
            </p>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={revenueWithTotal}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e0da" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString("pt-BR")}`,
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e8e0da",
                      fontSize: 13,
                    }}
                  />
                  <Legend
                    iconType="square"
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="Completa"
                    stackId="revenue"
                    fill={CHART_COLORS.completa}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Dogbook"
                    stackId="revenue"
                    fill={CHART_COLORS.dogbook}
                  />
                  <Bar
                    dataKey="Estudio"
                    stackId="revenue"
                    fill={CHART_COLORS.estudio}
                  />
                  <Bar
                    dataKey="Pocket"
                    stackId="revenue"
                    fill={CHART_COLORS.pocket}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    dataKey="Total"
                    type="monotone"
                    stroke={CHART_COLORS.line}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS.line }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Visitors by Day ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitantes por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {visitorsByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhuma visita registrada neste periodo.
            </p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visitorsByDay}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e8e0da"
                  />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value)} visitantes`,
                      "Visitantes",
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e8e0da",
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="v"
                    name="Visitantes"
                    fill={CHART_COLORS.visitors}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Visitors by Hour (horizontal bars) ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitantes por Hora</CardTitle>
          <CardDescription>Distribuicao de acessos ao longo do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[620px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visitorsByHour}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                barGap={1}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e8e0da"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="hour"
                  tick={{ fontSize: 11 }}
                  width={35}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value)} visitantes`,
                    name === "novos" ? "Novos" : "Recorrentes",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e8e0da",
                    fontSize: 13,
                  }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => value === "novos" ? "Novos" : "Recorrentes"}
                />
                <Bar
                  dataKey="recorrentes"
                  name="recorrentes"
                  radius={[0, 3, 3, 0]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => {
                    const idx = visitorsByHour.findIndex((d) => d.hour === props.hour);
                    const color = HOUR_COLORS[idx >= 0 ? idx : 0];
                    return <rect {...props} fill={color} rx={3} ry={3} />;
                  }}
                />
                <Bar
                  dataKey="novos"
                  name="novos"
                  radius={[0, 3, 3, 0]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => {
                    const idx = visitorsByHour.findIndex((d) => d.hour === props.hour);
                    const baseColor = HOUR_COLORS[idx >= 0 ? idx : 0];
                    // Lighter version of the base color
                    const r = parseInt(baseColor.slice(1, 3), 16);
                    const g = parseInt(baseColor.slice(3, 5), 16);
                    const b = parseInt(baseColor.slice(5, 7), 16);
                    const lighter = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
                    return <rect {...props} fill={lighter} rx={3} ry={3} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
