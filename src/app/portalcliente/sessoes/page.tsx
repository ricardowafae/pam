"use client";

import { useState } from "react";
import {
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Download,
  ImageIcon,
  PawPrint,
  User,
  Eye,
  Star,
  ArrowLeft,
  Phone,
  AlertTriangle,
  Info,
  CalendarDays,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────── */
type SessionType = "Pocket" | "Estudio" | "Completa";
type SessionStage =
  | "Aguardando Pagamento"
  | "Aguardando Agendamento"
  | "Agendada"
  | "Confirmada"
  | "Realizada"
  | "Em Edicao"
  | "Fotos Entregues";

interface SessionPet {
  id: string;
  name: string;
}

interface SessionPhoto {
  id: string;
  name: string;
}

interface SessionItem {
  id: string;
  subId: string;
  type: SessionType;
  stage: SessionStage;
  pets: SessionPet[];
  date: string | null;
  time: string | null;
  location: string;
  photographer: string;
  photographerPhone: string;
  totalPhotos: number;
  deliveredPhotos: SessionPhoto[];
  observations: string;
  orderId: string;
  rescheduleCount: number;
}

/* ── Config ────────────────────────────────────────── */
const stageConfig: Record<SessionStage, { color: string; icon: React.ElementType; label: string }> = {
  "Aguardando Pagamento": { color: "bg-red-100 text-red-800", icon: Clock, label: "Ag. Pagamento" },
  "Aguardando Agendamento": { color: "bg-amber-100 text-amber-800", icon: CalendarDays, label: "Agendar" },
  Agendada: { color: "bg-blue-100 text-blue-800", icon: Calendar, label: "Agendada" },
  Confirmada: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Confirmada" },
  Realizada: { color: "bg-purple-100 text-purple-800", icon: Camera, label: "Realizada" },
  "Em Edicao": { color: "bg-orange-100 text-orange-800", icon: Star, label: "Em Edicao" },
  "Fotos Entregues": { color: "bg-green-100 text-green-800", icon: Download, label: "Entregues" },
};

const stageSteps: SessionStage[] = [
  "Aguardando Agendamento",
  "Agendada",
  "Confirmada",
  "Realizada",
  "Em Edicao",
  "Fotos Entregues",
];

const typeConfig: Record<SessionType, { color: string }> = {
  Pocket: { color: "bg-emerald-100 text-emerald-800" },
  Estudio: { color: "bg-blue-100 text-blue-800" },
  Completa: { color: "bg-purple-100 text-purple-800" },
};

/* ── Mock data ─────────────────────────────────────── */
const mockSessions: SessionItem[] = [
  {
    id: "ssub-0", subId: "#PAM-012-1", type: "Completa", stage: "Aguardando Agendamento",
    pets: [{ id: "pet-3", name: "Mel" }],
    date: null, time: null, location: "A definir",
    photographer: "Juliano Lemos", photographerPhone: "(11) 99876-5432",
    totalPhotos: 60, deliveredPhotos: [], orderId: "#PAM-012",
    observations: "", rescheduleCount: 0,
  },
  {
    id: "ssub-1", subId: "#PAM-003-1", type: "Estudio", stage: "Confirmada",
    pets: [{ id: "pet-1", name: "Luna" }, { id: "pet-2", name: "Thor" }],
    date: "22/03/2026", time: "10:00", location: "Estudio PAM - Pinheiros",
    photographer: "Juliano Lemos", photographerPhone: "(11) 99876-5432",
    totalPhotos: 40, deliveredPhotos: [], orderId: "#PAM-003",
    observations: "Luna e Thor juntos, trazer brinquedos favoritos",
    rescheduleCount: 0,
  },
  {
    id: "ssub-2", subId: "#PAM-003-2", type: "Pocket", stage: "Agendada",
    pets: [{ id: "pet-1", name: "Luna" }],
    date: "29/03/2026", time: "15:00", location: "Parque Villa-Lobos",
    photographer: "Juliano Lemos", photographerPhone: "(11) 99876-5432",
    totalPhotos: 15, deliveredPhotos: [], orderId: "#PAM-003",
    observations: "", rescheduleCount: 1,
  },
  {
    id: "ssub-3", subId: "#PAM-009-1", type: "Pocket", stage: "Fotos Entregues",
    pets: [{ id: "pet-1", name: "Luna" }],
    date: "20/01/2026", time: "09:00", location: "Parque Ibirapuera",
    photographer: "Juliano Lemos", photographerPhone: "(11) 99876-5432",
    totalPhotos: 15, orderId: "#PAM-009", observations: "Sessao matinal",
    rescheduleCount: 0,
    deliveredPhotos: Array.from({ length: 15 }, (_, i) => ({
      id: `p${i + 1}`,
      name: `luna-ibira-${String(i + 1).padStart(3, "0")}.jpg`,
    })),
  },
];

/* ── Available time slots (mock) ───────────────────── */
const availableSlots = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00",
];

