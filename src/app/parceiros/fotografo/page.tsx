"use client";

import { useState } from "react";
import {
  Camera,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  X,
  PawPrint,
  User,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────── */
type SessionStatus = "Confirmada" | "Pendente" | "Realizada" | "Cancelada";
type SessionType = "Pocket" | "Estudio" | "Completa";

interface SessionEvent {
  id: number;
  client: string;
  clientPhone: string;
  clientEmail: string;
  pet: string;
  petBreed: string;
  type: SessionType;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: SessionStatus;
  orderId: string;
  observations: string;
  totalPhotos: number;
}

/* ── Config ────────────────────────────────────────── */
const statusStyles: Record<SessionStatus, string> = {
  Confirmada: "bg-green-100 text-green-800",
  Pendente: "bg-amber-100 text-amber-800",
  Realizada: "bg-blue-100 text-blue-800",
  Cancelada: "bg-red-100 text-red-800",
};

const typeStyles: Record<SessionType, string> = {
  Pocket: "bg-emerald-100 text-emerald-800",
  Estudio: "bg-blue-100 text-blue-800",
  Completa: "bg-purple-100 text-purple-800",
};

/* ── Mock data ─────────────────────────────────────── */
const mockSessions: SessionEvent[] = [
  {
    id: 1, client: "Ana Silva", clientPhone: "(11) 99999-1234", clientEmail: "ana.silva@email.com",
    pet: "Luna", petBreed: "Golden Retriever", type: "Estudio", date: "15/03/2026", time: "10:00",
    duration: "2h", location: "Estudio PAM - R. Claudio Soares, 72 - Pinheiros",
    status: "Confirmada", orderId: "#PAM-003-1",
    observations: "Luna e Thor juntos, trazer brinquedos favoritos", totalPhotos: 40,
  },
  {
    id: 2, client: "Carlos Mendes", clientPhone: "(11) 98765-4321", clientEmail: "carlos.m@email.com",
    pet: "Thor", petBreed: "Bulldog Frances", type: "Completa", date: "17/03/2026", time: "14:00",
    duration: "3h", location: "Parque Ibirapuera - Portao 3",
    status: "Pendente", orderId: "#PAM-012-1",
    observations: "Cliente prefere fotos ao ar livre. Thor e timido.", totalPhotos: 60,
  },
  {
    id: 3, client: "Mariana Costa", clientPhone: "(11) 91234-5678", clientEmail: "mari.costa@email.com",
    pet: "Mel", petBreed: "Poodle", type: "Pocket", date: "20/03/2026", time: "09:00",
    duration: "1h", location: "Residencia - R. dos Pinheiros, 456",
    status: "Confirmada", orderId: "#PAM-015-1", observations: "", totalPhotos: 15,
  },
  {
    id: 4, client: "Roberto Lima", clientPhone: "(11) 97654-3210", clientEmail: "roberto.l@email.com",
    pet: "Max", petBreed: "Labrador", type: "Estudio", date: "22/03/2026", time: "11:00",
    duration: "2h", location: "Estudio PAM - R. Claudio Soares, 72 - Pinheiros",
    status: "Pendente", orderId: "#PAM-018-1",
    observations: "Max e muito agitado, pode precisar de intervalos.", totalPhotos: 40,
  },
  {
    id: 5, client: "Fernanda Pereira", clientPhone: "(11) 96543-2109", clientEmail: "fernanda.p@email.com",
    pet: "Pipoca", petBreed: "Shih Tzu", type: "Pocket", date: "25/03/2026", time: "16:00",
    duration: "1h", location: "Parque Villa-Lobos",
    status: "Confirmada", orderId: "#PAM-020-1",
    observations: "Fotos com roupa tematica de primavera", totalPhotos: 15,
  },
  {
    id: 6, client: "Ana Silva", clientPhone: "(11) 99999-1234", clientEmail: "ana.silva@email.com",
    pet: "Luna", petBreed: "Golden Retriever", type: "Pocket", date: "29/03/2026", time: "15:00",
    duration: "1h", location: "Parque Villa-Lobos",
    status: "Confirmada", orderId: "#PAM-003-2", observations: "", totalPhotos: 15,
  },
  {
    id: 7, client: "Paula Santos", clientPhone: "(11) 95432-1098", clientEmail: "paula.s@email.com",
    pet: "Bob", petBreed: "Beagle", type: "Estudio", date: "10/03/2026", time: "10:00",
    duration: "2h", location: "Estudio PAM - Pinheiros",
    status: "Realizada", orderId: "#PAM-010-1", observations: "", totalPhotos: 40,
  },
  {
    id: 8, client: "Lucas Oliveira", clientPhone: "(11) 94321-0987", clientEmail: "lucas.o@email.com",
    pet: "Rex", petBreed: "Pastor Alemao", type: "Completa", date: "05/03/2026", time: "09:00",
    duration: "3h", location: "Parque Ibirapuera",
    status: "Realizada", orderId: "#PAM-007-1", observations: "", totalPhotos: 60,
  },
];

/* ── Calendar helpers ──────────────────────────────── */
const MONTH_NAMES = [
  "Janeiro","Fevereiro","Marco","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function parseDateStr(d: string) {
  const [day, month, year] = d.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* ── Component ─────────────────────────────────────── */
export default function FotografoPage() {
  const [currentMonth, setCurrentMonth] = useState(2);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedSession, setSelectedSession] = useState<SessionEvent | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  }

  const sessionsByDate: Record<string, SessionEvent[]> = {};
  mockSessions.forEach((s) => {
    const parsed = parseDateStr(s.date);
    if (parsed.getMonth() === currentMonth && parsed.getFullYear() === currentYear) {
      const key = parsed.getDate().toString();
      if (!sessionsByDate[key]) sessionsByDate[key] = [];
      sessionsByDate[key].push(s);
    }
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const total = mockSessions.length;
  const agendadas = mockSessions.filter((s) => s.status === "Confirmada" || s.status === "Pendente").length;
  const realizadas = mockSessions.filter((s) => s.status === "Realizada").length;
  const canceladas = mockSessions.filter((s) => s.status === "Cancelada").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Sessoes Fotograficas
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas sessoes fotograficas e acompanhe os agendamentos.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, icon: Camera, color: "text-primary" },
          { label: "Agendadas", value: agendadas, icon: CalendarClock, color: "text-blue-600" },
          { label: "Realizadas", value: realizadas, icon: CheckCircle, color: "text-green-600" },
          { label: "Canceladas", value: canceladas, icon: XCircle, color: "text-red-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className={`size-8 ${kpi.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" onClick={() => setViewMode("calendar")} className="gap-2">
          <Calendar className="size-4" /> Calendario
        </Button>
        <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="gap-2">
          <FileText className="size-4" /> Lista
        </Button>
      </div>

      {/* ── Calendar View ─────────────────────────── */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <CardTitle className="text-lg">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[52px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const daySessions = sessionsByDate[day.toString()] || [];
                const hasSession = daySessions.length > 0;
                const today = day === 14 && currentMonth === 2 && currentYear === 2026;
                // Show up to 5 sessions, then "+N more" if needed
                const maxVisible = 5;
                const visibleSessions = daySessions.slice(0, maxVisible);
                const hiddenCount = daySessions.length - maxVisible;
                return (
                  <div
                    key={day}
                    className={cn(
                      "rounded-lg border p-1 flex flex-col transition-colors min-h-[52px]",
                      hasSession ? "border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10" : "border-transparent",
                      today && "ring-2 ring-primary"
                    )}
                    onClick={() => { if (daySessions.length === 1) setSelectedSession(daySessions[0]); }}
                  >
                    <span className={cn("text-xs font-medium", today ? "text-primary font-bold" : "text-foreground")}>{day}</span>
                    {visibleSessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedSession(s); }}
                        className={cn("text-[9px] leading-tight rounded px-0.5 py-0.5 mt-0.5 truncate text-left w-full font-medium", statusStyles[s.status])}
                        title={`${s.time} - ${s.client} (${s.type})`}
                      >
                        {s.time} {s.client.split(" ")[0]}
                      </button>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="text-[8px] text-muted-foreground mt-0.5 text-center">
                        +{hiddenCount} mais
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── List View ─────────────────────────────── */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Historico de Sessoes Fotograficas</CardTitle>
            <CardDescription>Clique em uma sessao para ver detalhes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockSessions
              .sort((a, b) => parseDateStr(a.date).getTime() - parseDateStr(b.date).getTime())
              .map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="w-full flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Camera className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{session.client} - {session.pet}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${typeStyles[session.type]}`}>{session.type}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[session.status]}`}>{session.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="size-3" />{session.date}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{session.time}</span>
                      <span className="flex items-center gap-1 hidden md:flex"><MapPin className="size-3" />{session.location.split(" - ")[0]}</span>
                    </div>
                  </div>
                  <Eye className="size-4 text-muted-foreground shrink-0" />
                </button>
              ))}
          </CardContent>
        </Card>
      )}

      {/* ── Session Detail Modal ──────────────────── */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="size-4 text-primary" />
                    Sessao {selectedSession.type}
                  </CardTitle>
                  <CardDescription>{selectedSession.orderId}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[selectedSession.status]}`}>
                    {selectedSession.status}
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={() => setSelectedSession(null)}>
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data e Horario</p>
                    <p className="text-sm font-medium">{selectedSession.date} as {selectedSession.time} ({selectedSession.duration})</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Local</p>
                    <p className="text-sm font-medium">{selectedSession.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Camera className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fotos Previstas</p>
                    <p className="text-sm font-medium">{selectedSession.totalPhotos} fotos</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User className="size-4 text-primary" /> Dados do Cliente
                </h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 text-sm"><User className="size-3.5 text-muted-foreground" /><span>{selectedSession.client}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Phone className="size-3.5 text-muted-foreground" /><span>{selectedSession.clientPhone}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Mail className="size-3.5 text-muted-foreground" /><span>{selectedSession.clientEmail}</span></div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <PawPrint className="size-4 text-primary" /> Dados do Pet
                </h4>
                <div className="flex items-center gap-3 text-sm">
                  <PawPrint className="size-3.5 text-muted-foreground" />
                  <span>{selectedSession.pet} - {selectedSession.petBreed}</span>
                </div>
              </div>

              {selectedSession.observations && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Observacoes</h4>
                    <p className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">{selectedSession.observations}</p>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex gap-2">
                <a href={`https://wa.me/55${selectedSession.clientPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50">
                    <MessageCircle className="size-4" /> WhatsApp
                  </Button>
                </a>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedSession(null)}>Fechar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
