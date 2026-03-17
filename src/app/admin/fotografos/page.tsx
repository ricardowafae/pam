"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import { useCepLookup } from "@/hooks/useCepLookup";
import { createClient } from "@/lib/supabase/client";
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
  KeyRound,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface Photographer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  instagram: string;
  portfolio_url: string;
  bio: string;
  status: "ativo" | "inativo";
  price_pocket: number | null;
  price_estudio: number | null;
  price_completa: number | null;
  commission_pct: number;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  bank: string;
  agency: string;
  account: string;
  pix_key: string;
  work_period_start: string;
  work_period_end: string;
  available_monday: boolean;
  available_tuesday: boolean;
  available_wednesday: boolean;
  available_thursday: boolean;
  available_friday: boolean;
  available_saturday: boolean;
  available_sunday: boolean;
  created_at: string;
  updated_at: string;
  /* computed client-side */
  pocket: number;
  estudio: number;
  completa: number;
}

type CommissionStatus = "pago" | "pendente" | "processando";

interface CommissionPayment {
  id: string;
  photographer_id: string;
  photographerName: string;
  month: string;
  sessions: number;
  revenue: number;
  commissionValue: number;
  commissionPct: number;
  status: CommissionStatus;
  paidDate: string | null;
  receiptUrl: string | null;
  period_month: number;
  period_year: number;
  created_at: string;
}

/* ────────────────────── Helpers ────────────────────── */

const MONTH_NAMES = [
  "", "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES[month] || month}/${year}`;
}

