"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useCepLookup } from "@/hooks/useCepLookup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Link2,
  Eye,
  Plus,
  Camera,
  Users,
  DollarSign,
  CheckCircle2,
  Search,
  Edit,
  XCircle,
  Trash2,
  X,
  MapPin,
  Building2,
  Clock,
  FileText,
  Upload,
  Filter,
  Download,
  AlertTriangle,
  Ban,
  Receipt,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface Photographer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  instagram: string;
  pocket: number;
  estudio: number;
  completa: number;
  status: "ativo" | "inativo";
}

type CommissionStatus = "pago" | "pendente" | "atrasado" | "cancelado";

interface CommissionPayment {
  id: number;
  photographerName: string;
  month: string;
  sessions: number;
  revenue: string;
  commissionValue: string;
  commissionPct: number;
  status: CommissionStatus;
  paidDate: string | null;
  dueDate: string;
  receiptUrl: string | null;
  notes: string;
}

/* ────────────────────── Mock Data ────────────────────── */

const mockPhotographers: Photographer[] = [
  {
    id: 1,
    name: "Juliano Lemos",
    email: "fracaodotempo@gmail.com",
    phone: "(11) 94522-4120",
    city: "Sao Paulo",
    state: "SP",
    instagram: "@julianolemos",
    pocket: 12,
    estudio: 8,
    completa: 5,
    status: "ativo",
  },
  {
    id: 2,
    name: "Carlos Silva Fotografo",
    email: "fotografo.teste@example.com",
    phone: "",
    city: "",
    state: "",
    instagram: "",
    pocket: 0,
    estudio: 0,
    completa: 0,
    status: "ativo",
  },
  {
    id: 3,
    name: "Fotografo Teste",
    email: "teste.fotografo@patasamor.com",
    phone: "",
    city: "",
    state: "",
    instagram: "",
    pocket: 0,
    estudio: 0,
    completa: 0,
    status: "ativo",
  },
  {
    id: 4,
    name: "Priscila Santos",
    email: "priscila@email.com",
    phone: "(11) 98234-5678",
    city: "Sao Paulo",
    state: "SP",
    instagram: "@priscilafoto",
    pocket: 8,
    estudio: 6,
    completa: 3,
    status: "ativo",
  },
  {
    id: 5,
    name: "Beatriz Almeida",
    email: "beatriz@email.com",
    phone: "(19) 97654-3210",
    city: "Campinas",
    state: "SP",
    instagram: "@beatrizpet",
    pocket: 3,
    estudio: 2,
    completa: 1,
    status: "inativo",
  },
];

