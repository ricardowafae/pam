"use client";

import { useState, useCallback } from "react";
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
import { Heart, Shield, Search, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

/* ────────────────────── Types & Data ────────────────────── */

interface GalleryItem {
  id: number;
  client: string;
  pet: string;
  phone: string;
  date: string;
  status: "Aprovada" | "Pendente";
  favorited: boolean;
}

const initialGalleryItems: GalleryItem[] = [
  {
    id: 1,
    client: "Ana Souza",
    pet: "Thor",
    phone: "5511999990001",
    date: "10/03/2026",
    status: "Aprovada",
    favorited: true,
  },
  {
    id: 2,
    client: "Carlos Mendes",
    pet: "Bob",
    phone: "5511999990002",
    date: "08/03/2026",
    status: "Pendente",
    favorited: false,
  },
  {
    id: 3,
    client: "Fernanda Lima",
    pet: "Mel",
    phone: "5511999990003",
    date: "05/03/2026",
    status: "Aprovada",
    favorited: true,
  },
  {
    id: 4,
    client: "Mariana Costa",
    pet: "Pipoca",
    phone: "5511999990004",
    date: "03/03/2026",
    status: "Pendente",
    favorited: false,
  },
  {
    id: 5,
    client: "Pedro Santos",
    pet: "Max",
    phone: "5511999990005",
    date: "01/03/2026",
    status: "Aprovada",
    favorited: false,
  },
  {
    id: 6,
    client: "Rodrigo Alves",
    pet: "Nina",
    phone: "5511999990006",
    date: "28/02/2026",
    status: "Aprovada",
    favorited: true,
  },
  {
    id: 7,
    client: "Julia Ferreira",
    pet: "Bolinha",
    phone: "5511999990007",
    date: "25/02/2026",
    status: "Pendente",
    favorited: false,
  },
  {
    id: 8,
    client: "Bruno Oliveira",
    pet: "Toby",
    phone: "5511999990008",
    date: "22/02/2026",
    status: "Aprovada",
    favorited: true,
  },
];

/* ────────────────────── Component ────────────────────── */

export default function GaleriaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState<GalleryItem[]>(initialGalleryItems);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleFavorite = useCallback((id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newFavorited = !item.favorited;
        toast.success(
          newFavorited
            ? `Foto de ${item.pet} (${item.client}) adicionada aos favoritos!`
            : `Foto de ${item.pet} (${item.client}) removida dos favoritos.`
        );
        return { ...item, favorited: newFavorited };
      })
    );
  }, []);

  const handleSolicitarPermissao = useCallback((item: GalleryItem) => {
    const message = encodeURIComponent(
      `Olá ${item.client}! 🐾\n\n` +
      `Aqui é a equipe da *Patas, Amor e Memórias*.\n\n` +
      `As fotos da sessão do(a) *${item.pet}* ficaram incríveis! ` +
      `Gostaríamos de solicitar sua autorização para utilizarmos as imagens ` +
      `em nosso site e redes sociais.\n\n` +
      `As fotos serão usadas exclusivamente para divulgação dos nossos serviços, ` +
      `sempre com carinho e respeito. 💛\n\n` +
      `Podemos contar com sua autorização?`
    );
    const whatsappUrl = `https://wa.me/${item.phone}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    toast.success(`Solicitação de permissão enviada para ${item.client} via WhatsApp.`);
  }, []);

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
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Aprovada">Aprovada</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {/* Image Placeholder */}
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#e8d4d4] to-[#fdf8f4]">
              <ImageIcon className="size-16 text-[#c4a0a0]" />
            </div>
            <CardContent className="pt-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#6b4c4c]">{item.client}</p>
                  <p className="text-xs text-[#6b4c4c]/70">
                    Pet: {item.pet}
                  </p>
                  <p className="text-xs text-[#6b4c4c]/50">{item.date}</p>
                </div>
                <Badge
                  variant={
                    item.status === "Aprovada" ? "default" : "outline"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant={item.favorited ? "default" : "outline"}
                  size="sm"
                  className={
                    item.favorited
                      ? "bg-[#8b5e5e] hover:bg-[#7a4f4f]"
                      : ""
                  }
                  onClick={() => handleToggleFavorite(item.id)}
                >
                  <Heart
                    className={`size-3.5 ${
                      item.favorited ? "fill-current" : ""
                    }`}
                  />
                  Favoritar
                </Button>
                {item.status === "Pendente" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSolicitarPermissao(item)}
                  >
                    <ExternalLink className="size-3.5" />
                    Solicitar Permissao
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
