"use client";

import { useState } from "react";
import {
  Book,
  Upload,
  CheckCircle,
  Paintbrush,
  Package,
  Clock,
  Eye,
  MessageSquare,
  ImageIcon,
  PawPrint,
  X,
  Send,
  ArrowLeft,
  Truck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import PersonalidadeCanina from "@/components/portalcliente/PersonalidadeCanina";

/* ── Types ─────────────────────────────────────────── */
type DogbookStage =
  | "Aguardando Pagamento"
  | "Aguardando Fotos"
  | "Em Criacao"
  | "Em Aprovacao"
  | "Em Producao"
  | "Enviado"
  | "Concluido";

interface DogbookPet {
  id: string;
  name: string;
}

interface DogbookItem {
  id: string;
  subId: string;
  name: string;
  theme: string;
  stage: DogbookStage;
  pets: DogbookPet[];
  orderId: string;
  orderDate: string;
  photosUploaded: number;
  photosMax: number;
  pages: number;
  deadlineCreative: string;
  previewReady: boolean;
  approvedDate?: string;
  trackingCode?: string;
  personalityRatings?: Record<string, number>;
}

/* ── Stage config ──────────────────────────────────── */
const stageConfig: Record<DogbookStage, { color: string; icon: React.ElementType; label: string }> = {
  "Aguardando Pagamento": { color: "bg-red-100 text-red-800", icon: Clock, label: "Ag. Pagamento" },
  "Aguardando Fotos": { color: "bg-gray-100 text-gray-700", icon: Upload, label: "Enviar Fotos" },
  "Em Criacao": { color: "bg-amber-100 text-amber-800", icon: Paintbrush, label: "Em Criacao" },
  "Em Aprovacao": { color: "bg-blue-100 text-blue-800", icon: Eye, label: "Em Aprovacao" },
  "Em Producao": { color: "bg-purple-100 text-purple-800", icon: Package, label: "Em Producao" },
  Enviado: { color: "bg-teal-100 text-teal-800", icon: Truck, label: "Enviado" },
  Concluido: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Concluido" },
};

const stageSteps: DogbookStage[] = [
  "Aguardando Fotos",
  "Em Criacao",
  "Em Aprovacao",
  "Em Producao",
  "Enviado",
  "Concluido",
];

/* ── Mock data ─────────────────────────────────────── */
const mockDogbooks: DogbookItem[] = [
  {
    id: "sub-1", subId: "#PAM-001-1", name: "Verao da Luna", theme: "Verao",
    stage: "Em Aprovacao", pets: [{ id: "pet-1", name: "Luna" }],
    orderId: "#PAM-001", orderDate: "10/02/2026",
    photosUploaded: 18, photosMax: 20, pages: 20,
    deadlineCreative: "25/02/2026", previewReady: true,
    personalityRatings: {
      "Amor que nao acaba": 5, "Mestre do zig e zag": 4, "Olhinhos pidoes": 5,
      "Patinhas velozes": 3, "Detetive de comida": 5, "Rei da baguncinha": 2,
      "E um grude, sempre ao lado": 5, "Melhor Aumigo": 5, "Maquina de bagunca": 3,
      "Mestre dos lambeijos": 4, "Maquina de brincar": 5,
    },
  },
  {
    id: "sub-2", subId: "#PAM-001-2", name: "Natal do Thor", theme: "Natal",
    stage: "Aguardando Fotos", pets: [{ id: "pet-2", name: "Thor" }],
    orderId: "#PAM-001", orderDate: "10/02/2026",
    photosUploaded: 5, photosMax: 20, pages: 20,
    deadlineCreative: "15/03/2026", previewReady: false,
  },
  {
    id: "sub-3", subId: "#PAM-001-3", name: "Aventuras Luna e Thor", theme: "Caoniversario",
    stage: "Aguardando Fotos",
    pets: [{ id: "pet-1", name: "Luna" }, { id: "pet-2", name: "Thor" }],
    orderId: "#PAM-001", orderDate: "10/02/2026",
    photosUploaded: 0, photosMax: 20, pages: 20,
    deadlineCreative: "20/03/2026", previewReady: false,
  },
  {
    id: "sub-4", subId: "#PAM-008-1", name: "Natal da Luna", theme: "Natal",
    stage: "Concluido", pets: [{ id: "pet-1", name: "Luna" }],
    orderId: "#PAM-008", orderDate: "15/12/2025",
    photosUploaded: 20, photosMax: 20, pages: 20,
    deadlineCreative: "20/12/2025", previewReady: true,
    approvedDate: "22/12/2025", trackingCode: "BR123456789XX",
    personalityRatings: {
      "Amor que nao acaba": 5, "Mestre do zig e zag": 4, "Olhinhos pidoes": 5,
      "Patinhas velozes": 3, "Detetive de comida": 5, "Rei da baguncinha": 2,
      "E um grude, sempre ao lado": 5, "Melhor Aumigo": 5, "Maquina de bagunca": 3,
      "Mestre dos lambeijos": 4, "Maquina de brincar": 5,
    },
  },
];

/* ── Mock preview pages (square format 25x25cm) ───── */
const mockPages = [
  { id: 1, label: "Capa", type: "cover" as const },
  { id: 2, label: "Pag 1-2" },
  { id: 3, label: "Pag 3-4" },
  { id: 4, label: "Pag 5-6" },
  { id: 5, label: "Pag 7-8" },
  { id: 6, label: "Pag 9-10" },
  { id: 7, label: "Personalidade" },
  { id: 8, label: "Contracapa", type: "cover" as const },
];

/* ── Component ─────────────────────────────────────── */
export default function MeusDogbooksPage() {
  const [selectedDogbook, setSelectedDogbook] = useState<DogbookItem | null>(null);
  const [showChangeRequest, setShowChangeRequest] = useState(false);

  function getStageIndex(stage: DogbookStage) {
    return stageSteps.indexOf(stage);
  }

  // Simple card list view
  if (!selectedDogbook) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Meus Dogbooks
          </h1>
          <p className="text-muted-foreground mt-1">
            Toque em um Dogbook para ver detalhes e acompanhar o progresso.
          </p>
        </div>

        <div className="space-y-3">
          {mockDogbooks.map((item) => {
            const cfg = stageConfig[item.stage];
            const StageIcon = cfg.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedDogbook(item)}
                className="w-full text-left"
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-4">
                      {/* Mini book icon */}
                      <div className="size-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Book className="size-7 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.subId}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tema: {item.theme} &bull; {item.pages} paginas
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {item.pets.map((pet) => (
                            <span
                              key={pet.id}
                              className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5"
                            >
                              <PawPrint className="size-2.5" />
                              {pet.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shrink-0 ${cfg.color}`}
                      >
                        <StageIcon className="size-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Detail view (modal-like full page)
  const item = selectedDogbook;
  const stageIdx = getStageIndex(item.stage);
  const cfg = stageConfig[item.stage];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => {
          setSelectedDogbook(null);
          setShowChangeRequest(false);
        }}
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
            {item.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {item.subId} &bull; Tema: {item.theme} &bull; {item.pages} paginas
          </p>
          <div className="flex items-center gap-1 mt-1">
            {item.pets.map((pet) => (
              <span
                key={pet.id}
                className="inline-flex items-center gap-0.5 text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5"
              >
                <PawPrint className="size-2.5" />
                {pet.name}
              </span>
            ))}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
          <cfg.icon className="size-3" />
          {item.stage}
        </span>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between">
            {stageSteps.map((step, idx) => {
              const done = idx < stageIdx;
              const current = idx === stageIdx;
              const StepIcon = stageConfig[step].icon;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex items-center justify-center size-8 rounded-full border-2 transition-colors",
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : current
                            ? "border-primary text-primary bg-primary/10"
                            : "border-muted-foreground/30 text-muted-foreground/40"
                      )}
                    >
                      <StepIcon className="size-3.5" />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] text-center leading-tight hidden sm:block max-w-[60px]",
                        done || current ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {stageConfig[step].label}
                    </span>
                  </div>
                  {idx < stageSteps.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1 rounded-full", done ? "bg-primary" : "bg-muted-foreground/20")} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold text-primary">
            {item.photosUploaded}/{item.photosMax}
          </p>
          <p className="text-[10px] text-muted-foreground">Fotos Enviadas</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">{item.pages}</p>
          <p className="text-[10px] text-muted-foreground">Paginas</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-sm font-bold">{item.deadlineCreative}</p>
          <p className="text-[10px] text-muted-foreground">Prazo Criativo</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-sm font-bold">25x25cm</p>
          <p className="text-[10px] text-muted-foreground">Capa em Linho</p>
        </div>
      </div>

      {item.trackingCode && (
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Truck className="size-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium">Rastreamento</p>
              <p className="text-xs font-mono text-muted-foreground">{item.trackingCode}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Action Buttons (top, before preview) ────────── */}
      {item.stage === "Em Aprovacao" && item.previewReady && (
        <Card>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1 gap-2">
                <CheckCircle className="size-4" />
                Aprovar Dogbook
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowChangeRequest(!showChangeRequest)}
              >
                <MessageSquare className="size-4" />
                Solicitar Atendimento
              </Button>
            </div>

            {showChangeRequest && (
              <div className="space-y-2 pt-2">
                <Label>Descreva as alteracoes desejadas</Label>
                <Textarea
                  placeholder="Ex: Gostaria de trocar a foto da pagina 3..."
                  rows={3}
                />
                <Button variant="secondary" className="w-full gap-2">
                  <Send className="size-4" />
                  Enviar Solicitacao
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {item.stage === "Aguardando Fotos" && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <Button className="w-full gap-2">
              <Upload className="size-4" />
              Enviar Fotos ({item.photosUploaded}/{item.photosMax})
            </Button>
          </CardContent>
        </Card>
      )}

      {item.stage === "Concluido" && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <Eye className="size-4" />
                Ver Dogbook Final
              </Button>
              <Button variant="secondary" className="flex-1 gap-2">
                <Book className="size-4" />
                Pedir Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Preview - Square format (25x25cm) ────────────── */}
      {item.previewReady && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pre-visualizacao do Dogbook</CardTitle>
            <CardDescription>
              Formato quadrado 25x25cm com capa em linho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mockPages.map((page) => (
                <div
                  key={page.id}
                  className={cn(
                    "aspect-square rounded-lg border-2 border-border hover:border-primary/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2",
                    page.type === "cover"
                      ? "bg-[#c4a882]/10 border-[#c4a882]/30"
                      : "bg-muted"
                  )}
                >
                  {page.type === "cover" ? (
                    <>
                      <div className="size-6 rounded-sm bg-[#c4a882]/20 border border-[#c4a882]/30" />
                      <span className="text-[10px] font-medium text-[#8b7355]">
                        {page.label}
                      </span>
                      {page.id === 1 && (
                        <span className="text-[8px] text-[#8b7355]/70">
                          Linho
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-6 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground">
                        {page.label}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Personalidade Canina (below preview) ─────────── */}
      <PersonalidadeCanina
        petName={item.pets.map((p) => p.name).join(" e ")}
        initialRatings={item.personalityRatings}
        readOnly={item.stage === "Concluido"}
        onSave={(ratings) => {
          // In production: API call
          console.log("Saved ratings:", ratings);
        }}
      />
    </div>
  );
}
