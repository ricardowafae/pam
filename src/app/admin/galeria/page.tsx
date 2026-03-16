"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Camera,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/* ────────────────────── Types ────────────────────── */

type PermissionStatus = "pendente" | "solicitada" | "aprovada" | "recusada";

interface GalleryPhoto {
  id: string;
  customer_id: string;
  dogbook_id: string | null;
  storage_path: string;
  url: string;
  file_name: string;
  file_size: number;
  pet_name: string;
  favorited: boolean;
  permission_status: PermissionStatus;
  permission_requested_at: string | null;
  uploaded_at: string;
  customers: {
    name: string;
    phone: string;
  } | null;
  dogbooks: {
    sub_number: string;
    theme: string;
  } | null;
}

/* ────────────────────── Helpers ────────────────────── */

const statusLabels: Record<PermissionStatus, string> = {
  pendente: "Pendente",
  solicitada: "Solicitada",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

const statusBadgeVariant: Record<PermissionStatus, "default" | "outline" | "secondary" | "destructive"> = {
  pendente: "outline",
  solicitada: "secondary",
  aprovada: "default",
  recusada: "destructive",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ────────────────────── Component ────────────────────── */

export default function GaleriaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [favoritedFilter, setFavoritedFilter] = useState("all");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const supabase = useMemo(() => createClient(), []);

  /* ────── Fetch ────── */

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_photos")
      .select(
        `
        *,
        customers ( name, phone ),
        dogbooks ( sub_number, theme )
        `
      )
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar galeria: " + error.message);
      setLoading(false);
      return;
    }

    setPhotos((data as GalleryPhoto[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  /* ────── Filters ────── */

  const filteredItems = useMemo(() => {
    return photos.filter((photo) => {
      const clientName = photo.customers?.name ?? "";
      const petName = photo.pet_name ?? "";
      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || photo.permission_status === statusFilter;

      const matchesFavorited =
        favoritedFilter === "all" ||
        (favoritedFilter === "favorited" && photo.favorited) ||
        (favoritedFilter === "not_favorited" && !photo.favorited);

      return matchesSearch && matchesStatus && matchesFavorited;
    });
  }, [photos, searchTerm, statusFilter, favoritedFilter]);

  /* ────── KPI data ────── */

  const kpis = useMemo(() => {
    const total = photos.length;
    const pending = photos.filter((p) => p.permission_status === "pendente").length;
    const requested = photos.filter((p) => p.permission_status === "solicitada").length;
    const approved = photos.filter((p) => p.permission_status === "aprovada").length;
    const rejected = photos.filter((p) => p.permission_status === "recusada").length;
    const favorited = photos.filter((p) => p.favorited).length;
    return { total, pending, requested, approved, rejected, favorited };
  }, [photos]);

  /* ────── Actions ────── */

  const addUpdating = (id: string) =>
    setUpdatingIds((prev) => new Set(prev).add(id));
  const removeUpdating = (id: string) =>
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const handleToggleFavorite = useCallback(
    async (photo: GalleryPhoto) => {
      const newFavorited = !photo.favorited;
      const clientName = photo.customers?.name ?? "Cliente";

      addUpdating(photo.id);
      const { error } = await supabase
        .from("gallery_photos")
        .update({ favorited: newFavorited })
        .eq("id", photo.id);

      removeUpdating(photo.id);

      if (error) {
        toast.error("Erro ao atualizar favorito: " + error.message);
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, favorited: newFavorited } : p
        )
      );
      toast.success(
        newFavorited
          ? `Foto de ${photo.pet_name} (${clientName}) adicionada aos favoritos!`
          : `Foto de ${photo.pet_name} (${clientName}) removida dos favoritos.`
      );
    },
    [supabase]
  );

  const handleUpdatePermission = useCallback(
    async (photo: GalleryPhoto, newStatus: PermissionStatus) => {
      const clientName = photo.customers?.name ?? "Cliente";

      addUpdating(photo.id);
      const { error } = await supabase
        .from("gallery_photos")
        .update({ permission_status: newStatus })
        .eq("id", photo.id);

      removeUpdating(photo.id);

      if (error) {
        toast.error("Erro ao atualizar status: " + error.message);
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, permission_status: newStatus } : p
        )
      );

      const label = statusLabels[newStatus];
      toast.success(
        `Foto de ${photo.pet_name} (${clientName}): status alterado para "${label}".`
      );
    },
    [supabase]
  );

  const handleSolicitarPermissao = useCallback(
    async (photo: GalleryPhoto) => {
      const clientName = photo.customers?.name ?? "Cliente";
      const phone = photo.customers?.phone ?? "";

      if (!phone) {
        toast.error("Telefone do cliente nao encontrado.");
        return;
      }

      const message = encodeURIComponent(
        `Ola ${clientName}!\n\n` +
          `Aqui e a equipe da *Patas, Amor e Memorias*.\n\n` +
          `As fotos do(a) *${photo.pet_name}* estao incriveis! ` +
          `Gostariamos de solicitar sua autorizacao para compartilharmos as imagens ` +
          `em nosso site e redes sociais.\n\n` +
          `As fotos serao usadas exclusivamente em nossa querida caomunidade ` +
          `para continuar espalhando amor uma foto de cada vez, ` +
          `e sempre com carinho e respeito.\n\n` +
          `Podemos contar com sua autorizacao?\n` +
          `Desde ja, nosso muitissimo obrigado por fazer parte desse projeto!`
      );
      const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
      window.open(whatsappUrl, "_blank");

      // Update status to "solicitada" and record timestamp
      addUpdating(photo.id);
      const { error } = await supabase
        .from("gallery_photos")
        .update({
          permission_status: "solicitada" as PermissionStatus,
          permission_requested_at: new Date().toISOString(),
        })
        .eq("id", photo.id);

      removeUpdating(photo.id);

      if (error) {
        toast.error("Erro ao atualizar status: " + error.message);
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? {
                ...p,
                permission_status: "solicitada" as PermissionStatus,
                permission_requested_at: new Date().toISOString(),
              }
            : p
        )
      );

      toast.success(
        `Solicitacao de permissao enviada para ${clientName} via WhatsApp.`
      );
    },
    [supabase]
  );

  /* ────── Render ────── */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#8b5e5e]">
          Galeria
        </h1>
        <p className="text-sm text-[#6b4c4c]">
          Feed de fotos dos clientes e pets
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Camera className="size-5 text-[#8b5e5e]" />
            <div>
              <p className="text-xs text-[#6b4c4c]/70">Total</p>
              <p className="text-lg font-bold text-[#6b4c4c]">
                {loading ? "-" : kpis.total}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Clock className="size-5 text-yellow-600" />
            <div>
              <p className="text-xs text-[#6b4c4c]/70">Pendentes</p>
              <p className="text-lg font-bold text-[#6b4c4c]">
                {loading ? "-" : kpis.pending}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <ExternalLink className="size-5 text-blue-500" />
            <div>
              <p className="text-xs text-[#6b4c4c]/70">Solicitadas</p>
              <p className="text-lg font-bold text-[#6b4c4c]">
                {loading ? "-" : kpis.requested}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <CheckCircle2 className="size-5 text-green-600" />
            <div>
              <p className="text-xs text-[#6b4c4c]/70">Aprovadas</p>
              <p className="text-lg font-bold text-[#6b4c4c]">
                {loading ? "-" : kpis.approved}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <XCircle className="size-5 text-red-500" />
            <div>
              <p className="text-xs text-[#6b4c4c]/70">Recusadas</p>
              <p className="text-lg font-bold text-[#6b4c4c]">
                {loading ? "-" : kpis.rejected}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Star className="size-5 text-amber-500" />
            <div>
              <p className="text-xs text-[#6b4c4c]/70">Favoritas</p>
              <p className="text-lg font-bold text-[#6b4c4c]">
                {loading ? "-" : kpis.favorited}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#6b4c4c]" />
          <Input
            placeholder="Buscar por cliente ou pet..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="solicitada">Solicitada</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="recusada">Recusada</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={favoritedFilter}
          onValueChange={(val) => setFavoritedFilter(val ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Favoritos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="favorited">Favoritos</SelectItem>
            <SelectItem value="not_favorited">Nao favoritos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
          <p className="mt-3 text-sm text-[#6b4c4c]">Carregando galeria...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <ImageIcon className="size-16 text-[#c4a0a0]" />
          <p className="mt-4 text-lg font-medium text-[#6b4c4c]">
            Nenhuma foto encontrada
          </p>
          <p className="mt-1 text-sm text-[#6b4c4c]/70">
            {photos.length === 0
              ? "A galeria ainda nao possui fotos."
              : "Tente ajustar os filtros de busca."}
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((photo) => {
            const clientName = photo.customers?.name ?? "Cliente desconhecido";
            const isUpdating = updatingIds.has(photo.id);

            return (
              <Card key={photo.id} className="overflow-hidden">
                {/* Photo / Image */}
                {photo.url ? (
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#e8d4d4] to-[#fdf8f4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`Foto de ${photo.pet_name}`}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                    {photo.favorited && (
                      <div className="absolute right-2 top-2">
                        <Heart className="size-5 fill-red-500 text-red-500 drop-shadow" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#e8d4d4] to-[#fdf8f4]">
                    <ImageIcon className="size-16 text-[#c4a0a0]" />
                  </div>
                )}
                <CardContent className="pt-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[#6b4c4c]">
                        {clientName}
                      </p>
                      <p className="text-xs text-[#6b4c4c]/70">
                        Pet: {photo.pet_name}
                      </p>
                      {photo.dogbooks && (
                        <p className="text-xs text-[#6b4c4c]/50">
                          Dogbook: {photo.dogbooks.theme} (#{photo.dogbooks.sub_number})
                        </p>
                      )}
                      <p className="text-xs text-[#6b4c4c]/50">
                        {formatDate(photo.uploaded_at)}
                      </p>
                    </div>
                    <Badge
                      variant={statusBadgeVariant[photo.permission_status]}
                      className="ml-2 shrink-0"
                    >
                      {statusLabels[photo.permission_status]}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Favorite toggle */}
                    <Button
                      variant={photo.favorited ? "default" : "outline"}
                      size="sm"
                      className={
                        photo.favorited
                          ? "bg-[#8b5e5e] hover:bg-[#7a4f4f]"
                          : ""
                      }
                      disabled={isUpdating}
                      onClick={() => handleToggleFavorite(photo)}
                    >
                      {isUpdating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Heart
                          className={`size-3.5 ${
                            photo.favorited ? "fill-current" : ""
                          }`}
                        />
                      )}
                      Favoritar
                    </Button>

                    {/* Request permission via WhatsApp (for pendente) */}
                    {photo.permission_status === "pendente" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleSolicitarPermissao(photo)}
                      >
                        <ExternalLink className="size-3.5" />
                        Solicitar Permissao
                      </Button>
                    )}

                    {/* Approve (for pendente or solicitada) */}
                    {(photo.permission_status === "pendente" ||
                      photo.permission_status === "solicitada") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdatePermission(photo, "aprovada")
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                        Aprovar
                      </Button>
                    )}

                    {/* Reject (for pendente or solicitada) */}
                    {(photo.permission_status === "pendente" ||
                      photo.permission_status === "solicitada") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdatePermission(photo, "recusada")
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <XCircle className="size-3.5" />
                        )}
                        Recusar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
