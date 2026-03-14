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
import { useState, useMemo } from "react";
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

/* ─────────── Mock Data ─────────── */

const mockInfluencer = {
  name: "Camila Pets",
  slug: "camila-pets",
  link: "https://patasamorememorias.com.br/p/camila-pets",
};

const kpis = [
  {
    label: "Vendas Totais",
    value: "R$ 4.770",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    label: "Comissao Total",
    value: "R$ 477",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    label: "Comissao Pendente",
    value: "R$ 120",
    icon: Clock,
    color: "text-amber-600",
  },
  {
    label: "Valor por Venda",
    value: "R$ 10",
    icon: CheckCircle,
    color: "text-blue-600",
  },
];

const revenueData = [
  { month: "Out", Dogbook: 8500, Pocket: 2200, Estudio: 3100, Completa: 1800 },
  { month: "Nov", Dogbook: 9200, Pocket: 2800, Estudio: 3500, Completa: 2300 },
  { month: "Dez", Dogbook: 14000, Pocket: 3500, Estudio: 5800, Completa: 4200 },
  { month: "Jan", Dogbook: 10500, Pocket: 3000, Estudio: 4200, Completa: 3100 },
  { month: "Fev", Dogbook: 11200, Pocket: 3200, Estudio: 5200, Completa: 3800 },
  { month: "Mar", Dogbook: 12800, Pocket: 3800, Estudio: 6000, Completa: 4500 },
];

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

const visitorsByHour = [
  { hour: "00h", novos: 8, recorrentes: 15 },
  { hour: "01h", novos: 5, recorrentes: 10 },
  { hour: "02h", novos: 3, recorrentes: 5 },
  { hour: "03h", novos: 2, recorrentes: 4 },
  { hour: "04h", novos: 4, recorrentes: 8 },
  { hour: "05h", novos: 10, recorrentes: 18 },
  { hour: "06h", novos: 15, recorrentes: 30 },
  { hour: "07h", novos: 35, recorrentes: 78 },
  { hour: "08h", novos: 55, recorrentes: 90 },
  { hour: "09h", novos: 80, recorrentes: 120 },
  { hour: "10h", novos: 95, recorrentes: 145 },
  { hour: "11h", novos: 110, recorrentes: 170 },
  { hour: "12h", novos: 90, recorrentes: 132 },
  { hour: "13h", novos: 105, recorrentes: 155 },
  { hour: "14h", novos: 120, recorrentes: 180 },
  { hour: "15h", novos: 115, recorrentes: 165 },
  { hour: "16h", novos: 100, recorrentes: 148 },
  { hour: "17h", novos: 85, recorrentes: 130 },
  { hour: "18h", novos: 75, recorrentes: 110 },
  { hour: "19h", novos: 100, recorrentes: 145 },
  { hour: "20h", novos: 130, recorrentes: 190 },
  { hour: "21h", novos: 120, recorrentes: 175 },
  { hour: "22h", novos: 60, recorrentes: 95 },
  { hour: "23h", novos: 25, recorrentes: 42 },
];

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

/* ─────────── Component ─────────── */

export default function InfluenciadorPage() {
  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(mockInfluencer.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Add "Total" to each revenue data point for the line
  const revenueWithTotal = useMemo(
    () =>
      revenueData.map((d) => ({
        ...d,
        Total: d.Dogbook + d.Pocket + d.Estudio + d.Completa,
      })),
    []
  );

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
              value={mockInfluencer.link}
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
              href={mockInfluencer.link}
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
            Slug: /p/{mockInfluencer.slug}
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
            >
              Aplicar Periodo
            </Button>
          </div>
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>

      {/* ─── Visitors by Day ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitantes por Dia</CardTitle>
        </CardHeader>
        <CardContent>
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