const mockCommissions: CommissionPayment[] = [
  {
    id: 1,
    photographerName: "Juliano Lemos",
    month: "Marco/2026",
    sessions: 12,
    revenue: "R$ 22.600,00",
    commissionValue: "R$ 6.780,00",
    commissionPct: 30,
    status: "pendente",
    paidDate: null,
    dueDate: "2026-04-10",
    receiptUrl: null,
    notes: "",
  },
  {
    id: 2,
    photographerName: "Priscila Santos",
    month: "Marco/2026",
    sessions: 6,
    revenue: "R$ 10.800,00",
    commissionValue: "R$ 3.240,00",
    commissionPct: 30,
    status: "pendente",
    paidDate: null,
    dueDate: "2026-04-10",
    receiptUrl: null,
    notes: "",
  },
  {
    id: 3,
    photographerName: "Juliano Lemos",
    month: "Fevereiro/2026",
    sessions: 10,
    revenue: "R$ 18.200,00",
    commissionValue: "R$ 5.460,00",
    commissionPct: 30,
    status: "pago",
    paidDate: "2026-03-08",
    dueDate: "2026-03-10",
    receiptUrl: "comprovante_fev_juliano.pdf",
    notes: "Pago via PIX",
  },
  {
    id: 4,
    photographerName: "Priscila Santos",
    month: "Fevereiro/2026",
    sessions: 4,
    revenue: "R$ 7.200,00",
    commissionValue: "R$ 2.160,00",
    commissionPct: 30,
    status: "pago",
    paidDate: "2026-03-09",
    dueDate: "2026-03-10",
    receiptUrl: "comprovante_fev_priscila.pdf",
    notes: "Pago via transferencia",
  },
  {
    id: 5,
    photographerName: "Juliano Lemos",
    month: "Janeiro/2026",
    sessions: 8,
    revenue: "R$ 14.800,00",
    commissionValue: "R$ 4.440,00",
    commissionPct: 30,
    status: "pago",
    paidDate: "2026-02-07",
    dueDate: "2026-02-10",
    receiptUrl: "comprovante_jan_juliano.pdf",
    notes: "Pago via PIX",
  },
  {
    id: 6,
    photographerName: "Beatriz Almeida",
    month: "Janeiro/2026",
    sessions: 3,
    revenue: "R$ 4.500,00",
    commissionValue: "R$ 1.350,00",
    commissionPct: 30,
    status: "atrasado",
    paidDate: null,
    dueDate: "2026-02-10",
    receiptUrl: null,
    notes: "Fotografa inativa, pendencia de pagamento",
  },
  {
    id: 7,
    photographerName: "Priscila Santos",
    month: "Janeiro/2026",
    sessions: 4,
    revenue: "R$ 7.200,00",
    commissionValue: "R$ 2.160,00",
    commissionPct: 30,
    status: "pago",
    paidDate: "2026-02-09",
    dueDate: "2026-02-10",
    receiptUrl: "comprovante_jan_priscila.pdf",
    notes: "",
  },
];

/* ────────────────────── Helpers ────────────────────── */

