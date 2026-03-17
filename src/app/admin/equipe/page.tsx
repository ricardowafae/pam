"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Shield,
  Users,
  Key,
  Trash2,
  LayoutGrid,
  List,
  Lock,
  Mail,
  Power,
  PowerOff,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useCepLookup } from "@/hooks/useCepLookup";
import { createClient } from "@/lib/supabase/client";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import type { TeamMember } from "@/types";

/* ────────────────────── Permission mapping ────────────────────── */

/** Maps UI keys to database column names */
const permissionModules: {
  key: keyof typeof permKeyToColumn;
  label: string;
}[] = [
  { key: "analytics", label: "Analytics" },
  { key: "clientes", label: "Clientes" },
  { key: "sessoes", label: "Sessões" },
  { key: "pedidos", label: "Pedidos" },
  { key: "galeria", label: "Galeria" },
  { key: "dashboard", label: "Dashboard" },
  { key: "influenciadores", label: "Influenciadores" },
  { key: "fotografos", label: "Fotógrafos" },
  { key: "precos", label: "Preços" },
  { key: "equipe", label: "Equipe" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "conversao", label: "Conversão" },
];

const permKeyToColumn: Record<string, keyof TeamMember> = {
  analytics: "perm_analytics",
  clientes: "perm_clientes",
  sessoes: "perm_sessoes",
  pedidos: "perm_pedidos",
  galeria: "perm_galeria",
  dashboard: "perm_dashboard",
  influenciadores: "perm_influenciadores",
  fotografos: "perm_fotografos",
  precos: "perm_precos",
  equipe: "perm_equipe",
  comunicacao: "perm_comunicacao",
  conversao: "perm_conversao",
};

type PermKey = keyof typeof permKeyToColumn;

/** Get a permission value from a TeamMember */
function getMemberPerm(member: TeamMember, key: PermKey): boolean {
  return !!member[permKeyToColumn[key] as keyof TeamMember];
}

/* ────────────────────── Default new member permissions ────────────────────── */

const defaultNewPerms: Record<PermKey, boolean> = {
  analytics: true,
  clientes: true,
  sessoes: true,
  pedidos: false,
  galeria: true,
  dashboard: true,
  influenciadores: false,
  fotografos: false,
  precos: false,
  equipe: false,
  comunicacao: false,
  conversao: false,
};

/* ────────────────────── Empty form state ────────────────────── */

interface NewMemberForm {
  email: string;
  password: string;
  name: string;
  role: "admin" | "equipe";
  phone: string;
  cpf: string;
  rg: string;
  birth_date: string;
  work_start_date: string;
  work_end_date: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  bank: string;
  agency: string;
  account: string;
  pix_key: string;
}

const emptyForm: NewMemberForm = {
  email: "",
  password: "",
  name: "",
  role: "equipe",
  phone: "",
  cpf: "",
  rg: "",
  birth_date: "",
  work_start_date: "",
  work_end_date: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  bank: "",
  agency: "",
  account: "",
  pix_key: "",
};

/* ────────────────────── Page ────────────────────── */

