"use client";

import { Book, CheckCircle, MessageSquare, ImageIcon, Phone } from "lucide-react";
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
import { useState } from "react";
import PersonalidadeCanina from "@/components/portalcliente/PersonalidadeCanina";

const mockPages = [
  { id: 1, label: "Capa" },
  { id: 2, label: "Pagina 1-2" },
  { id: 3, label: "Pagina 3-4" },
  { id: 4, label: "Pagina 5-6" },
  { id: 5, label: "Pagina 7-8" },
  { id: 6, label: "Contracapa" },
];

const mockPersonalityRatings: Record<string, number> = {
  "Amor que nao acaba": 5,
  "Mestre do zig e zag": 4,
  "Olhinhos pidoes": 5,
  "Patinhas velozes": 3,
  "Detetive de comida": 5,
  "Rei da baguncinha": 4,
  "E um grude, sempre ao lado": 5,
  "Melhor Aumigo": 5,
  "Maquina de bagunca": 3,
  "Mestre dos lambeijos": 5,
  "Maquina de brincar": 4,
};

export default function DogbookApprovalPage() {
  const [showChanges, setShowChanges] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Aprovacao do Dogbook
        </h1>
        <p className="text-muted-foreground mt-1">
          Revise o layout do seu Dogbook e aprove ou solicite alteracoes.
        </p>
      </div>

      {/* Dogbook Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Book className="size-4 text-primary" />
              Verao da Luna
            </CardTitle>
            <Badge>Em Aprovacao</Badge>
          </div>
          <CardDescription>
            Tema: Verao &bull; 20 paginas &bull; Enviado em 10/02/2026
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ── Action Buttons (top) ─────────────────────────── */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Sua decisao</p>
            <p className="text-xs text-muted-foreground">
              Revise a pre-visualizacao abaixo e escolha uma opcao.
            </p>
          </div>

          {showChanges && (
            <div className="space-y-2">
              <Label htmlFor="changes">Descreva as alteracoes desejadas</Label>
              <Textarea
                id="changes"
                placeholder="Ex: Gostaria de trocar a foto da pagina 3 pela foto luna-parque-02.jpg..."
                rows={4}
              />
              <Button variant="secondary" className="w-full">
                Enviar Solicitacao de Alteracao
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 gap-2">
              <CheckCircle className="size-4" />
              Aprovar Dogbook
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setShowChanges(!showChanges)}
            >
              <Phone className="size-4" />
              Solicitar Atendimento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Preview Area ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-visualizacao</CardTitle>
          <CardDescription>
            Clique em cada pagina para ver em tamanho maior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockPages.map((page) => (
              <div
                key={page.id}
                className="aspect-[3/4] rounded-lg bg-muted border-2 border-border hover:border-primary/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <ImageIcon className="size-10 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground font-medium">
                  {page.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Personalidade Canina ─────────────────────────── */}
      <PersonalidadeCanina
        petName="Luna"
        initialRatings={mockPersonalityRatings}
        readOnly
      />
    </div>
  );
}
