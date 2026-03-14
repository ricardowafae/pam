"use client";

import { useState } from "react";
import {
  MessageSquareMore,
  Mail,
  Send,
  Plus,
  Calendar,
  Users,
  PawPrint,
  PartyPopper,
  Heart,
  Gift,
  Cake,
  Clock,
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  Phone,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Channel = "email" | "whatsapp" | "ambos";
type CampaignStatus = "rascunho" | "agendada" | "enviada" | "cancelada";
type AudienceType =
  | "todos"
  | "aniversario_pet"
  | "aniversario_tutor"
  | "data_festiva"
  | "clientes_inativos"
  | "compradores_dogbook"
  | "personalizado";

interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  audience: AudienceType;
  audienceCount: number;
  status: CampaignStatus;
  subject?: string;
  message: string;
  scheduledAt?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
}

interface AutoMessage {
  id: string;
  name: string;
  trigger: string;
  channel: Channel;
  enabled: boolean;
  message: string;
  sentCount: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Natal 2025 - Fotos Natalinas",
    channel: "ambos",
    audience: "data_festiva",
    audienceCount: 342,
    status: "enviada",
    subject: "Registre o Natal do seu pet com um Dogbook especial!",
    message:
      "Ola {nome}! O Natal esta chegando e que tal eternizar esse momento com {pet_nome}? Aproveite nosso tema natalino exclusivo!",
    sentAt: "20/12/2025",
    openRate: 68,
    clickRate: 24,
  },
  {
    id: "2",
    name: "Ano Novo 2026 - Novo Tema",
    channel: "email",
    audience: "compradores_dogbook",
    audienceCount: 187,
    status: "agendada",
    subject: "Comece 2026 com um novo Dogbook!",
    message:
      "Ola {nome}! Nosso tema Ano Novo acaba de chegar. Que tal um novo Dogbook para {pet_nome}?",
    scheduledAt: "28/12/2025",
  },
  {
    id: "3",
    name: "Recuperacao - Carrinho Abandonado",
    channel: "whatsapp",
    audience: "personalizado",
    audienceCount: 23,
    status: "rascunho",
    message:
      "Oi {nome}! Notamos que voce deixou um Dogbook no carrinho. Precisa de ajuda para finalizar?",
  },
];

const mockAutoMessages: AutoMessage[] = [
  {
    id: "1",
    name: "Aniversario do Pet",
    trigger: "Data de nascimento do pet",
    channel: "whatsapp",
    enabled: true,
    message:
      "Parabens! Hoje e o aniversario de {pet_nome}! Que tal registrar esse dia especial com uma sessao fotografica? Use o codigo PARABENS10 para 10% de desconto.",
    sentCount: 89,
  },
  {
    id: "2",
    name: "Aniversario do Tutor (PF)",
    trigger: "Data de nascimento do tutor (somente Pessoa Fisica)",
    channel: "email",
    enabled: true,
    message:
      "Feliz aniversario, {nome}! Sabemos o quanto {pet_nome} e especial para voce. Presenteie-se com um Dogbook e ganhe frete gratis!",
    sentCount: 45,
  },
  {
    id: "3",
    name: "Lembrete - Dia dos Animais",
    trigger: "04 de Outubro",
    channel: "ambos",
    enabled: true,
    message:
      "Hoje e o Dia dos Animais! Celebre com uma foto especial de {pet_nome}. Aproveite condicoes exclusivas para sessoes fotograficas.",
    sentCount: 210,
  },
  {
    id: "4",
    name: "Lembrete - Natal",
    trigger: "15 de Dezembro",
    channel: "ambos",
    enabled: true,
    message:
      "O Natal esta chegando! Ainda da tempo de garantir o Dogbook Natalino de {pet_nome}. Ultimas vagas para sessoes fotograficas!",
    sentCount: 178,
  },
  {
    id: "5",
    name: "Pos-compra - Lembrete de Fotos",
    trigger: "3 dias apos compra do Dogbook",
    channel: "whatsapp",
    enabled: false,
    message:
      "Oi {nome}! Ja enviou as fotos de {pet_nome} para o seu Dogbook? Acesse o portal do cliente para fazer o upload.",
    sentCount: 312,
  },
];