/* ── Component ─────────────────────────────────────── */
export default function MinhasSessoesPage() {
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  function getStageIndex(stage: SessionStage) {
    return stageSteps.indexOf(stage);
  }

  function canReschedule(item: SessionItem) {
    return (
      (item.stage === "Agendada" || item.stage === "Confirmada") &&
      item.rescheduleCount < 2
    );
  }

  function canSchedule(item: SessionItem) {
    return item.stage === "Aguardando Agendamento";
  }

  function handleScheduleConfirm() {
    if (!selectedDate || !selectedTime) return;
    setScheduleSuccess(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setShowRescheduleModal(false);
      setScheduleSuccess(false);
      setSelectedDate("");
      setSelectedTime("");
    }, 2000);
  }

  // ── Schedule/Reschedule Modal ──────────────────────
  function renderDateModal(isReschedule: boolean) {
    const maxReschedules = 2;
    const remaining = selectedSession
      ? maxReschedules - selectedSession.rescheduleCount - 1
      : maxReschedules;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  {isReschedule ? "Remarcar Sessao" : "Agendar Sessao"}
                </CardTitle>
                <CardDescription>
                  {isReschedule
                    ? "Escolha uma nova data e horario para sua sessao"
                    : "Escolha a data e horario da sua sessao fotografica"}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setShowScheduleModal(false);
                  setShowRescheduleModal(false);
                  setScheduleSuccess(false);
                  setSelectedDate("");
                  setSelectedTime("");
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="size-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isReschedule ? "Sessao remarcada!" : "Sessao agendada!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate} as {selectedTime}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Reschedule warnings */}
                {isReschedule && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800">
                          Atencao ao remarcar
                        </p>
                        <ul className="text-amber-700 mt-1 space-y-1 text-xs">
                          <li>• Cada sessao pode ser remarcada no maximo <strong>2 vezes</strong>.</li>
                          <li>• A remarcacao deve ser feita com pelo menos <strong>48 horas</strong> de antecedencia.</li>
                          <li>• Apos 2 remarcacoes, alteracoes somente via WhatsApp com a equipe.</li>
                        </ul>
                        {selectedSession && (
                          <p className="mt-2 text-xs font-medium text-amber-800">
                            Remarcacoes restantes para esta sessao: {remaining >= 0 ? remaining : 0}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info for scheduling */}
                {!isReschedule && (
                  <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <Info className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p>Escolha a data e horario que melhor se encaixam na sua rotina. Apos o agendamento, voce recebera uma confirmacao por e-mail.</p>
                    </div>
                  </div>
                )}

                {/* Date picker */}
                <div className="space-y-2">
                  <Label htmlFor="session-date">Data da Sessao *</Label>
                  <Input
                    id="session-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Agendamentos com no minimo 48h de antecedencia.
                  </p>
                </div>

                {/* Time slots */}
                <div className="space-y-2">
                  <Label>Horario *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-center",
                          selectedTime === slot
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Horarios sujeitos a disponibilidade do fotografo.
                  </p>
                </div>

                {/* Policies */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Info className="size-3" />
                    Politica de agendamento
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Confirmacao enviada por e-mail em ate 24h.</li>
                    <li>• Cancelamento gratuito ate 48h antes da sessao.</li>
                    <li>• Cancelamento com menos de 48h: taxa de 30%.</li>
                    <li>• Maximo de 2 remarcacoes por sessao.</li>
                    <li>• Em caso de chuva (sessoes externas), a remarcacao e gratuita.</li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleScheduleConfirm}
                    disabled={!selectedDate || !selectedTime}
                  >
                    <CheckCircle className="size-4" />
                    {isReschedule ? "Confirmar Remarcacao" : "Confirmar Agendamento"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setShowRescheduleModal(false);
                      setSelectedDate("");
                      setSelectedTime("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────
  if (!selectedSession) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Minhas Sessoes Fotograficas
          </h1>
          <p className="text-muted-foreground mt-1">
            Toque em uma sessao para ver detalhes, agendar ou remarcar.
          </p>
        </div>

        <div className="space-y-3">
          {mockSessions.map((item) => {
            const cfg2 = stageConfig[item.stage];
            const StageIcon = cfg2.icon;
            const typeCfg = typeConfig[item.type];

            const needsScheduling = item.stage === "Aguardando Agendamento";

            return (
              <div key={item.id}>
                <button
                  onClick={() => setSelectedSession(item)}
                  className="w-full text-left"
                >
                  <Card className={cn(
                    "hover:border-primary/30 transition-colors",
                    needsScheduling && "border-amber-300 bg-amber-50/30"
                  )}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-14 rounded-lg flex items-center justify-center shrink-0",
                          needsScheduling ? "bg-amber-100" : "bg-primary/10"
                        )}>
                          <Camera className={cn("size-7", needsScheduling ? "text-amber-700" : "text-primary")} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">
                              Sessao {item.type}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${typeCfg.color}`}>
                              {item.type}
                            </span>
                          </div>
                          {item.date && item.time ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="size-3" />
                              {item.date} as {item.time}
                              <span>&bull;</span>
                              <MapPin className="size-3" />
                              {item.location.split(" - ")[0]}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-700 font-medium mt-0.5">
                              Sessao comprada — agende sua data!
                            </p>
                          )}
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

                        {needsScheduling ? (
                          <Button
                            size="sm"
                            className="gap-1.5 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(item);
                              setShowScheduleModal(true);
                            }}
                          >
                            <CalendarDays className="size-3.5" />
                            Agendar
                          </Button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shrink-0 ${cfg2.color}`}>
                            <StageIcon className="size-3" />
                            {cfg2.label}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Detail view ───────────────────────────────────
  const item = selectedSession;
  const stageIdx = getStageIndex(item.stage);
  const cfg = stageConfig[item.stage];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setSelectedSession(null)}
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
            Sessao {item.type}
          </h1>
          <p className="text-sm text-muted-foreground">
            {item.subId}
            {item.date && item.time ? ` • ${item.date} as ${item.time}` : " • Aguardando agendamento"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {item.pets.map((pet) => (
              <span key={pet.id} className="inline-flex items-center gap-0.5 text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
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

      {/* Progress */}
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
                    <div className={cn(
                      "flex items-center justify-center size-8 rounded-full border-2 transition-colors",
                      done ? "bg-primary border-primary text-primary-foreground"
                        : current ? "border-primary text-primary bg-primary/10"
                          : "border-muted-foreground/30 text-muted-foreground/40"
                    )}>
                      <StepIcon className="size-3.5" />
                    </div>
                    <span className={cn(
                      "text-[10px] text-center leading-tight hidden sm:block",
                      done || current ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
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

      {/* Session Date & Scheduling */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            Data e Horario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canSchedule(item) ? (
            <div className="text-center py-4 space-y-3">
              <div className="size-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <CalendarDays className="size-7 text-amber-700" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Sua sessao esta pronta para ser agendada!
                </p>
                <p className="text-sm text-muted-foreground">
                  Escolha a data e horario que melhor se encaixam na sua rotina.
                </p>
              </div>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setShowScheduleModal(true)}
              >
                <CalendarDays className="size-4" />
                Agendar Minha Sessao
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.date}</p>
                  <p className="text-sm text-muted-foreground">as {item.time}</p>
                </div>
              </div>
              {canReschedule(item) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowRescheduleModal(true)}
                >
                  <CalendarDays className="size-3.5" />
                  Remarcar
                </Button>
              )}
            </div>
          )}

          {/* Reschedule info */}
          {(item.stage === "Agendada" || item.stage === "Confirmada") && (
            <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
              <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Remarcacoes utilizadas: <strong>{item.rescheduleCount} de 2</strong>
                </p>
                {item.rescheduleCount >= 2 ? (
                  <p className="text-amber-600">
                    Limite de remarcacoes atingido. Para alteracoes, entre em contato via WhatsApp.
                  </p>
                ) : (
                  <p>
                    Voce pode remarcar esta sessao mais {2 - item.rescheduleCount} vez{2 - item.rescheduleCount !== 1 ? "es" : ""}. Remarcacoes devem ser feitas com 48h de antecedencia.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="text-sm font-medium">{item.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Fotografo</p>
                <p className="text-sm font-medium">{item.photographer}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Camera className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Fotos Previstas</p>
                <p className="text-sm font-medium">{item.totalPhotos} fotos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Contato Fotografo</p>
                <p className="text-sm font-medium">{item.photographerPhone}</p>
              </div>
            </div>
          </div>

          {item.observations && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Observacoes</p>
                <p className="text-sm bg-muted rounded-md px-3 py-2">{item.observations}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delivered Photos */}
      {item.stage === "Fotos Entregues" && item.deliveredPhotos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Fotos Entregues ({item.deliveredPhotos.length})
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="size-3.5" />
                Baixar Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {item.deliveredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-md bg-muted border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <ImageIcon className="size-5 text-muted-foreground/40" />
                  <span className="text-[8px] text-muted-foreground px-1 truncate max-w-full">
                    {photo.name}
                  </span>
                  <div className="absolute inset-0 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="size-7 rounded-full bg-white/90 flex items-center justify-center">
                      <Eye className="size-3.5 text-foreground" />
                    </button>
                    <button className="size-7 rounded-full bg-white/90 flex items-center justify-center">
                      <Download className="size-3.5 text-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showScheduleModal && renderDateModal(false)}
      {showRescheduleModal && renderDateModal(true)}
    </div>
  );
}
