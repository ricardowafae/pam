"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ShieldBan,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  UserX,
  Calendar,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface BlacklistEntry {
  id: string;
  cpf_cnpj: string;
  name: string;
  email: string | null;
  phone: string | null;
  rg: string | null;
  address: string | null;
  reason: string | null;
  blocked_by: string;
  created_at: string;
  updated_at: string;
}

/* ────────────────────── Helpers ────────────────────── */

function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ────────────────────── Page ────────────────────── */

export default function BlacklistPage() {
  const supabase = createClient();

  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New entry form
  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCpfCnpj, setNewCpfCnpj] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRg, setNewRg] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newReason, setNewReason] = useState("");

  // Delete confirmation
  const [deleteEntry, setDeleteEntry] = useState<BlacklistEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_blacklist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar blacklist", {
        description: error.message,
      });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filtered = entries.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.cpf_cnpj.includes(searchTerm.replace(/\D/g, "")) ||
      (e.email && e.email.toLowerCase().includes(term)) ||
      (e.rg && e.rg.includes(term))
    );
  });

  const resetForm = () => {
    setNewName("");
    setNewCpfCnpj("");
    setNewEmail("");
    setNewPhone("");
    setNewRg("");
    setNewAddress("");
    setNewReason("");
  };

  const handleAdd = async () => {
    const cleanCpf = newCpfCnpj.replace(/\D/g, "");
    if (!newName.trim() || !cleanCpf) {
      toast.error("Nome e CPF/CNPJ sao obrigatorios");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("customer_blacklist").insert({
      name: newName.trim(),
      cpf_cnpj: cleanCpf,
      email: newEmail.trim() || null,
      phone: newPhone.trim() || null,
      rg: newRg.trim() || null,
      address: newAddress.trim() || null,
      reason: newReason.trim() || null,
      blocked_by: "admin",
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("CPF/CNPJ ja esta na blacklist");
      } else {
        toast.error("Erro ao adicionar", { description: error.message });
      }
    } else {
      toast.success(`${newName} adicionado a blacklist`);
      setShowNewModal(false);
      resetForm();
      fetchEntries();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;
    setDeleting(true);

    const { error } = await supabase
      .from("customer_blacklist")
      .delete()
      .eq("id", deleteEntry.id);

    if (error) {
      toast.error("Erro ao remover", { description: error.message });
    } else {
      toast.success(`${deleteEntry.name} removido da blacklist`);
      setDeleteEntry(null);
      fetchEntries();
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldBan className="size-6 text-red-600" />
            Blacklist
          </h1>
          <p className="text-sm text-muted-foreground">
            Clientes bloqueados de realizar compras e contato
          </p>
        </div>

        <Dialog
          open={showNewModal}
          onOpenChange={(open) => {
            setShowNewModal(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700">
            <Plus className="size-4" />
            Adicionar a Blacklist
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="size-5 text-red-600" />
                Adicionar a Blacklist
              </DialogTitle>
              <DialogDescription>
                O cliente sera bloqueado de realizar compras na plataforma.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid gap-1">
                <Label className="text-xs">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label className="text-xs">
                    CPF/CNPJ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newCpfCnpj}
                    onChange={(e) => setNewCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">RG</Label>
                  <Input
                    value={newRg}
                    onChange={(e) => setNewRg(e.target.value)}
                    placeholder="RG (opcional)"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Email (opcional)"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Telefone (opcional)"
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label className="text-xs">Endereco</Label>
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Endereco completo (opcional)"
                />
              </div>

              <div className="grid gap-1">
                <Label className="text-xs">Motivo do Bloqueio</Label>
                <Input
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Ex: Fraude, chargeback, etc."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="gap-2 bg-red-600 hover:bg-red-700"
                onClick={handleAdd}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Bloquear Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-medium">Area restrita ao Administrador</p>
          <p className="mt-1 text-red-700">
            Clientes nesta lista serao automaticamente impedidos de realizar
            qualquer compra na plataforma. O bloqueio e feito pelo CPF/CNPJ.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {entries.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ultimo Bloqueio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {entries.length > 0
                ? formatDate(entries[0].created_at)
                : "Nenhum"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchTerm
                ? "Nenhum resultado encontrado"
                : "Nenhum cliente na blacklist"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead className="hidden md:table-cell">RG</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Endereco
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Motivo
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Bloqueado em
                  </TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShieldBan className="size-4 text-red-500 shrink-0" />
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          {entry.email && (
                            <p className="text-xs text-muted-foreground">
                              {entry.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCpfCnpj(entry.cpf_cnpj)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {entry.rg || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                      {entry.address || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700"
                      >
                        {entry.reason || "Bloqueio administrativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteEntry(entry)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteEntry}
        onOpenChange={(open) => !open && setDeleteEntry(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              Remover da Blacklist
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{deleteEntry?.name}</strong> da blacklist? Esta pessoa
              podera realizar compras novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteEntry(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Removendo..." : "Sim, Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