export default function EquipePage() {
  const supabase = useMemo(() => createClient(), []);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [permDialogMember, setPermDialogMember] = useState<TeamMember | null>(
    null
  );
  const [deleteDialogMember, setDeleteDialogMember] =
    useState<TeamMember | null>(null);
  const [resetDialogMember, setResetDialogMember] =
    useState<TeamMember | null>(null);

  // Loading states for specific operations
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [updatingPermId, setUpdatingPermId] = useState<string | null>(null);

  // New member form state
  const [form, setForm] = useState<NewMemberForm>({ ...emptyForm });
  const [newMemberPerms, setNewMemberPerms] = useState<Record<PermKey, boolean>>({
    ...defaultNewPerms,
  });

  const updateForm = useCallback(
    (field: keyof NewMemberForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // CEP auto-fill for new member form
  const cepLookup = useCepLookup(
    useMemo(
      () => ({
        onSuccess: (data) => {
          setForm((prev) => ({
            ...prev,
            street: data.logradouro || "",
            complement: data.complemento || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        },
      }),
      []
    )
  );

  /* ─── Fetch members ─── */

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
      toast.error("Erro ao carregar membros da equipe.");
    } else {
      setMembers(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ─── KPI computed values ─── */

  const adminCount = members.filter((m) => m.role === "admin").length;
  const equipeCount = members.filter((m) => m.role === "equipe").length;
  const activeCount = members.filter((m) => m.active).length;

  /* ─── Handlers ─── */

  const handleToggleActive = async (member: TeamMember) => {
    setTogglingId(member.id);
    const newActive = !member.active;

    const { error } = await supabase
      .from("team_members")
      .update({ active: newActive })
      .eq("id", member.id);

    if (error) {
      toast.error("Erro ao alterar status do membro.");
      console.error(error);
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, active: newActive } : m
        )
      );
      toast.success(
        newActive ? "Membro ativado com sucesso." : "Membro desativado."
      );
    }
    setTogglingId(null);
  };

  const handleDelete = async (member: TeamMember) => {
    setDeleting(true);
    try {
      const res = await adminFetch("/api/admin/delete-team-member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Erro ao excluir membro.");
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        toast.success("Membro excluído com sucesso.");
      }
    } catch {
      toast.error("Erro de conexão ao excluir membro.");
    }
    setDeleting(false);
    setDeleteDialogMember(null);
  };

  const handlePermissionChange = async (
    member: TeamMember,
    key: PermKey,
    value: boolean
  ) => {
    const column = permKeyToColumn[key] as string;
    setUpdatingPermId(member.id);

    const { error } = await supabase
      .from("team_members")
      .update({ [column]: value })
      .eq("id", member.id);

    if (error) {
      toast.error("Erro ao atualizar permissão.");
      console.error(error);
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, [column]: value } : m
        )
      );
      // Also update the dialog member state
      setPermDialogMember((prev) =>
        prev && prev.id === member.id
          ? { ...prev, [column]: value }
          : prev
      );
    }
    setUpdatingPermId(null);
  };

  const handleResetPassword = async (member: TeamMember) => {
    setResetting(true);
    try {
      const res = await adminFetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: member.email }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Erro ao enviar email de reset.");
      } else {
        toast.success("Email de redefinição de senha enviado!");
      }
    } catch {
      toast.error("Erro de conexão ao resetar senha.");
    }
    setResetting(false);
    setResetDialogMember(null);
  };

  const handleAddMember = async () => {
    if (!form.email || !form.password || !form.name) {
      toast.error("Email, senha e nome são obrigatórios.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSaving(true);

    // Build permission fields
    const permFields: Record<string, boolean> = {};
    for (const mod of permissionModules) {
      permFields[permKeyToColumn[mod.key] as string] =
        newMemberPerms[mod.key];
    }

    try {
      const res = await adminFetch("/api/admin/create-team-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
          active: true,
          phone: form.phone || null,
          cpf: form.cpf || null,
          rg: form.rg || null,
          birth_date: form.birth_date || null,
          work_start_date: form.work_start_date || null,
          work_end_date: form.work_end_date || null,
          cep: form.cep || null,
          street: form.street || null,
          number: form.number || null,
          complement: form.complement || null,
          neighborhood: form.neighborhood || null,
          city: form.city || null,
          state: form.state || null,
          bank: form.bank || null,
          agency: form.agency || null,
          account: form.account || null,
          pix_key: form.pix_key || null,
          ...permFields,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Erro ao criar membro.");
      } else {
        toast.success("Membro adicionado com sucesso!");
        if (result.member) {
          setMembers((prev) => [...prev, result.member]);
        } else {
          // Refetch to be safe
          await fetchMembers();
        }
        setAddDialogOpen(false);
        setForm({ ...emptyForm });
        setNewMemberPerms({ ...defaultNewPerms });
      }
    } catch {
      toast.error("Erro de conexão ao criar membro.");
    }

    setSaving(false);
  };

  /* ─── Member Card Actions ─── */

  const MemberActions = ({ member }: { member: TeamMember }) => (
    <div className="flex items-center gap-1.5">
      {/* Permissions */}
      {member.role === "equipe" && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={() => setPermDialogMember(member)}
        >
          <Settings className="size-3" />
          Permissões
        </Button>
      )}

      {/* Reset Password */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title="Resetar senha"
        onClick={() => setResetDialogMember(member)}
      >
        <Key className="size-3.5 text-muted-foreground" />
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title="Excluir membro"
        onClick={() => setDeleteDialogMember(member)}
      >
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );

  /* ─── Loading state ─── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Carregando equipe...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ════════════════════ Header ════════════════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Gestão de Equipe
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie usuários, permissões e acessos
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            <Lock className="mr-1 inline size-3" />
            Visível apenas para Administradores
          </p>
        </div>

        {/* ─── Add Member Dialog ─── */}
        <Dialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) {
              setForm({ ...emptyForm });
              setNewMemberPerms({ ...defaultNewPerms });
            }
          }}
        >
          <DialogTrigger className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            Adicionar Membro
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                Adicionar Membro da Equipe
              </DialogTitle>
              <DialogDescription>
                Cadastre um novo membro com todos os dados necessários.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* ─── Dados de Acesso ─── */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Dados de Acesso
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="acc-email">Email *</Label>
                    <Input
                      id="acc-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="acc-password">Senha *</Label>
                    <Input
                      id="acc-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) =>
                        updateForm("role", v as "admin" | "equipe")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="equipe">Equipe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Dados Pessoais ─── */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="p-name">Nome Completo *</Label>
                    <Input
                      id="p-name"
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-birth">Data de Nascimento</Label>
                    <Input
                      id="p-birth"
                      type="date"
                      value={form.birth_date}
                      onChange={(e) =>
                        updateForm("birth_date", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-cpf">CPF</Label>
                    <Input
                      id="p-cpf"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={(e) => updateForm("cpf", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-rg">RG</Label>
                    <Input
                      id="p-rg"
                      placeholder="RG"
                      value={form.rg}
                      onChange={(e) => updateForm("rg", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-phone">Telefone</Label>
                    <Input
                      id="p-phone"
                      placeholder="(00) 00000-0000"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Período de Trabalho ─── */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Período de Trabalho
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="w-start">Data de Início</Label>
                    <Input
                      id="w-start"
                      type="date"
                      value={form.work_start_date}
                      onChange={(e) =>
                        updateForm("work_start_date", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="w-end">Data de Fim</Label>
                    <Input
                      id="w-end"
                      type="date"
                      value={form.work_end_date}
                      onChange={(e) =>
                        updateForm("work_end_date", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Endereço ─── */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="a-cep">CEP</Label>
                    <div className="relative">
                      <Input
                        id="a-cep"
                        placeholder="00000-000"
                        value={form.cep}
                        onChange={(e) => updateForm("cep", e.target.value)}
                        onBlur={() => cepLookup.fetchCep(form.cep)}
                      />
                      {cepLookup.loading && (
                        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-1.5 sm:col-span-4">
                    <Label htmlFor="a-street">Logradouro</Label>
                    <Input
                      id="a-street"
                      placeholder="Rua, Avenida..."
                      value={form.street}
                      onChange={(e) => updateForm("street", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-1">
                    <Label htmlFor="a-number">Número</Label>
                    <Input
                      id="a-number"
                      placeholder="Nº"
                      value={form.number}
                      onChange={(e) => updateForm("number", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="a-complement">Complemento</Label>
                    <Input
                      id="a-complement"
                      placeholder="Apto, Sala..."
                      value={form.complement}
                      onChange={(e) =>
                        updateForm("complement", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-3">
                    <Label htmlFor="a-neighborhood">Bairro</Label>
                    <Input
                      id="a-neighborhood"
                      placeholder="Bairro"
                      value={form.neighborhood}
                      onChange={(e) =>
                        updateForm("neighborhood", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-4">
                    <Label htmlFor="a-city">Cidade</Label>
                    <Input
                      id="a-city"
                      placeholder="Cidade"
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="a-state">Estado</Label>
                    <Input
                      id="a-state"
                      placeholder="UF"
                      value={form.state}
                      onChange={(e) => updateForm("state", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Documentos ─── */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Documentos
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Foto de Documento</Label>
                    <Input type="file" className="text-sm" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Contrato de Trabalho</Label>
                    <Input type="file" className="text-sm" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Dados Bancários ─── */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Dados Bancários
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-bank">Banco</Label>
                    <Input
                      id="b-bank"
                      placeholder="Nome do banco"
                      value={form.bank}
                      onChange={(e) => updateForm("bank", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-agency">Agência</Label>
                    <Input
                      id="b-agency"
                      placeholder="0000"
                      value={form.agency}
                      onChange={(e) => updateForm("agency", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-account">Conta</Label>
                    <Input
                      id="b-account"
                      placeholder="00000-0"
                      value={form.account}
                      onChange={(e) => updateForm("account", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-pix">Chave Pix</Label>
                    <Input
                      id="b-pix"
                      placeholder="CPF, email, telefone ou aleatória"
                      value={form.pix_key}
                      onChange={(e) => updateForm("pix_key", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─── Permissões Individuais ─── */}
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  Permissões de Acesso
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Defina quais módulos este membro poderá acessar
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {permissionModules.map((mod) => (
                    <div
                      key={mod.key}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <Label className="text-sm">{mod.label}</Label>
                      <Switch
                        checked={newMemberPerms[mod.key]}
                        onCheckedChange={(checked) =>
                          setNewMemberPerms((prev) => ({
                            ...prev,
                            [mod.key]: !!checked,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddMember} disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Adicionar Membro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ════════════════════ KPI Cards ════════════════════ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="text-3xl font-bold text-foreground">{adminCount}</p>
            </div>
            <Shield className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Equipe</p>
              <p className="text-3xl font-bold text-foreground">
                {equipeCount}
              </p>
            </div>
            <Users className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-3xl font-bold text-foreground">
                {activeCount}
              </p>
            </div>
            <Power className="size-8 text-green-500/40" />
          </CardContent>
        </Card>
      </div>

      {/* ════════════════════ Members List ════════════════════ */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-serif text-foreground">
              Admins &amp; Equipe
            </CardTitle>
            <CardDescription>
              Usuários com acesso administrativo
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 size-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum membro cadastrado
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Clique em &quot;Adicionar Membro&quot; para começar.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`rounded-xl border p-5 space-y-3 transition-colors ${
                    member.active
                      ? "border-border"
                      : "border-border/50 bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {member.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!member.active && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          Inativo
                        </Badge>
                      )}
                      <Badge
                        variant={
                          member.role === "admin" ? "destructive" : "default"
                        }
                        className="text-xs"
                      >
                        {member.role === "admin" ? (
                          <>
                            <Shield className="mr-1 size-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Users className="mr-1 size-3" />
                            Equipe
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="size-3.5" />
                    {member.email}
                  </div>

                  {/* Activate / Deactivate toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="flex items-center gap-2">
                      {member.active ? (
                        <Power className="size-4 text-green-600" />
                      ) : (
                        <PowerOff className="size-4 text-muted-foreground" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          member.active
                            ? "text-green-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {member.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <Switch
                      checked={member.active}
                      disabled={togglingId === member.id}
                      onCheckedChange={() => handleToggleActive(member)}
                    />
                  </div>

                  {/* Individual permissions summary for Equipe */}
                  {member.role === "equipe" && (
                    <div className="flex flex-wrap gap-1">
                      {permissionModules
                        .filter((mod) => getMemberPerm(member, mod.key))
                        .map((mod) => (
                          <span
                            key={mod.key}
                            className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                          >
                            {mod.label}
                          </span>
                        ))}
                    </div>
                  )}

                  <MemberActions member={member} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                    member.active
                      ? "border-border"
                      : "border-border/50 bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {member.name}
                        </p>
                        <Badge
                          variant={
                            member.role === "admin" ? "destructive" : "default"
                          }
                          className="text-xs"
                        >
                          {member.role === "admin"
                            ? "Administrador"
                            : "Equipe"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Activate / Deactivate toggle */}
                    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
                      {member.active ? (
                        <Power className="size-3.5 text-green-600" />
                      ) : (
                        <PowerOff className="size-3.5 text-muted-foreground" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          member.active
                            ? "text-green-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {member.active ? "Ativo" : "Inativo"}
                      </span>
                      <Switch
                        checked={member.active}
                        disabled={togglingId === member.id}
                        onCheckedChange={() => handleToggleActive(member)}
                      />
                    </div>
                    <MemberActions member={member} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ════════════════════ Permissions Dialog (per member) ════════════════════ */}
      <Dialog
        open={!!permDialogMember}
        onOpenChange={(open) => !open && setPermDialogMember(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Permissões de {permDialogMember?.name}
            </DialogTitle>
            <DialogDescription>
              Defina quais módulos este membro pode acessar. Alterações são
              aplicadas imediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {permDialogMember &&
              permissionModules.map((mod) => (
                <div
                  key={mod.key}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
                >
                  <Label className="text-sm font-medium">{mod.label}</Label>
                  <Switch
                    checked={getMemberPerm(permDialogMember, mod.key)}
                    disabled={updatingPermId === permDialogMember.id}
                    onCheckedChange={(checked) => {
                      handlePermissionChange(
                        permDialogMember,
                        mod.key,
                        !!checked
                      );
                    }}
                  />
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setPermDialogMember(null)}>
              Concluído
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Reset Password Dialog ════════════════════ */}
      <Dialog
        open={!!resetDialogMember}
        onOpenChange={(open) => !open && setResetDialogMember(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Resetar Senha</DialogTitle>
            <DialogDescription>
              Um email de redefinição de senha será enviado para{" "}
              <strong>{resetDialogMember?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
            <Key className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">
                O membro receberá um link para criar uma nova senha.
              </p>
              <p className="mt-1 text-xs text-amber-600">
                O link expira em 24 horas.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setResetDialogMember(null)}
              disabled={resetting}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                resetDialogMember && handleResetPassword(resetDialogMember)
              }
              disabled={resetting}
            >
              {resetting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Enviar Email de Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Delete Confirmation Dialog ════════════════════ */}
      <Dialog
        open={!!deleteDialogMember}
        onOpenChange={(open) => !open && setDeleteDialogMember(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-destructive">
              Excluir Membro
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteDialogMember?.name}</strong>? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-lg bg-destructive/5 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Ação irreversível</p>
              <p className="mt-1 text-xs text-muted-foreground">
                O membro perderá todo o acesso ao sistema. Todos os dados
                associados serão removidos.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogMember(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() =>
                deleteDialogMember && handleDelete(deleteDialogMember)
              }
            >
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
