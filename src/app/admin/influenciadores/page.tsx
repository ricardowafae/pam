"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Copy,
  Eye,
  Plus,
  Users,
  DollarSign,
  CheckCircle2,
  Search,
  Edit,
  Trash2,
  X,
  Building2,
  Landmark,
  Tag,
  CalendarPlus,
  FileText,
  Upload,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Ban,
  Receipt,
  ChevronDown,
  ChevronUp,
  Megaphone,
  BarChart3,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface Influencer {
  id: number;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  slug: string;
  views: number;
  visitors: number;
  dogbook: number;
  pocket: number;
  estudio: number;
  completa: number;
  status: "ativo" | "inativo";
}

type CommissionStatus = "pago" | "pendente" | "atrasado" | "cancelado";

interface CommissionPayment {
  id: number;
  influencerName: string;
  month: string;
  sales: number;
  product: string;
  revenue: string;
  commissionValue: string;
  status: CommissionStatus;
  paidDate: string | null;
  dueDate: string;
  receiptUrl: string | null;
  notes: string;
}

interface SeasonalCoupon {
  code: string;
  discount: string;
  active: boolean;
}

/* ────────────────────── Mock Data ────────────────────── */

const mockInfluencers: Influencer[] = [
  {
    id: 1,
    name: "Influencer Teste",
    email: "influencer@patasamor.com",
    phone: "",
    instagram: "—",
    slug: "/p/teste-influencer",
    views: 2,
    visitors: 0,
    dogbook: 0,
    pocket: 0,
    estudio: 0,
    completa: 0,
    status: "ativo",
  },
  {
    id: 2,
    name: "Camila Pet",
    email: "camila@email.com",
    phone: "(11) 98765-4321",
    instagram: "@camilapet",
    slug: "/p/camila-pet",
    views: 4520,
    visitors: 1280,
    dogbook: 8,
    pocket: 6,
    estudio: 3,
    completa: 1,
    status: "ativo",
  },
  {
    id: 3,
    name: "Doglovers SP",
    email: "contato@dogloverssp.com",
    phone: "(11) 91234-5678",
    instagram: "@dogloverssp",
    slug: "/p/doglovers-sp",
    views: 3180,
    visitors: 890,
    dogbook: 5,
    pocket: 4,
    estudio: 2,
    completa: 1,
    status: "ativo",
  },
  {
    id: 4,
    name: "Amor de Pata",
    email: "amor@pata.com",
    phone: "(21) 99876-1234",
    instagram: "@amordepata",
    slug: "/p/amor-de-pata",
    views: 1650,
    visitors: 420,
    dogbook: 3,
    pocket: 1,
    estudio: 1,
    completa: 0,
    status: "inativo",
  },
  {
    id: 5,
    name: "Vida Animal",
    email: "vida@animal.com",
    phone: "(11) 97654-3210",
    instagram: "@vidaanimal",
    slug: "/p/vida-animal",
    views: 980,
    visitors: 310,
    dogbook: 2,
    pocket: 1,
    estudio: 0,
    completa: 0,
    status: "ativo",
  },
];

