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

/* ────────────────────── Types ────────────────────── */

interface MemberPermissions {
  analytics: boolean;
  clientes: boolean;
  comissoes: boolean;
  dashboard: boolean;
  usuarios: boolean;
  influenciadores: boolean;
  interacoes: boolean;
  dogbook: boolean;
  precos: boolean;
  sessoesFoto: boolean;
  fotolivros: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "Administrador" | "Equipe";
  active: boolean;
  permissions: MemberPermissions;
}

/* ────────────────────── Constants ────────────────────── */

const permissionModules: { key: keyof MemberPermissions; label: string }[] = [
  { key: "analytics", label: "Analytics" },
  { key: "clientes", label: "Clientes" },
  { key: "comissoes", label: "Comissões" },
  { key: "dashboard", label: "Dashboard" },
  { key: "usuarios", label: "Usuários" },
  { key: "influenciadores", label: "Influenciadores" },
  { key: "interacoes", label: "Interações" },
  { key: "dogbook", label: "Dogbook" },
  { key: "precos", label: "Preços" },
  { key: "sessoesFoto", label: "Sessões Foto" },
  { key: "fotolivros", label: "Fotolivros" },
];

const allPermissionsTrue: MemberPermissions = {
  analytics: true,
  clientes: true,
  comissoes: true,
  dashboard: true,
  usuarios: true,
  influenciadores: true,
  interacoes: true,
  dogbook: true,
  precos: true,
  sessoesFoto: true,
  fotolivros: true,
};

/* ────────────────────── Mock data ────────────────────── */

const initialMembers: TeamMember[] = [
  {
    id: 1,
    name: "ricardo.wafse",
    email: "ricardo.wafse@gmail.com",
    role: "Administrador",
    active: true,
    permissions: { ...allPermissionsTrue },
  },
  {
    id: 2,
    name: "teste.equipe",
    email: "teste.equipe@petasamor.com",
    role: "Equipe",
    active: true,
    permissions: {
      analytics: true,
      clientes: true,
      comissoes: true,
      dashboard: true,
      usuarios: false,
      influenciadores: true,
      interacoes: true,
      dogbook: true,
      precos: false,
      sessoesFoto: true,
      fotolivros: true,
    },
  },
  {
    id: 3,
    name: "maria.designer",
    email: "maria.designer@petasamor.com",
    role: "Equipe",
    active: false,
    permissions: {
      analytics: false,
      clientes: true,
      comissoes: false,
      dashboard: true,
      usuarios: false,
      influenciadores: false,
      interacoes: false,
      dogbook: true,
      precos: false,
      sessoesFoto: false,
      fotolivros: true,
    },
  },
];

/* ────────────────────── Page ────────────────────── */