const festiveTemplates = [
  {
    name: "Natal",
    icon: Gift,
    color: "text-red-500",
    bg: "bg-red-50",
    message:
      "O Natal esta chegando! Registre esse momento magico com {pet_nome}. Tema Natalino disponivel no Dogbook!",
  },
  {
    name: "Ano Novo",
    icon: PartyPopper,
    color: "text-amber-500",
    bg: "bg-amber-50",
    message:
      "Feliz Ano Novo! Comece o ano com um novo Dogbook para {pet_nome}. Novas memorias, novas paginas!",
  },
  {
    name: "Dia dos Animais",
    icon: PawPrint,
    color: "text-[#8b5e5e]",
    bg: "bg-[#fdf8f4]",
    message:
      "Hoje celebramos nossos melhores amigos! Que tal uma sessao fotografica especial para {pet_nome}?",
  },
  {
    name: "Dia das Maes",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-50",
    message:
      "Para a mae de pet mais incrivel! Presenteie-se com um Dogbook e eternize os momentos com {pet_nome}.",
  },
  {
    name: "Caoniversario",
    icon: Cake,
    color: "text-purple-500",
    bg: "bg-purple-50",
    message:
      "Parabens, {pet_nome}! Hoje e seu dia especial. Que tal um Dogbook tema Caoniversario para celebrar?",
  },
  {
    name: "Verao",
    icon: Sparkles,
    color: "text-orange-500",
    bg: "bg-orange-50",
    message:
      "O verao chegou! Aproveite a luz natural para uma sessao ao ar livre com {pet_nome}. Tema Verao no Dogbook!",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function channelBadge(ch: Channel) {
  switch (ch) {
    case "email":
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-600">
          <Mail className="mr-1 size-3" /> E-mail
        </Badge>
      );
    case "whatsapp":
      return (
        <Badge variant="outline" className="border-green-300 text-green-600">
          <Phone className="mr-1 size-3" /> WhatsApp
        </Badge>
      );
    case "ambos":
      return (
        <Badge variant="outline" className="border-purple-300 text-purple-600">
          <Send className="mr-1 size-3" /> Ambos
        </Badge>
      );
  }
}

function statusBadge(st: CampaignStatus) {
  const map: Record<CampaignStatus, { label: string; classes: string }> = {
    rascunho: {
      label: "Rascunho",
      classes: "bg-gray-100 text-gray-600",
    },
    agendada: {
      label: "Agendada",
      classes: "bg-blue-50 text-blue-600",
    },
    enviada: {
      label: "Enviada",
      classes: "bg-green-50 text-green-700",
    },
    cancelada: {
      label: "Cancelada",
      classes: "bg-red-50 text-red-600",
    },
  };
  const s = map[st];
  return <Badge className={s.classes}>{s.label}</Badge>;
}

function audienceLabel(a: AudienceType) {
  const map: Record<AudienceType, string> = {
    todos: "Todos os clientes",
    aniversario_pet: "Aniversario do pet",
    aniversario_tutor: "Aniversario do tutor (PF)",
    data_festiva: "Data festiva",
    clientes_inativos: "Clientes inativos (60+ dias)",
    compradores_dogbook: "Compradores de Dogbook",
    personalizado: "Segmento personalizado",
  };
  return map[a];
}

/* ------------------------------------------------------------------ */
/*  Variables helper                                                   */
/* ------------------------------------------------------------------ */

const variablesList = [
  { tag: "{nome}", desc: "Nome do tutor" },
  { tag: "{pet_nome}", desc: "Nome do pet" },
  { tag: "{pet_raca}", desc: "Raca do pet" },
  { tag: "{email}", desc: "E-mail do tutor" },
  { tag: "{link_portal}", desc: "Link do portal do cliente" },
  { tag: "{link_loja}", desc: "Link da loja" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ComunicacaoPage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [autoMessages, setAutoMessages] =
    useState<AutoMessage[]>(mockAutoMessages);
  const [searchCampaign, setSearchCampaign] = useState("");
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);

  // New campaign form
  const [ncName, setNcName] = useState("");
  const [ncChannel, setNcChannel] = useState<Channel>("whatsapp");
  const [ncAudience, setNcAudience] = useState<AudienceType>("todos");
  const [ncSubject, setNcSubject] = useState("");
  const [ncMessage, setNcMessage] = useState("");

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchCampaign.toLowerCase())
  );

  function toggleAutoMessage(id: string) {
    setAutoMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  }

  function applyTemplate(msg: string) {
    setNcMessage(msg);
    setNewCampaignOpen(true);
  }

  function insertVariable(tag: string) {
    setNcMessage((prev) => prev + tag);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#3d2b2b]">
            Comunicacao
          </h1>
          <p className="text-sm text-[#6b4c4c]">
            Campanhas, mensagens automaticas e comunicacao com clientes
          </p>
        </div>

        <Dialog open={newCampaignOpen} onOpenChange={setNewCampaignOpen}>
          <Button
            className="bg-[#8b5e5e] text-white hover:bg-[#7a4f4f]"
            onClick={() => setNewCampaignOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            Nova Campanha
          </Button>

          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-[#3d2b2b]">
                Criar Nova Campanha
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label>Nome da Campanha</Label>
                <Input
                  placeholder="Ex: Natal 2026 - Fotos Natalinas"
                  value={ncName}
                  onChange={(e) => setNcName(e.target.value)}
                />
              </div>

              {/* Channel + Audience */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Canal de Envio</Label>
                  <Select
                    value={ncChannel}
                    onValueChange={(v) => setNcChannel(v as Channel)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Publico-alvo</Label>
                  <Select
                    value={ncAudience}
                    onValueChange={(v) => setNcAudience(v as AudienceType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os clientes</SelectItem>
                      <SelectItem value="aniversario_pet">
                        Aniversariantes do pet (mes)
                      </SelectItem>
                      <SelectItem value="aniversario_tutor">
                        Aniversario do tutor (PF)
                      </SelectItem>
                      <SelectItem value="data_festiva">Data festiva</SelectItem>
                      <SelectItem value="compradores_dogbook">
                        Compradores de Dogbook
                      </SelectItem>
                      <SelectItem value="clientes_inativos">
                        Clientes inativos (60+ dias)
                      </SelectItem>
                      <SelectItem value="personalizado">
                        Segmento personalizado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject (email only) */}
              {(ncChannel === "email" || ncChannel === "ambos") && (
                <div className="space-y-1.5">
                  <Label>Assunto do E-mail</Label>
                  <Input
                    placeholder="Assunto que aparecera na caixa de entrada"
                    value={ncSubject}
                    onChange={(e) => setNcSubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message */}
              <div className="space-y-1.5">
                <Label>Mensagem</Label>
                <Textarea
                  rows={5}
                  placeholder="Digite sua mensagem aqui. Use variaveis como {nome}, {pet_nome}..."
                  value={ncMessage}
                  onChange={(e) => setNcMessage(e.target.value)}
                />
                {/* Variables */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {variablesList.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="rounded-full border border-[#8b5e5e]/20 bg-[#fdf8f4] px-2.5 py-0.5 text-xs text-[#8b5e5e] transition-colors hover:bg-[#8b5e5e]/10"
                      title={v.desc}
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Integracao necessaria</p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    <strong>WhatsApp:</strong> Utiliza a API do WhatsApp
                    Business (via Twilio ou Z-API) para disparos em massa.
                    <br />
                    <strong>E-mail:</strong> Utiliza Resend ou SendGrid para
                    envio de campanhas com templates HTML.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewCampaignOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                className="border-[#8b5e5e]/30 text-[#8b5e5e]"
                onClick={() => setNewCampaignOpen(false)}
              >
                <Clock className="mr-1.5 size-4" />
                Agendar
              </Button>
              <Button
                className="bg-[#8b5e5e] text-white hover:bg-[#7a4f4f]"
                onClick={() => setNewCampaignOpen(false)}
              >
                <Send className="mr-1.5 size-4" />
                Enviar Agora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8b5e5e]/10">
              <Send className="size-5 text-[#8b5e5e]" />
            </div>
            <div>
              <p className="text-xs text-[#6b4c4c]">Campanhas Enviadas</p>
              <p className="text-xl font-bold text-[#3d2b2b]">12</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[#6b4c4c]">Taxa de Abertura</p>
              <p className="text-xl font-bold text-[#3d2b2b]">64%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#6b4c4c]">Contatos Alcancados</p>
              <p className="text-xl font-bold text-[#3d2b2b]">1.247</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50">
              <Calendar className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-[#6b4c4c]">Msgs Automaticas Ativas</p>
              <p className="text-xl font-bold text-[#3d2b2b]">
                {autoMessages.filter((m) => m.enabled).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campanhas">
        <TabsList>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="automaticas">Mensagens Automaticas</TabsTrigger>
          <TabsTrigger value="templates">Templates Rapidos</TabsTrigger>
          <TabsTrigger value="variaveis">Variaveis</TabsTrigger>
        </TabsList>

        {/* ---- Tab: Campanhas ---- */}
        <TabsContent value="campanhas" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b4c4c]/50" />
              <Input
                placeholder="Buscar campanhas..."
                className="pl-9"
                value={searchCampaign}
                onChange={(e) => setSearchCampaign(e.target.value)}
              />
            </div>
          </div>

          {/* Campaign cards */}
          <div className="space-y-3">
            {filteredCampaigns.map((c) => (
              <Card key={c.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-[#3d2b2b]">
                          {c.name}
                        </h3>
                        {statusBadge(c.status)}
                        {channelBadge(c.channel)}
                      </div>

                      {c.subject && (
                        <p className="text-sm text-[#6b4c4c]">
                          <span className="font-medium">Assunto:</span>{" "}
                          {c.subject}
                        </p>
                      )}

                      <p className="line-clamp-2 text-sm text-[#6b4c4c]/80">
                        {c.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6b4c4c]">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {c.audienceCount} destinatarios -{" "}
                          {audienceLabel(c.audience)}
                        </span>
                        {c.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Agendada: {c.scheduledAt}
                          </span>
                        )}
                        {c.sentAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="size-3" />
                            Enviada: {c.sentAt}
                          </span>
                        )}
                      </div>

                      {/* Metrics for sent campaigns */}
                      {c.status === "enviada" &&
                        c.openRate !== undefined && (
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-gray-100">
                                <div
                                  className="h-2 rounded-full bg-green-500"
                                  style={{ width: `${c.openRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-green-700">
                                {c.openRate}% abertos
                              </span>
                            </div>
                            {c.clickRate !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-gray-100">
                                  <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${c.clickRate}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-blue-700">
                                  {c.clickRate}% cliques
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-[#6b4c4c]"
                        title="Visualizar"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-[#6b4c4c]"
                        title="Duplicar"
                      >
                        <Copy className="size-4" />
                      </Button>
                      {c.status === "rascunho" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-[#6b4c4c]"
                            title="Editar"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCampaigns.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-[#6b4c4c]">
                <MessageSquareMore className="size-10 opacity-30" />
                <p className="text-sm">Nenhuma campanha encontrada</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---- Tab: Mensagens Automaticas ---- */}
        <TabsContent value="automaticas" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6b4c4c]">
              Mensagens enviadas automaticamente com base em datas e eventos dos
              clientes.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-[#8b5e5e]/30 text-[#8b5e5e]"
            >
              <Plus className="mr-1.5 size-4" />
              Nova Automatica
            </Button>
          </div>

          <div className="space-y-3">
            {autoMessages.map((m) => (
              <Card
                key={m.id}
                className={cn(
                  "transition-all",
                  !m.enabled && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-[#3d2b2b]">
                          {m.name}
                        </h3>
                        {channelBadge(m.channel)}
                        <Badge
                          className={
                            m.enabled
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }
                        >
                          {m.enabled ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#6b4c4c]">
                        <span className="font-medium">Gatilho:</span>{" "}
                        {m.trigger}
                      </p>
                      <p className="line-clamp-2 text-sm text-[#6b4c4c]/80">
                        {m.message}
                      </p>
                      <p className="text-xs text-[#6b4c4c]/60">
                        {m.sentCount} mensagens enviadas
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "text-xs",
                          m.enabled
                            ? "border-red-200 text-red-500 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        )}
                        onClick={() => toggleAutoMessage(m.id)}
                      >
                        {m.enabled ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-[#6b4c4c]"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---- Tab: Templates Rapidos ---- */}
        <TabsContent value="templates" className="space-y-4">
          <p className="text-sm text-[#6b4c4c]">
            Templates prontos para datas especiais. Clique para usar como base
            de uma nova campanha.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {festiveTemplates.map((t) => {
              const Icon = t.icon;
              return (
                <Card
                  key={t.name}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => applyTemplate(t.message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          t.bg
                        )}
                      >
                        <Icon className={cn("size-5", t.color)} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#3d2b2b]">
                          {t.name}
                        </h3>
                        <p className="text-xs text-[#6b4c4c]">
                          Clique para usar
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-[#6b4c4c]/80">
                      {t.message}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ---- Tab: Variaveis ---- */}
        <TabsContent value="variaveis" className="space-y-4">
          <p className="text-sm text-[#6b4c4c]">
            Variaveis dinamicas que serao substituidas pelos dados de cada
            cliente no envio.
          </p>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[#8b5e5e]/10">
                {variablesList.map((v) => (
                  <div
                    key={v.tag}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <code className="rounded bg-[#fdf8f4] px-2 py-0.5 text-sm font-medium text-[#8b5e5e]">
                        {v.tag}
                      </code>
                      <span className="text-sm text-[#6b4c4c]">{v.desc}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-[#6b4c4c]"
                      onClick={() => {
                        navigator.clipboard.writeText(v.tag);
                      }}
                      title="Copiar"
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration info */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 font-medium text-blue-800">
                <AlertCircle className="size-4" />
                Sobre as Integracoes
              </h3>
              <div className="mt-3 space-y-3 text-sm text-blue-700">
                <div>
                  <p className="font-medium flex items-center gap-1.5">
                    <Phone className="size-3.5" /> WhatsApp Business API
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    Recomendamos a integracao via{" "}
                    <strong>Twilio</strong> ou <strong>Z-API</strong> para
                    disparos em massa. E necessario ter um numero de WhatsApp
                    Business verificado e templates de mensagem aprovados pela
                    Meta.
                  </p>
                </div>
                <Separator className="bg-blue-200" />
                <div>
                  <p className="font-medium flex items-center gap-1.5">
                    <Mail className="size-3.5" /> E-mail Transacional
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    Recomendamos o <strong>Resend</strong> (gratis ate 3.000
                    e-mails/mes) ou <strong>SendGrid</strong>. Os e-mails serao
                    enviados com templates HTML responsivos e personalizados com
                    a marca PAM.
                  </p>
                </div>
                <Separator className="bg-blue-200" />
                <div>
                  <p className="font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> Agendamento
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    Mensagens automaticas (aniversario do pet, datas festivas)
                    sao verificadas diariamente via <strong>Supabase Edge
                    Functions</strong> com cron job. Nenhuma infraestrutura
                    externa necessaria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