const mockCommissions: CommissionPayment[] = [
  {
    id: 1,
    influencerName: "Camila Pet",
    month: "Marco/2026",
    sales: 5,
    product: "Dogbook (3), Pocket (2)",
    revenue: "R$ 3.270,00",
    commissionValue: "R$ 490,00",
    status: "pendente",
    paidDate: null,
    dueDate: "2026-04-10",
    receiptUrl: null,
    notes: "",
  },
  {
    id: 2,
    influencerName: "Doglovers SP",
    month: "Marco/2026",
    sales: 3,
    product: "Dogbook (2), Estudio (1)",
    revenue: "R$ 4.680,00",
    commissionValue: "R$ 370,00",
    status: "pendente",
    paidDate: null,
    dueDate: "2026-04-10",
    receiptUrl: null,
    notes: "",
  },
  {
    id: 3,
    influencerName: "Camila Pet",
    month: "Fevereiro/2026",
    sales: 6,
    product: "Dogbook (4), Pocket (2)",
    revenue: "R$ 3.760,00",
    commissionValue: "R$ 520,00",
    status: "pago",
    paidDate: "2026-03-08",
    dueDate: "2026-03-10",
    receiptUrl: "comprovante_fev_camila.pdf",
    notes: "Pago via PIX",
  },
  {
    id: 4,
    influencerName: "Doglovers SP",
    month: "Fevereiro/2026",
    sales: 4,
    product: "Pocket (2), Estudio (1), Completa (1)",
    revenue: "R$ 10.400,00",
    commissionValue: "R$ 870,00",
    status: "pago",
    paidDate: "2026-03-09",
    dueDate: "2026-03-10",
    receiptUrl: "comprovante_fev_doglovers.pdf",
    notes: "Pago via transferencia",
  },
  {
    id: 5,
    influencerName: "Amor de Pata",
    month: "Janeiro/2026",
    sales: 3,
    product: "Dogbook (2), Pocket (1)",
    revenue: "R$ 1.880,00",
    commissionValue: "R$ 220,00",
    status: "atrasado",
    paidDate: null,
    dueDate: "2026-02-10",
    receiptUrl: null,
    notes: "Influenciador inativo, pendencia de pagamento",
  },
  {
    id: 6,
    influencerName: "Camila Pet",
    month: "Janeiro/2026",
    sales: 7,
    product: "Dogbook (5), Pocket (2)",
    revenue: "R$ 4.250,00",
    commissionValue: "R$ 580,00",
    status: "pago",
    paidDate: "2026-02-07",
    dueDate: "2026-02-10",
    receiptUrl: "comprovante_jan_camila.pdf",
    notes: "Pago via PIX",
  },
  {
    id: 7,
    influencerName: "Vida Animal",
    month: "Janeiro/2026",
    sales: 2,
    product: "Dogbook (1), Pocket (1)",
    revenue: "R$ 1.390,00",
    commissionValue: "R$ 130,00",
    status: "pago",
    paidDate: "2026-02-09",
    dueDate: "2026-02-10",
    receiptUrl: "comprovante_jan_vida.pdf",
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
  personType: "" as "" | "PF" | "PJ",
  name: "",
  cpf: "",
  slug: "",
  email: "",
  phone: "",
  instagram: "",
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  comDogbook: "10.00",
  comPocket: "20.00",
  comEstudio: "50.00",
  comCompleta: "100.00",
  banco: "",
  agencia: "",
  conta: "",
  chavePix: "",
  cupomCodigo: "DESCONTO10",
  cupomDesconto: "10",
  seasonalCoupons: [] as SeasonalCoupon[],
  bio: "",
  notasInternas: "",
  ativo: true,
};

/* ────────────────────── Page ────────────────────── */

export default function InfluenciadoresPage() {
  const [influencers] = useState<Influencer[]>(mockInfluencers);
  const [commissions, setCommissions] = useState<CommissionPayment[]>(mockCommissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [commissionFilter, setCommissionFilter] = useState<CommissionStatus | "todos">("todos");
  const [commissionInfluencerFilter, setCommissionInfluencerFilter] = useState("todos");
  const [expandedCommissionId, setExpandedCommissionId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [linkCopied, setLinkCopied] = useState(false);
  const [editInfluencer, setEditInfluencer] = useState<Influencer | null>(null);
  const [deleteInfluencer, setDeleteInfluencer] = useState<Influencer | null>(null);

  /* ─── KPIs (filtered by date range) ─── */
  const commissionsInRange = commissions.filter((c) => isInRange(c.dueDate, dateRange));
  const totalInfluencers = influencers.length;
  const ativos = influencers.filter((i) => i.status === "ativo").length;
  const totalViews = influencers.reduce((sum, i) => sum + i.views, 0);
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
  const filteredInfluencers = influencers.filter(
    (i) =>
      searchTerm === "" ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.instagram.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommissions = commissions.filter((c) => {
    const matchesStatus =
      commissionFilter === "todos" || c.status === commissionFilter;
    const matchesInfluencer =
      commissionInfluencerFilter === "todos" ||
      c.influencerName === commissionInfluencerFilter;
    return matchesStatus && matchesInfluencer;
  });

  const uniqueInfluencerNames = [
    ...new Set(commissions.map((c) => c.influencerName)),
  ];

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ─── Action handlers ─── */
  const handleEditInfluencer = useCallback((inf: Influencer) => {
    setForm({
      ...emptyForm,
      personType: "PF",
      name: inf.name,
      email: inf.email,
      phone: inf.phone,
      instagram: inf.instagram,
      slug: inf.slug.replace("/p/", ""),
      ativo: inf.status === "ativo",
    });
    setEditInfluencer(inf);
    setShowNewForm(true);
  }, []);

  const handleCopyLink = useCallback((slug: string) => {
    const url = `${window.location.origin}${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado!", {
        description: url,
      });
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteInfluencer) return;
    toast.success(`Influenciador "${deleteInfluencer.name}" excluído com sucesso.`);
    setDeleteInfluencer(null);
  }, [deleteInfluencer]);

  const handleCloseForm = useCallback(() => {
    setShowNewForm(false);
    setEditInfluencer(null);
    setForm(emptyForm);
  }, []);

  const addSeasonalCoupon = () => {
    setForm((prev) => ({
      ...prev,
      seasonalCoupons: [
        ...prev.seasonalCoupons,
        { code: "", discount: "", active: true },
      ],
    }));
  };

  const removeSeasonalCoupon = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      seasonalCoupons: prev.seasonalCoupons.filter((_, i) => i !== idx),
    }));
  };

  const updateSeasonalCoupon = (
    idx: number,
    field: keyof SeasonalCoupon,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      seasonalCoupons: prev.seasonalCoupons.map((c, i) =>
        i === idx ? { ...c, [field]: value } : c
      ),
    }));
  };

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

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Influenciadores
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus influenciadores e afiliados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const link = `${window.location.origin}/convite/influenciador`;
              navigator.clipboard.writeText(link);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2500);
            }}
          >
            {linkCopied ? (
              <CheckCircle2 className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4" />
            )}
            {linkCopied ? "Link Copiado!" : "Copiar Link de Convite Influenciador"}
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setForm(emptyForm);
              setShowNewForm(true);
            }}
          >
            <Plus className="size-4" />
            Novo Influenciador
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
                Total de Influenciadores
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalInfluencers}
            </p>
            <p className="text-xs text-muted-foreground">{ativos} ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Visualizacoes Totais
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalViews.toLocaleString("pt-BR")}
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
      <Tabs defaultValue="influenciadores">
        <TabsList>
          <TabsTrigger value="influenciadores">Influenciadores</TabsTrigger>
          <TabsTrigger value="comissoes">Comissoes</TabsTrigger>
        </TabsList>

        {/* ════════════════════ Influenciadores Tab ════════════════════ */}
        <TabsContent value="influenciadores">
          {/* Search */}
          <div className="mb-4 mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, instagram ou slug..."
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
                      <TableHead>Instagram</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Slug
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-center">
                        Visualizacoes
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-center">
                        Visitantes
                      </TableHead>
                      <TableHead className="text-center">Dogbook</TableHead>
                      <TableHead className="text-center">Pocket</TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        Estudio
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        Completa
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInfluencers.map((inf) => (
                      <TableRow key={inf.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {inf.name}
                            </p>
                            {inf.status === "ativo" && (
                              <Badge
                                variant="default"
                                className="mt-0.5 text-[9px]"
                              >
                                Ativo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inf.instagram}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-muted-foreground">
                              {inf.slug}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5"
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">
                          {inf.views.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">
                          {inf.visitors.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-center">{inf.dogbook}</TableCell>
                        <TableCell className="text-center">{inf.pocket}</TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          {inf.estudio}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          {inf.completa}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inf.status === "ativo" ? "default" : "secondary"
                            }
                          >
                            {inf.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Editar influenciador"
                              onClick={() => handleEditInfluencer(inf)}
                            >
                              <Edit className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Copiar link do influenciador"
                              onClick={() => handleCopyLink(inf.slug)}
                            >
                              <Link2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Excluir influenciador"
                              onClick={() => setDeleteInfluencer(inf)}
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
                      value={commissionInfluencerFilter}
                      onChange={(e) =>
                        setCommissionInfluencerFilter(e.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="todos">Todos os Influenciadores</option>
                      {uniqueInfluencerNames.map((name) => (
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
                                {commission.influencerName}
                              </p>
                              <Badge className="text-[10px]" variant="secondary">
                                {commission.month}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{commission.sales} vendas</span>
                              <span>{commission.product}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">
                                {commission.commissionValue}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                receita: {commission.revenue}
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
                                Detalhes das Vendas
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

      {/* ════════════════════ Novo Influenciador Modal ════════════════════ */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-foreground">
                    {editInfluencer ? "Editar Influenciador" : "Novo Influenciador"}
                  </CardTitle>
                  <CardDescription>
                    {editInfluencer
                      ? `Editando dados de ${editInfluencer.name}`
                      : "Cadastre um novo parceiro influenciador"}
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
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tipo de Cadastro *
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateForm("personType", "PF")}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      form.personType === "PF"
                        ? "border-[#8b5e5e] bg-[#8b5e5e]/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Users className={`size-6 ${form.personType === "PF" ? "text-[#8b5e5e]" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${form.personType === "PF" ? "text-[#8b5e5e]" : "text-foreground"}`}>
                      Pessoa Fisica
                    </span>
                    <span className="text-[10px] text-muted-foreground">CPF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm("personType", "PJ")}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      form.personType === "PJ"
                        ? "border-[#8b5e5e] bg-[#8b5e5e]/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Building2 className={`size-6 ${form.personType === "PJ" ? "text-[#8b5e5e]" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${form.personType === "PJ" ? "text-[#8b5e5e]" : "text-foreground"}`}>
                      Pessoa Juridica
                    </span>
                    <span className="text-[10px] text-muted-foreground">CNPJ</span>
                  </button>
                </div>
              </div>

              {form.personType && (
                <>
                  <Separator />

                  {/* ─── Dados Basicos ─── */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {form.personType === "PF" ? "Dados Pessoais" : "Dados da Empresa"}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {form.personType === "PF" ? (
                        <>
                          <div>
                            <Label>Nome Completo *</Label>
                            <Input
                              value={form.name}
                              onChange={(e) => updateForm("name", e.target.value)}
                              placeholder="Nome completo"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>CPF *</Label>
                            <Input
                              value={form.cpf}
                              onChange={(e) => updateForm("cpf", e.target.value)}
                              placeholder="000.000.000-00"
                              className="mt-1"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label>CNPJ *</Label>
                            <Input
                              value={form.cnpj}
                              onChange={(e) => updateForm("cnpj", e.target.value)}
                              placeholder="00.000.000/0000-00"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Razao Social *</Label>
                            <Input
                              value={form.razaoSocial}
                              onChange={(e) => updateForm("razaoSocial", e.target.value)}
                              placeholder="Razao Social da empresa"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Nome Fantasia</Label>
                            <Input
                              value={form.nomeFantasia}
                              onChange={(e) => updateForm("nomeFantasia", e.target.value)}
                              placeholder="Nome Fantasia"
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <Label>Slug da URL *</Label>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">/p/</span>
                          <Input
                            value={form.slug}
                            onChange={(e) => updateForm("slug", e.target.value)}
                            placeholder="nome-influenciador"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          value={form.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="email@exemplo.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Instagram</Label>
                        <Input
                          value={form.instagram}
                          onChange={(e) => updateForm("instagram", e.target.value)}
                          placeholder="@usuario"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

              <Separator />

              {/* ─── Comissoes por Venda ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <DollarSign className="size-4 text-primary/60" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Comissoes por Venda (R$)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <Label>Dogbook</Label>
                    <Input
                      value={form.comDogbook}
                      onChange={(e) =>
                        updateForm("comDogbook", e.target.value)
                      }
                      placeholder="10.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Sessao Pocket</Label>
                    <Input
                      value={form.comPocket}
                      onChange={(e) =>
                        updateForm("comPocket", e.target.value)
                      }
                      placeholder="20.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Sessao Estudio</Label>
                    <Input
                      value={form.comEstudio}
                      onChange={(e) =>
                        updateForm("comEstudio", e.target.value)
                      }
                      placeholder="50.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Sessao Completa</Label>
                    <Input
                      value={form.comCompleta}
                      onChange={(e) =>
                        updateForm("comCompleta", e.target.value)
                      }
                      placeholder="100.00"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Dados Bancarios ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Landmark className="size-4 text-primary/60" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Dados Bancarios
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Banco</Label>
                    <Input
                      value={form.banco}
                      onChange={(e) => updateForm("banco", e.target.value)}
                      placeholder="Nome do banco"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Agencia</Label>
                    <Input
                      value={form.agencia}
                      onChange={(e) => updateForm("agencia", e.target.value)}
                      placeholder="0000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Conta</Label>
                    <Input
                      value={form.conta}
                      onChange={(e) => updateForm("conta", e.target.value)}
                      placeholder="00000-0"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label>Chave PIX (para recebimento)</Label>
                    <Input
                      value={form.chavePix}
                      onChange={(e) => updateForm("chavePix", e.target.value)}
                      placeholder="CPF, CNPJ, Email, Celular ou Chave Aleatoria"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Cupom Padrao ─── */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Tag className="size-4 text-primary/60" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cupom Padrao
                  </p>
                  <Badge variant="default" className="text-[10px]">
                    Auto-aplicado
                  </Badge>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Este cupom sera aplicado automaticamente quando o cliente
                  acessar a pagina do influenciador.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Codigo do Cupom</Label>
                    <Input
                      value={form.cupomCodigo}
                      onChange={(e) =>
                        updateForm("cupomCodigo", e.target.value)
                      }
                      placeholder="DESCONTO10"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Desconto (%)</Label>
                    <Input
                      value={form.cupomDesconto}
                      onChange={(e) =>
                        updateForm("cupomDesconto", e.target.value)
                      }
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Cupons Sazonais ─── */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarPlus className="size-4 text-primary/60" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cupons Sazonais
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={addSeasonalCoupon}
                  >
                    <Plus className="size-3.5" />
                    Adicionar Cupom
                  </Button>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Cupons promocionais que os clientes podem aplicar manualmente
                  no carrinho.
                </p>

                {form.seasonalCoupons.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhum cupom sazonal cadastrado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.seasonalCoupons.map((coupon, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border border-border px-4 py-2"
                      >
                        <Input
                          value={coupon.code}
                          onChange={(e) =>
                            updateSeasonalCoupon(idx, "code", e.target.value)
                          }
                          placeholder="CODIGO"
                          className="w-40"
                        />
                        <Input
                          value={coupon.discount}
                          onChange={(e) =>
                            updateSeasonalCoupon(
                              idx,
                              "discount",
                              e.target.value
                            )
                          }
                          placeholder="% desconto"
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                        <div className="ml-auto flex items-center gap-2">
                          <Switch
                            checked={coupon.active}
                            onCheckedChange={(checked) =>
                              updateSeasonalCoupon(idx, "active", !!checked)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => removeSeasonalCoupon(idx)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* ─── Informacoes Adicionais ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="size-4 text-primary/60" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Informacoes Adicionais
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Bio</Label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => updateForm("bio", e.target.value)}
                      placeholder="Descricao do influenciador..."
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Notas Internas</Label>
                    <textarea
                      value={form.notasInternas}
                      onChange={(e) =>
                        updateForm("notasInternas", e.target.value)
                      }
                      placeholder="Observacoes internas..."
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
                  Influenciador ativo
                </span>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(checked) =>
                    updateForm("ativo", !!checked)
                  }
                />
              </div>
                </>
              )}

              {/* ─── Buttons ─── */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseForm}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    toast.success(
                      editInfluencer
                        ? `Influenciador "${form.name}" atualizado com sucesso!`
                        : `Influenciador "${form.name}" cadastrado com sucesso!`
                    );
                    handleCloseForm();
                  }}
                  disabled={!form.personType}
                >
                  {editInfluencer ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════ Delete Confirmation Dialog ════════════════════ */}
      <Dialog
        open={!!deleteInfluencer}
        onOpenChange={(open) => !open && setDeleteInfluencer(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">
              Excluir Influenciador
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">
                  Tem certeza que deseja excluir o influenciador{" "}
                  <span className="font-bold">{deleteInfluencer?.name}</span>?
                </p>
                <p className="text-muted-foreground">
                  Todos os dados de vendas, comissões e cupons vinculados a este
                  influenciador serão removidos permanentemente.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteInfluencer(null)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="mr-2 size-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
