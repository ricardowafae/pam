"use client";

import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PawRating from "./PawRating";

/* ── Traits list (matching the physical Dogbook) ──── */
const TRAITS = [
  "Amor que nao acaba",
  "Mestre do zig e zag",
  "Olhinhos pidoes",
  "Patinhas velozes",
  "Detetive de comida",
  "Rei da baguncinha",
  "E um grude, sempre ao lado",
  "Melhor Aumigo",
  "Maquina de bagunca",
  "Mestre dos lambeijos",
  "Maquina de brincar",
];

interface PersonalidadeCaninaProps {
  petName: string;
  initialRatings?: Record<string, number>;
  readOnly?: boolean;
  compact?: boolean;
  onSave?: (ratings: Record<string, number>) => void;
}

export default function PersonalidadeCanina({
  petName,
  initialRatings,
  readOnly = false,
  compact = false,
  onSave,
}: PersonalidadeCaninaProps) {
  const defaultRatings: Record<string, number> = {};
  TRAITS.forEach((t) => {
    defaultRatings[t] = initialRatings?.[t] ?? 0;
  });

  const [ratings, setRatings] = useState(defaultRatings);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleRate(trait: string, value: number) {
    if (readOnly && !editing) return;
    setRatings((prev) => ({ ...prev, [trait]: value }));
  }

  function handleSave() {
    onSave?.(ratings);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setRatings(defaultRatings);
    setEditing(false);
  }

  // Compact view: 2 rows of 3 traits (subset)
  const compactTraits = [
    "Amor que nao acaba",
    "Mestre do zig e zag",
    "Detetive de comida",
    "Mestre dos lambeijos",
    "Patinhas velozes",
    "Maquina de brincar",
  ];

  const displayTraits = compact ? compactTraits : TRAITS;
  const allFilled = Object.values(ratings).every((v) => v > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">🐾</span>
              Personalidade Canina {petName && `— ${petName}`}
            </CardTitle>
            {!compact && (
              <CardDescription>
                Avalie as caracteristicas do seu pet de 1 a 5 patinhas
              </CardDescription>
            )}
          </div>
          {!readOnly && !editing && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={
            compact
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              : "space-y-3"
          }
        >
          {displayTraits.map((trait) => (
            <div
              key={trait}
              className={
                compact
                  ? "flex items-center justify-between gap-2 rounded-xl bg-[#f5ebe0]/60 px-3 py-2"
                  : "flex items-center justify-between gap-4 rounded-xl bg-[#f5ebe0]/60 px-4 py-2.5"
              }
            >
              <span
                className={`font-medium text-foreground ${compact ? "text-xs" : "text-sm"}`}
              >
                {trait}
              </span>
              <PawRating
                value={ratings[trait] || 0}
                onChange={(v) => handleRate(trait, v)}
                readOnly={readOnly && !editing}
                size={compact ? "sm" : "md"}
              />
            </div>
          ))}
        </div>

        {/* Final Rating */}
        {!compact && allFilled && (
          <div className="mt-4 rounded-xl bg-[#f5ebe0] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-semibold text-sm text-foreground">
              Avaliacao Final
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Todos merecem 5 patas
              </span>
              <PawRating value={5} readOnly size="md" />
            </div>
          </div>
        )}

        {/* Edit actions */}
        {editing && (
          <div className="flex items-center gap-2 mt-4">
            <Button size="sm" className="gap-1.5" onClick={handleSave}>
              <Save className="size-3.5" />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={handleCancel}
            >
              <X className="size-3.5" />
              Cancelar
            </Button>
          </div>
        )}
        {saved && (
          <p className="text-xs text-green-600 font-medium mt-2">
            Personalidade salva com sucesso!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
