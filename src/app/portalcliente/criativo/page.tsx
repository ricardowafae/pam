"use client";

import { Upload, ImageIcon, Sun, Snowflake, TreePine, PartyPopper, Cake, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const themes = [
  {
    id: "verao",
    name: "Verao",
    icon: Sun,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Praia, sol e diversao",
  },
  {
    id: "inverno",
    name: "Inverno",
    icon: Snowflake,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "Aconchego e frio",
  },
  {
    id: "natal",
    name: "Natal",
    icon: TreePine,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    description: "Magia natalina",
  },
  {
    id: "ano-novo",
    name: "Ano Novo",
    icon: PartyPopper,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    description: "Celebracao e alegria",
  },
  {
    id: "caoniversario",
    name: "Caoniversario",
    icon: Cake,
    color: "text-pink-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    description: "Aniversario do pet",
  },
];

const mockPhotos = [
  { id: 1, name: "luna-praia-01.jpg" },
  { id: 2, name: "luna-parque-02.jpg" },
  { id: 3, name: "luna-casa-03.jpg" },
  { id: 4, name: "luna-jardim-04.jpg" },
  { id: 5, name: "luna-sofa-05.jpg" },
];

export default function CriativoPage() {
  const [selectedTheme, setSelectedTheme] = useState("verao");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Area Criativa
        </h1>
        <p className="text-muted-foreground mt-1">
          Envie suas fotos e escolha o tema do seu Dogbook.
        </p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-4 text-primary" />
            Enviar Fotos
          </CardTitle>
          <CardDescription>
            Arraste e solte suas fotos ou clique para selecionar. Formatos: JPG, PNG. Maximo: 20 fotos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 md:p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
            <Upload className="size-10 text-primary/50 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              Arraste suas fotos aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou clique para selecionar do seu dispositivo
            </p>
            <Button variant="outline" className="mt-4">
              Selecionar Fotos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Escolha o Tema</CardTitle>
          <CardDescription>
            Selecione o tema visual para o seu Dogbook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  selectedTheme === theme.id
                    ? `${theme.border} ${theme.bg} ring-2 ring-primary/20`
                    : "border-border hover:border-primary/30"
                )}
              >
                <theme.icon className={cn("size-8", theme.color)} />
                <span className="text-sm font-medium">{theme.name}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {theme.description}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Photos Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fotos Enviadas</CardTitle>
              <CardDescription>
                {mockPhotos.length} de 20 fotos enviadas
              </CardDescription>
            </div>
            <Badge variant="secondary">{mockPhotos.length}/20</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {mockPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg bg-muted flex flex-col items-center justify-center border overflow-hidden"
              >
                <ImageIcon className="size-8 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground mt-1 px-2 truncate max-w-full">
                  {photo.name}
                </span>
                <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 text-white rounded-full p-0.5">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