export default function EquipePage() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [permDialogMember, setPermDialogMember] = useState<TeamMember | null>(
    null
  );
  const [deleteDialogMember, setDeleteDialogMember] =
    useState<TeamMember | null>(null);
  const [resetDialogMember, setResetDialogMember] =
    useState<TeamMember | null>(null);

  // New member form permissions state
  const [newMemberPerms, setNewMemberPerms] = useState<MemberPermissions>({
    analytics: true,
    clientes: true,
    comissoes: false,
    dashboard: true,
    usuarios: false,
    influenciadores: false,
    interacoes: false,
    dogbook: true,
    precos: false,
    sessoesFoto: true,
    fotolivros: true,
  });

  // Address fields state (for CEP auto-fill)
  const [newMemberCep, setNewMemberCep] = useState("");
  const [newMemberStreet, setNewMemberStreet] = useState("");
  const [newMemberComplement, setNewMemberComplement] = useState("");
  const [newMemberNeighborhood, setNewMemberNeighborhood] = useState("");
  const [newMemberCity, setNewMemberCity] = useState("");
  const [newMemberState, setNewMemberState] = useState("");

  const cepLookup = useCepLookup(
    useMemo(
      () => ({
        onSuccess: (data) => {
          setNewMemberStreet(data.logradouro || "");
          setNewMemberComplement(data.complemento || "");
          setNewMemberNeighborhood(data.bairro || "");
          setNewMemberCity(data.localidade || "");
          setNewMemberState(data.uf || "");
        },
      }),
      []
    )
  );

  const adminCount = members.filter((m) => m.role === "Administrador").length;
  const equipeCount = members.filter((m) => m.role === "Equipe").length;
  const activeCount = members.filter((m) => m.active).length;

  /* ─── Handlers ─── */

  const handleToggleActive = (id: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const handleDelete = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleteDialogMember(null);
  };

  const handlePermissionChange = (
    memberId: number,
    key: keyof MemberPermissions,
    value: boolean
  ) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, permissions: { ...m.permissions, [key]: value } }
          : m
      )
    );
  };

  /* ─── Member Card (shared between grid/list) ─── */

  const MemberActions = ({ member }: { member: TeamMember }) => (
    <div className="flex items-center gap-1.5">
      {/* Permissions */}
      {member.role === "Equipe" && (
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

      {/* Toggle Active - now handled directly in the card */}

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
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="acc-password">Senha *</Label>
                    <Input
                      id="acc-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Role</Label>
                    <Select defaultValue="Equipe">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">
                          Administrador
                        </SelectItem>
                        <SelectItem value="Equipe">Equipe</SelectItem>
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
                    <Input id="p-name" placeholder="Nome completo" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-birth">Data de Nascimento</Label>
                    <Input id="p-birth" type="date" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-cpf">CPF</Label>
                    <Input id="p-cpf" placeholder="000.000.000-00" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-rg">RG</Label>
                    <Input id="p-rg" placeholder="RG" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-phone">Telefone</Label>
                    <Input id="p-phone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="p-contact-email">Email de Contato</Label>
                    <Input
                      id="p-contact-email"
                      type="email"
                      placeholder="contato@email.com"
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
                    <Input id="w-start" type="date" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="w-end">Data de Fim</Label>
                    <Input id="w-end" type="date" />
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
                        value={newMemberCep}
                        onChange={(e) => setNewMemberCep(e.target.value)}
                        onBlur={() => cepLookup.fetchCep(newMemberCep)}
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
                      value={newMemberStreet}
                      onChange={(e) => setNewMemberStreet(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-1">
                    <Label htmlFor="a-number">Número</Label>
                    <Input id="a-number" placeholder="Nº" />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="a-complement">Complemento</Label>
                    <Input
                      id="a-complement"
                      placeholder="Apto, Sala..."
                      value={newMemberComplement}
                      onChange={(e) => setNewMemberComplement(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-3">
                    <Label htmlFor="a-neighborhood">Bairro</Label>
                    <Input
                      id="a-neighborhood"
                      placeholder="Bairro"
                      value={newMemberNeighborhood}
                      onChange={(e) => setNewMemberNeighborhood(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-4">
                    <Label htmlFor="a-city">Cidade</Label>
                    <Input
                      id="a-city"
                      placeholder="Cidade"
                      value={newMemberCity}
                      onChange={(e) => setNewMemberCity(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="a-state">Estado</Label>
                    <Input
                      id="a-state"
                      placeholder="UF"
                      value={newMemberState}
                      onChange={(e) => setNewMemberState(e.target.value)}
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
                    <Input id="b-bank" placeholder="Nome do banco" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-agency">Agência</Label>
                    <Input id="b-agency" placeholder="0000" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-account">Conta</Label>
                    <Input id="b-account" placeholder="00000-0" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="b-pix">Chave Pix</Label>
                    <Input
                      id="b-pix"
                      placeholder="CPF, email, telefone ou aleatória"
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
              >
                Cancelar
              </Button>
              <Button onClick={() => setAddDialogOpen(false)}>
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
          {viewMode === "grid" ? (
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
                      {member.id === 1 && (
                        <p className="text-xs text-muted-foreground">(você)</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!member.active && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                      <Badge
                        variant={
                          member.role === "Administrador"
                            ? "destructive"
                            : "default"
                        }
                        className="text-xs"
                      >
                        {member.role === "Administrador" ? (
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
                      onCheckedChange={() => handleToggleActive(member.id)}
                    />
                  </div>

                  {/* Individual permissions summary for Equipe */}
                  {member.role === "Equipe" && (
                    <div className="flex flex-wrap gap-1">
                      {permissionModules
                        .filter((mod) => member.permissions[mod.key])
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
                            member.role === "Administrador"
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {member.role}
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
                        onCheckedChange={() => handleToggleActive(member.id)}
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
                    checked={permDialogMember.permissions[mod.key]}
                    onCheckedChange={(checked) => {
                      handlePermissionChange(
                        permDialogMember.id,
                        mod.key,
                        !!checked
                      );
                      // Update the dialog state too
                      setPermDialogMember((prev) =>
                        prev
                          ? {
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [mod.key]: !!checked,
                              },
                            }
                          : null
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
            >
              Cancelar
            </Button>
            <Button onClick={() => setResetDialogMember(null)}>
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
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDialogMember && handleDelete(deleteDialogMember.id)
              }
            >
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