function formatCurrency(value: number): string {
  return `R$ ${value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function getCommissionStatusConfig(status: CommissionStatus) {
  switch (status) {
    case "pago":
      return { label: "Pago", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" };
    case "pendente":
      return { label: "Pendente", variant: "secondary" as const, icon: Clock, color: "text-amber-600" };
    case "processando":
      return { label: "Processando", variant: "outline" as const, icon: Loader2, color: "text-blue-600" };
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
  commissionPct: "10.00",
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
  bank: "",
  agency: "",
  account: "",
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
  const supabase = createClient();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [commissions, setCommissions] = useState<CommissionPayment[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, { pocket: number; estudio: number; completa: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [commissionFilter, setCommissionFilter] = useState<CommissionStatus | "todos">("todos");
  const [commissionPhotographerFilter, setCommissionPhotographerFilter] = useState("todos");
  const [selectedCommission, setSelectedCommission] = useState<CommissionPayment | null>(null);
  const [expandedCommissionId, setExpandedCommissionId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [globalRates, setGlobalRates] = useState<{
    photographer: { pocket: number; estudio: number; completa: number };
  } | null>(null);

  /* ─── Fetch global commission rates ─── */
  useEffect(() => {
    fetch("/api/commissions/rates")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates?.photographer) {
          setGlobalRates({
            photographer: d.rates.photographer,
          });
        }
      })
      .catch(() => {});
  }, []);

  /* ─── Fetch photographers ─── */
  const fetchPhotographers = useCallback(async () => {
    const { data, error } = await supabase
      .from("photographers")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar fotógrafos.", { description: error.message });
      return;
    }

    const mapped: Photographer[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      city: row.city || "",
      state: row.state || "",
      instagram: row.instagram || "",
      portfolio_url: row.portfolio_url || "",
      bio: row.bio || "",
      status: row.status || "ativo",
      price_pocket: row.price_pocket ? Number(row.price_pocket) : null,
      price_estudio: row.price_estudio ? Number(row.price_estudio) : null,
      price_completa: row.price_completa ? Number(row.price_completa) : null,
      commission_pct: row.commission_pct ? Number(row.commission_pct) : 10,
      cep: row.cep || "",
      street: row.street || "",
      number: row.number || "",
      complement: row.complement || "",
      neighborhood: row.neighborhood || "",
      razao_social: row.razao_social || "",
      nome_fantasia: row.nome_fantasia || "",
      cnpj: row.cnpj || "",
      bank: row.bank || "",
      agency: row.agency || "",
      account: row.account || "",
      pix_key: row.pix_key || "",
      work_period_start: row.work_period_start || "",
      work_period_end: row.work_period_end || "",
      available_monday: row.available_monday ?? false,
      available_tuesday: row.available_tuesday ?? false,
      available_wednesday: row.available_wednesday ?? false,
      available_thursday: row.available_thursday ?? false,
      available_friday: row.available_friday ?? false,
      available_saturday: row.available_saturday ?? false,
      available_sunday: row.available_sunday ?? false,
      created_at: row.created_at || "",
      updated_at: row.updated_at || "",
      pocket: 0,
      estudio: 0,
      completa: 0,
    }));

    setPhotographers(mapped);
  }, [supabase]);

  /* ─── Fetch session counts per photographer ─── */
  const fetchSessionCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("photo_sessions")
      .select("photographer_id, status");

    if (error) {
      console.error("Erro ao carregar sessões:", error.message);
      return;
    }

    const counts: Record<string, { pocket: number; estudio: number; completa: number }> = {};
    for (const row of data || []) {
      const pid = row.photographer_id;
      if (!pid) continue;
      if (!counts[pid]) counts[pid] = { pocket: 0, estudio: 0, completa: 0 };
      // Count all sessions regardless of status type name
      // The status field tracks session_status, we just count by photographer
      counts[pid].pocket += 1; // We'll refine below if session_type exists
    }

    // Try to get session type breakdown if the column exists
    const { data: typedData, error: typedError } = await supabase
      .from("photo_sessions")
      .select("photographer_id, session_type");

    if (!typedError && typedData) {
      // Reset and recount with types
      const typedCounts: Record<string, { pocket: number; estudio: number; completa: number }> = {};
      for (const row of typedData) {
        const pid = row.photographer_id;
        if (!pid) continue;
        if (!typedCounts[pid]) typedCounts[pid] = { pocket: 0, estudio: 0, completa: 0 };
        const t = (row.session_type || "").toLowerCase();
        if (t.includes("pocket")) typedCounts[pid].pocket += 1;
        else if (t.includes("estudio") || t.includes("estúdio")) typedCounts[pid].estudio += 1;
        else if (t.includes("completa")) typedCounts[pid].completa += 1;
        else typedCounts[pid].pocket += 1; // default bucket
      }
      setSessionCounts(typedCounts);
    } else {
      setSessionCounts(counts);
    }
  }, [supabase]);

  /* ─── Fetch commissions ─── */
  const fetchCommissions = useCallback(async () => {
    const { data, error } = await supabase
      .from("commissions")
      .select("*, photographers(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar comissões.", { description: error.message });
      return;
    }

    const mapped: CommissionPayment[] = (data || []).map((row: any) => {
      const d = row.created_at ? new Date(row.created_at) : new Date();
      const pMonth = d.getMonth() + 1;
      const pYear = d.getFullYear();
      return {
        id: row.id,
        photographer_id: row.photographer_id || "",
        photographerName: row.photographers?.name || "Fotógrafo removido",
        month: formatMonthYear(pMonth, pYear),
        sessions: 0,
        revenue: Number(row.total_sale_value) || 0,
        commissionValue: Number(row.amount) || 0,
        commissionPct: 0,
        status: row.status as CommissionStatus,
        paidDate: row.paid_at || null,
        receiptUrl: row.receipt_url || null,
        period_month: pMonth,
        period_year: pYear,
        created_at: row.created_at || "",
      };
    });

    setCommissions(mapped);
  }, [supabase]);

  /* ─── Initial load ─── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchPhotographers(), fetchSessionCounts(), fetchCommissions()]);
      setLoading(false);
    }
    load();
  }, [fetchPhotographers, fetchSessionCounts, fetchCommissions]);

  /* ─── Merge session counts into photographers ─── */
  const photographersWithCounts = useMemo(() => {
    return photographers.map((ph) => {
      const counts = sessionCounts[ph.id];
      return {
        ...ph,
        pocket: counts?.pocket ?? 0,
        estudio: counts?.estudio ?? 0,
        completa: counts?.completa ?? 0,
      };
    });
  }, [photographers, sessionCounts]);

  /* ─── Compute a due-date-like string for commission filtering ─── */
  function commissionDueDateStr(c: CommissionPayment): string {
    // Use 10th of next month as due date for date-range filtering
    const nextMonth = c.period_month === 12 ? 1 : c.period_month + 1;
    const nextYear = c.period_month === 12 ? c.period_year + 1 : c.period_year;
    return `${nextYear}-${String(nextMonth).padStart(2, "0")}-10`;
  }

  /* ─── KPIs (filtered by date range) ─── */
  const commissionsInRange = commissions.filter((c) =>
    isInRange(commissionDueDateStr(c), dateRange)
  );
  const totalFotografos = photographersWithCounts.length;
  const ativos = photographersWithCounts.filter((p) => p.status === "ativo").length;
  const totalSessoes = commissionsInRange.reduce((sum, c) => sum + c.sessions, 0) ||
    photographersWithCounts.reduce((sum, p) => sum + p.pocket + p.estudio + p.completa, 0);
  const comissoesPendentes = commissionsInRange.filter(
    (c) => c.status === "pendente" || c.status === "processando"
  );
  const valorPendente = comissoesPendentes.reduce(
    (sum, c) => sum + c.commissionValue,
    0
  );

  /* ─── Filtered ─── */
  const filteredPhotographers = photographersWithCounts.filter(
    (p) =>
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.instagram.toLowerCase().includes(searchTerm.toLowerCase())
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
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ email: string; name: string } | null>(null);

  const handleResetPassword = async (email: string, name: string) => {
    setResettingEmail(email);
    try {
      const res = await adminFetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar email");
      }
      toast.success(`Email de redefinição de senha enviado para ${name}!`, {
        description: `Um link foi enviado para ${email}.`,
      });
    } catch (err: any) {
      toast.error("Erro ao enviar email de redefinição.", {
        description: err.message,
      });
    } finally {
      setResettingEmail(null);
    }
  };

  /* ─── Mark commission as paid ─── */
  const markAsPaid = async (id: string) => {
    const { error } = await supabase
      .from("commissions")
      .update({ status: "pago", paid_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar comissão.", { description: error.message });
      return;
    }

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
    toast.success("Comissão marcada como paga!");
  };

  /* ─── Update commission status ─── */
  const updateCommissionStatus = async (id: string, newStatus: CommissionStatus) => {
    const updateData: any = { status: newStatus };
    if (newStatus === "pago") {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("commissions")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status da comissão.", { description: error.message });
      return;
    }

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus, paidDate: newStatus === "pago" ? new Date().toISOString().split("T")[0] : c.paidDate }
          : c
      )
    );
    toast.success(`Status atualizado para "${newStatus}"!`);
  };

  /* ─── Edit photographer: populate form ─── */
  const handleEditPhotographer = useCallback((ph: Photographer) => {
    setForm({
      ...emptyForm,
      personType: ph.cnpj ? "PJ" : "PF",
      name: ph.name,
      email: ph.email,
      phone: ph.phone,
      instagram: ph.instagram,
      portfolioUrl: ph.portfolio_url,
      bio: ph.bio,
      valorPocket: ph.price_pocket?.toString() || "150.00",
      valorEstudio: ph.price_estudio?.toString() || "300.00",
      valorCompleta: ph.price_completa?.toString() || "500.00",
      commissionPct: ph.commission_pct?.toString() || "10.00",
      chavePix: ph.pix_key,
      cep: ph.cep,
      rua: ph.street,
      numero: ph.number,
      complemento: ph.complement,
      bairro: ph.neighborhood,
      cidade: ph.city,
      estado: ph.state,
      razaoSocial: ph.razao_social,
      nomeFantasia: ph.nome_fantasia,
      cnpj: ph.cnpj,
      bank: ph.bank || "",
      agency: ph.agency || "",
      account: ph.account || "",
      periodoInicio: ph.work_period_start || "",
      periodoFim: ph.work_period_end || "",
      segunda: ph.available_monday ? "Disponível" : "",
      terca: ph.available_tuesday ? "Disponível" : "",
      quarta: ph.available_wednesday ? "Disponível" : "",
      quinta: ph.available_thursday ? "Disponível" : "",
      sexta: ph.available_friday ? "Disponível" : "",
      sabado: ph.available_saturday ? "Disponível" : "",
      domingo: ph.available_sunday ? "Disponível" : "",
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

  /* ─── Toggle status ─── */
  const handleToggleStatus = async (ph: Photographer) => {
    const newStatus = ph.status === "ativo" ? "inativo" : "ativo";
    const { error } = await supabase
      .from("photographers")
      .update({ status: newStatus })
      .eq("id", ph.id);

    if (error) {
      toast.error("Erro ao alterar status.", { description: error.message });
      return;
    }

    setPhotographers((prev) =>
      prev.map((p) => (p.id === ph.id ? { ...p, status: newStatus } : p))
    );
    toast.success(`Fotógrafo "${ph.name}" agora está ${newStatus}.`);
  };

  /* ─── Delete photographer ─── */
  const handleConfirmDelete = useCallback(async () => {
    if (!deletePhotographer) return;

    const { error } = await supabase
      .from("photographers")
      .delete()
      .eq("id", deletePhotographer.id);

    if (error) {
      toast.error("Erro ao excluir fotógrafo.", { description: error.message });
      setDeletePhotographer(null);
      return;
    }

    setPhotographers((prev) => prev.filter((p) => p.id !== deletePhotographer.id));
    toast.success(`Fotógrafo "${deletePhotographer.name}" excluído com sucesso.`);
    setDeletePhotographer(null);
  }, [deletePhotographer, supabase]);

  /* ─── Save (create or edit) photographer ─── */
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      instagram: form.instagram.trim() || null,
      portfolio_url: form.portfolioUrl.trim() || null,
      bio: form.bio.trim() || null,
      status: form.ativo ? "ativo" : "inativo",
      /* Session pricing and commission are now global — managed in /admin/comissoes */
      cep: form.cep.trim() || null,
      street: form.rua.trim() || null,
      number: form.numero.trim() || null,
      complement: form.complemento.trim() || null,
      neighborhood: form.bairro.trim() || null,
      city: form.cidade.trim() || null,
      state: form.estado.trim() || null,
      razao_social: form.razaoSocial.trim() || null,
      nome_fantasia: form.nomeFantasia.trim() || null,
      cnpj: form.cnpj.trim() || null,
      bank: form.bank?.trim() || null,
      agency: form.agency?.trim() || null,
      account: form.account?.trim() || null,
      pix_key: form.chavePix.trim() || null,
      work_period_start: form.periodoInicio || null,
      work_period_end: form.periodoFim || null,
      available_monday: !!form.segunda,
      available_tuesday: !!form.terca,
      available_wednesday: !!form.quarta,
      available_thursday: !!form.quinta,
      available_friday: !!form.sexta,
      available_saturday: !!form.sabado,
      available_sunday: !!form.domingo,
    };

    try {
      if (editPhotographer) {
        const { error } = await supabase
          .from("photographers")
          .update(payload)
          .eq("id", editPhotographer.id);

        if (error) throw error;

        toast.success(`Fotógrafo "${form.name}" atualizado com sucesso!`);
      } else {
        const { error } = await supabase
          .from("photographers")
          .insert(payload);

        if (error) throw error;

        toast.success(`Fotógrafo "${form.name}" cadastrado com sucesso!`);
      }

      handleCloseForm();
      await fetchPhotographers();
    } catch (err: any) {
      toast.error(editPhotographer ? "Erro ao atualizar." : "Erro ao cadastrar.", {
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = useCallback(() => {
    setShowNewForm(false);
    setEditPhotographer(null);
    setForm(emptyForm);
  }, []);

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary/60" />
        <p className="text-sm text-muted-foreground">Carregando fotógrafos...</p>
      </div>
    );
  }

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
              {formatCurrency(valorPendente)}
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
                    {filteredPhotographers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center">
                          <Users className="mx-auto size-8 text-muted-foreground/40" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            {searchTerm
                              ? "Nenhum fotógrafo encontrado com os filtros atuais."
                              : "Nenhum fotógrafo cadastrado ainda. Clique em \"Novo Fotografo\" para começar."}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
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
                              title="Resetar senha do fotógrafo"
                              disabled={resettingEmail === ph.email}
                              onClick={() => setResetTarget({ email: ph.email, name: ph.name })}
                            >
                              {resettingEmail === ph.email ? (
                                <Loader2 className="size-3.5 animate-spin text-amber-600" />
                              ) : (
                                <KeyRound className="size-3.5 text-amber-600" />
                              )}
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
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                    Processando
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {commissions.filter((c) => c.status === "processando").length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Pendente
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {formatCurrency(valorPendente)}
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
                      <option value="processando">Processando</option>
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
                              <span>Receita: {formatCurrency(commission.revenue)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">
                                {formatCurrency(commission.commissionValue)}
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
                                  Periodo
                                </p>
                                <p className="mt-0.5 text-sm text-foreground">
                                  {commission.month}
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
                                  Criado em
                                </p>
                                <p className="mt-0.5 text-sm text-foreground">
                                  {commission.created_at ? formatDate(commission.created_at) : "—"}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2 border-t border-border pt-3">
                              {commission.status === "pendente" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCommissionStatus(commission.id, "processando");
                                    }}
                                  >
                                    <Loader2 className="size-3.5" />
                                    Marcar como Processando
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsPaid(commission.id);
                                    }}
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                    Marcar como Pago
                                  </Button>
                                </>
                              )}
                              {commission.status === "processando" && (
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
                {/* Commission — read-only, managed in /admin/comissoes */}
                <div className="sm:col-span-2 rounded-lg border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Comissao por Sessao (definida em Comissoes)
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        { label: "Pocket", spKey: "pocket" as const },
                        { label: "Estudio", spKey: "estudio" as const },
                        { label: "Completa", spKey: "completa" as const },
                      ] as const
                    ).map((item) => (
                      <div key={item.spKey} className="rounded-md border bg-white p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-bold text-[#8b5e5e]">
                          {globalRates
                            ? `R$ ${globalRates.photographer[item.spKey].toFixed(2).replace(".", ",")}`
                            : "..."}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Para alterar esses valores, acesse{" "}
                    <a href="/admin/comissoes" className="text-[#8b5e5e] underline">
                      Admin &gt; Comissoes
                    </a>
                  </p>
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
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {editPhotographer ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