function getCommissionStatusConfig(status: CommissionStatus) {
  switch (status) {
    case "pago":
      return { label: "Pago", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" };
    case "pendente":
      return { label: "Pendente", variant: "secondary" as const, icon: Clock, color: "text-amber-600" };
    case "atrasado":
      return { label: "Atrasado", variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" };
    case "cancelado":
      return { label: "Cancelado", variant: "outline" as const, icon: Ban, color: "text-gray-500" };
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ────────────────────── Form Default State ────────────────────── */

const emptyForm = {
  personType: "PF" as "PF" | "PJ",
  name: "",
  email: "",
  phone: "",
  cpf: "",
  rg: "",
  valorPocket: "150.00",
  valorEstudio: "300.00",
  valorCompleta: "500.00",
  chavePix: "",
  instagram: "",
  portfolioUrl: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  periodoInicio: "",
  periodoFim: "",
  segunda: "",
  terca: "",
  quarta: "",
  quinta: "",
  sexta: "",
  sabado: "",
  domingo: "",
  bio: "",
  observacoes: "",
  ativo: true,
};

/* ────────────────────── Page ────────────────────── */

export default function FotografosPage() {
  const [photographers] = useState<Photographer[]>(mockPhotographers);
  const [commissions, setCommissions] = useState<CommissionPayment[]>(mockCommissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [commissionFilter, setCommissionFilter] = useState<CommissionStatus | "todos">("todos");
  const [commissionPhotographerFilter, setCommissionPhotographerFilter] = useState("todos");
  const [selectedCommission, setSelectedCommission] = useState<CommissionPayment | null>(null);
  const [expandedCommissionId, setExpandedCommissionId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());

  /* ─── KPIs (filtered by date range) ─── */
  const commissionsInRange = commissions.filter((c) => isInRange(c.dueDate, dateRange));
  const totalFotografos = photographers.length;
  const ativos = photographers.filter((p) => p.status === "ativo").length;
  const totalSessoes = commissionsInRange.reduce((sum, c) => sum + c.sessions, 0);
  const comissoesPendentes = commissionsInRange.filter(
    (c) => c.status === "pendente" || c.status === "atrasado"
  );
  const valorPendente = comissoesPendentes.reduce((sum, c) => {
    const num = parseFloat(
      c.commissionValue.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
    );
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  /* ─── Filtered ─── */
  const filteredPhotographers = photographers.filter(
    (p) =>
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommissions = commissions.filter((c) => {
    const matchesStatus =
      commissionFilter === "todos" || c.status === commissionFilter;
    const matchesPhotographer =
      commissionPhotographerFilter === "todos" ||
      c.photographerName === commissionPhotographerFilter;
    return matchesStatus && matchesPhotographer;
  });

  const uniquePhotographerNames = [
    ...new Set(commissions.map((c) => c.photographerName)),
  ];

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const cepLookup = useCepLookup(
    useMemo(
      () => ({
        onSuccess: (data) => {
          setForm((prev) => ({
            ...prev,
            rua: data.logradouro || prev.rua,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
            complemento: data.complemento || prev.complemento,
          }));
        },
      }),
      []
    )
  );

  const [editPhotographer, setEditPhotographer] = useState<Photographer | null>(null);
  const [deletePhotographer, setDeletePhotographer] = useState<Photographer | null>(null);

  const markAsPaid = (id: number) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "pago" as CommissionStatus,
              paidDate: new Date().toISOString().split("T")[0],
            }
          : c
      )
    );
  };

  const handleEditPhotographer = useCallback((ph: Photographer) => {
    setForm({
      ...emptyForm,
      personType: "PF",
      name: ph.name,
      email: ph.email,
      phone: ph.phone,
      instagram: ph.instagram,
      cidade: ph.city,
      estado: ph.state,
      ativo: ph.status === "ativo",
    });
    setEditPhotographer(ph);
    setShowNewForm(true);
  }, []);

  const handleCopyInviteLink = useCallback(() => {
    const url = `${window.location.origin}/convite/fotografo`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado!", { description: url });
    });
  }, []);

  const handleCopyPhotographerLink = useCallback((ph: Photographer) => {
    const slug = ph.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const url = `${window.location.origin}/fotografo/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado!", { description: url });
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletePhotographer) return;
    toast.success(`Fotógrafo "${deletePhotographer.name}" excluído com sucesso.`);
    setDeletePhotographer(null);
  }, [deletePhotographer]);

  const handleCloseForm = useCallback(() => {
    setShowNewForm(false);
    setEditPhotographer(null);
    setForm(emptyForm);
  }, []);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Fotografos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie fotografos parceiros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleCopyInviteLink}>
            <Link2 className="size-4" />
            Copiar Link de Convite Fotógrafo
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setForm(emptyForm);
              setEditPhotographer(null);
              setShowNewForm(true);
            }}
          >
            <Plus className="size-4" />
            Novo Fotografo
          </Button>
        </div>
      </div>

      {/* ─── Date Filter ─── */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* ─── KPI Dashboard ─── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total de Fotografos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalFotografos}
            </p>
            <p className="text-xs text-muted-foreground">{ativos} ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sessoes Realizadas
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalSessoes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-amber-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Comissoes Pendentes
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              R${" "}
              {valorPendente
                .toFixed(2)
                .replace(".", ",")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ativos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">{ativos}</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="fotografos">
        <TabsList>
          <TabsTrigger value="fotografos">Fotografos</TabsTrigger>
          <TabsTrigger value="comissoes">Comissoes</TabsTrigger>
        </TabsList>

        {/* ════════════════════ Fotografos Tab ════════════════════ */}
        <TabsContent value="fotografos">
          {/* Search */}
          <div className="mb-4 mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, email, instagram ou cidade..."
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Cidade
                      </TableHead>
                      <TableHead className="text-center">Pocket</TableHead>
                      <TableHead className="text-center">Estudio</TableHead>
                      <TableHead className="text-center">Completa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPhotographers.map((ph) => (
                      <TableRow key={ph.id}>
                        <TableCell className="font-medium text-foreground">
                          {ph.name}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{ph.email}</p>
                            {ph.phone && (
                              <p className="text-[11px] text-muted-foreground">
                                {ph.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {ph.city ? `${ph.city}, ${ph.state}` : "-"}
                        </TableCell>
                        <TableCell className="text-center">{ph.pocket}</TableCell>
                        <TableCell className="text-center">{ph.estudio}</TableCell>
                        <TableCell className="text-center">{ph.completa}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ph.status === "ativo" ? "default" : "secondary"
                            }
                          >
                            {ph.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Editar"
                              onClick={() => handleEditPhotographer(ph)}
                            >
                              <Edit className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Visualizar"
                              onClick={() => handleEditPhotographer(ph)}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Copiar link"
                              onClick={() => handleCopyPhotographerLink(ph)}
                            >
                              <Link2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Excluir"
                              onClick={() => setDeletePhotographer(ph)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════ Comissoes Tab ════════════════════ */}
        <TabsContent value="comissoes">
          <div className="mt-4 space-y-4">
            {/* Comissoes KPIs */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    Pagas
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    {commissions.filter((c) => c.status === "pago").length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                    Pendentes
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-700">
                    {commissions.filter((c) => c.status === "pendente").length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                    Atrasadas
                  </p>
                  <p className="mt-1 text-xl font-bold text-red-700">
                    {commissions.filter((c) => c.status === "atrasado").length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Pendente
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    R${" "}
                    {valorPendente
                      .toFixed(2)
                      .replace(".", ",")
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <select
                      value={commissionFilter}
                      onChange={(e) =>
                        setCommissionFilter(
                          e.target.value as CommissionStatus | "todos"
                        )
                      }
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                      <option value="atrasado">Atrasado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    <select
                      value={commissionPhotographerFilter}
                      onChange={(e) =>
                        setCommissionPhotographerFilter(e.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="todos">Todos os Fotografos</option>
                      {uniquePhotographerNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="size-3.5" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Commission list */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-foreground">
                  Historico de Comissoes
                </CardTitle>
                <CardDescription>
                  {filteredCommissions.length} registro(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCommissions.map((commission) => {
                    const statusCfg = getCommissionStatusConfig(
                      commission.status
                    );
                    const StatusIcon = statusCfg.icon;
                    const isExpanded =
                      expandedCommissionId === commission.id;

                    return (
                      <div
                        key={commission.id}
                        className="rounded-lg border border-border"
                      >
                        {/* Summary row */}
                        <div
                          className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                          onClick={() =>
                            setExpandedCommissionId(
                              isExpanded ? null : commission.id
                            )
                          }
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-medium text-foreground">
                                {commission.photographerName}
                              </p>
                              <Badge className="text-[10px]" variant="secondary">
                                {commission.month}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{commission.sessions} sessoes</span>
                              <span>Receita: {commission.revenue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">
                                {commission.commissionValue}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {commission.commissionPct}% comissao
                              </p>
                            </div>

                            <Badge
                              variant={statusCfg.variant}
                              className="gap-1 text-[10px]"
                            >
                              <StatusIcon className="size-3" />
                              {statusCfg.label}
                            </Badge>

                            {isExpanded ? (
                              <ChevronUp className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border px-4 py-4">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Data Vencimento
                                </p>
                                <p className="mt-0.5 text-sm text-foreground">
                                  {formatDate(commission.dueDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Data Pagamento
                                </p>
                                <p className="mt-0.5 text-sm text-foreground">
                                  {commission.paidDate
                                    ? formatDate(commission.paidDate)
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Comprovante
                                </p>
                                {commission.receiptUrl ? (
                                  <div className="mt-0.5 flex items-center gap-1">
                                    <Receipt className="size-3.5 text-green-600" />
                                    <span className="text-sm text-green-700">
                                      {commission.receiptUrl}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="mt-0.5 text-sm text-muted-foreground">
                                    Nenhum
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Observacoes
                                </p>
                                <p className="mt-0.5 text-sm text-foreground">
                                  {commission.notes || "—"}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2 border-t border-border pt-3">
                              {(commission.status === "pendente" ||
                                commission.status === "atrasado") && (
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsPaid(commission.id);
                                  }}
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  Marcar como Pago
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                              >
                                <Upload className="size-3.5" />
                                {commission.receiptUrl
                                  ? "Atualizar Comprovante"
                                  : "Anexar Comprovante"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                              >
                                <Eye className="size-3.5" />
                                Detalhes das Sessoes
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredCommissions.length === 0 && (
                    <div className="py-12 text-center">
                      <Receipt className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Nenhuma comissao encontrada com os filtros atuais
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ════════════════════ Novo Fotografo Modal ════════════════════ */}
      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog open={!!deletePhotographer} onOpenChange={(open) => !open && setDeletePhotographer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fotógrafo{" "}
              <strong>{deletePhotographer?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletePhotographer(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-foreground">
                    {editPhotographer ? "Editar Fotógrafo" : "Novo Fotografo"}
                  </CardTitle>
                  <CardDescription>
                    {editPhotographer
                      ? `Editando dados de ${editPhotographer.name}`
                      : "Cadastre um novo fotografo parceiro"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={handleCloseForm}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ─── Tipo de Pessoa ─── */}
              <div>
                <Label className="mb-2 block text-sm font-semibold">Tipo de Cadastro *</Label>
                {editPhotographer ? (
                  <div className="flex items-center gap-3 rounded-lg border-2 border-[#8b5e5e] bg-[#8b5e5e]/5 p-3">
                    {form.personType === "PF" ? (
                      <Users className="size-5 text-[#8b5e5e]" />
                    ) : (
                      <Building2 className="size-5 text-[#8b5e5e]" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-[#8b5e5e]">
                        {form.personType === "PF" ? "Pessoa Física (PF)" : "Pessoa Jurídica (PJ)"}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        O tipo de cadastro não pode ser alterado após o registro.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={form.personType === "PF" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updateForm("personType", "PF")}
                    >
                      Pessoa Física (PF)
                    </Button>
                    <Button
                      type="button"
                      variant={form.personType === "PJ" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updateForm("personType", "PJ")}
                    >
                      Pessoa Jurídica (PJ)
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* ─── Dados Basicos ─── */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Nome completo"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Telefone / WhatsApp</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                </div>
                {form.personType === "PF" && (
                  <>
                    <div>
                      <Label>CPF *</Label>
                      <Input
                        value={form.cpf}
                        onChange={(e) => updateForm("cpf", e.target.value)}
                        placeholder="000.000.000-00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>RG</Label>
                      <Input
                        value={form.rg}
                        onChange={(e) => updateForm("rg", e.target.value)}
                        placeholder="00.000.000-0"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label>Valor - Sessao Pocket (R$)</Label>
                  <Input
                    value={form.valorPocket}
                    onChange={(e) => updateForm("valorPocket", e.target.value)}
                    placeholder="150.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Valor - Sessao Estudio (R$)</Label>
                  <Input
                    value={form.valorEstudio}
                    onChange={(e) =>
                      updateForm("valorEstudio", e.target.value)
                    }
                    placeholder="300.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Valor - Sessao Completa (R$)</Label>
                  <Input
                    value={form.valorCompleta}
                    onChange={(e) =>
                      updateForm("valorCompleta", e.target.value)
                    }
                    placeholder="500.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Chave PIX</Label>
                  <Input
                    value={form.chavePix}
                    onChange={(e) => updateForm("chavePix", e.target.value)}
                    placeholder="CPF, CNPJ, Email, Celular ou Chave Aleatoria"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={form.instagram}
                    onChange={(e) => updateForm("instagram", e.target.value)}
                    placeholder="@usuario"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Portfolio URL</Label>
                  <Input
                    value={form.portfolioUrl}
                    onChange={(e) =>
                      updateForm("portfolioUrl", e.target.value)
                    }
                    placeholder="https://portfolio.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* ─── Endereco ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="size-4 text-primary/60" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Endereco
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>CEP</Label>
                    <div className="relative mt-1">
                      <Input
                        value={form.cep}
                        onChange={(e) => updateForm("cep", e.target.value)}
                        onBlur={() => cepLookup.fetchCep(form.cep)}
                        placeholder="00000-000"
                      />
                      {cepLookup.loading && (
                        <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={form.rua}
                      onChange={(e) => updateForm("rua", e.target.value)}
                      placeholder="Nome da rua"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Numero</Label>
                    <Input
                      value={form.numero}
                      onChange={(e) => updateForm("numero", e.target.value)}
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input
                      value={form.complemento}
                      onChange={(e) =>
                        updateForm("complemento", e.target.value)
                      }
                      placeholder="Apto, Bloco..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={form.bairro}
                      onChange={(e) => updateForm("bairro", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={form.cidade}
                      onChange={(e) => updateForm("cidade", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={form.estado}
                      onChange={(e) => updateForm("estado", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Pessoa Juridica (PJ) — only when PJ selected ─── */}
              {form.personType === "PJ" && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="size-4 text-primary/60" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Pessoa Jurídica (PJ)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Razão Social *</Label>
                      <Input
                        value={form.razaoSocial}
                        onChange={(e) =>
                          updateForm("razaoSocial", e.target.value)
                        }
                        placeholder="Razão Social da empresa"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Nome Fantasia</Label>
                      <Input
                        value={form.nomeFantasia}
                        onChange={(e) =>
                          updateForm("nomeFantasia", e.target.value)
                        }
                        placeholder="Nome Fantasia"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>CNPJ *</Label>
                      <Input
                        value={form.cnpj}
                        onChange={(e) => updateForm("cnpj", e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* ─── Horarios de Agenda ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-primary/60" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Horarios de Agenda
                  </h3>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label>Periodo de Trabalho - Inicio</Label>
                    <Input
                      type="date"
                      value={form.periodoInicio}
                      onChange={(e) =>
                        updateForm("periodoInicio", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Periodo de Trabalho - Fim</Label>
                    <Input
                      type="date"
                      value={form.periodoFim}
                      onChange={(e) =>
                        updateForm("periodoFim", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Disponibilidade Semanal (horarios)
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ["segunda", "Segunda"],
                      ["terca", "Terca"],
                      ["quarta", "Quarta"],
                      ["quinta", "Quinta"],
                      ["sexta", "Sexta"],
                      ["sabado", "Sabado"],
                      ["domingo", "Domingo"],
                    ] as const
                  ).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3"
                    >
                      <span className="w-20 text-sm text-foreground">
                        {label}
                      </span>
                      <Input
                        value={form[key]}
                        onChange={(e) => updateForm(key, e.target.value)}
                        placeholder="Ex: 09:00 - 18:00 ou Indisponivel"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* ─── Bio & Observacoes ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="size-4 text-primary/60" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Bio &amp; Observacoes
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Bio</Label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => updateForm("bio", e.target.value)}
                      placeholder="Breve descricao sobre o fotografo..."
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Observacoes Internas</Label>
                    <textarea
                      value={form.observacoes}
                      onChange={(e) =>
                        updateForm("observacoes", e.target.value)
                      }
                      placeholder="Notas internas sobre o fotografo..."
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Status toggle ─── */}
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  Fotografo ativo (disponivel para sessoes)
                </span>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(checked) =>
                    updateForm("ativo", !!checked)
                  }
                />
              </div>

              {/* ─── Buttons ─── */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseForm}
                >
                  Cancelar
                </Button>
                <Button onClick={() => {
                  if (editPhotographer) {
                    toast.success(`Fotógrafo "${form.name}" atualizado com sucesso!`);
                  } else {
                    toast.success(`Fotógrafo "${form.name}" cadastrado com sucesso!`);
                  }
                  handleCloseForm();
                }}>
                  {editPhotographer ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
