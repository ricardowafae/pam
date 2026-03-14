"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Heart, Shield, Search, Image as ImageIcon } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    client: "Ana Souza",
    pet: "Thor",
    date: "10/03/2026",
    status: "Aprovada",
    favorited: true,
  },
  {
    id: 2,
    client: "Carlos Mendes",
    pet: "Bob",
    date: "08/03/2026",
    status: "Pendente",
    favorited: false,
  },
  {
    id: 3,
    client: "Fernanda Lima",
    pet: "Mel",
    date: "05/03/2026",
    status: "Aprovada",
    favorited: true,
  },
  {
    id: 4,
    client: "Mariana Costa",
    pet: "Pipoca",
    date: "03/03/2026",
    status: "Pendente",
    favorited: false,
  },
  {
    id: 5,
    client: "Pedro Santos",
    pet: "Max",
    date: "01/03/2026",
    status: "Aprovada",
    favorited: false,
  },
  {
    id: 6,
    client: "Rodrigo Alves",
    pet: "Nina",
    date: "28/02/2026",
    status: "Aprovada",
    favorited: true,
  },
  {
    id: 7,
    client: "Julia Ferreira",
    pet: "Bolinha",
    date: "25/02/2026",
    status: "Pendente",
    favorited: false,
  },
  {
    id: 8,
    client: "Bruno Oliveira",
    pet: "Toby",
    date: "22/02/2026",
    status: "Aprovada",
    favorited: true,
  },
];

export default function GaleriaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredItems = galleryItems.filter((item) => {
    const matchesSearch =
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                >
                  <Heart
                    className={`size-3.5 ${
                      item.favorited ? "fill-current" : ""
                    }`}
                  />
                  Favoritar
                </Button>
                {item.status === "Pendente" && (
                  <Button variant="outline" size="sm">
                    <Shield className="size-3.5" />
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
