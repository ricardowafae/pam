"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Channel = "email" | "whatsapp";
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
  status: CampaignStatus;
  subject: string | null;
  body: string | null;
  audience_filter: { type?: AudienceType; days_before?: number } | null;
  total_sent: number | null;
  total_opened: number | null;
  total_clicked: number | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface AutoMessage {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  channel: Channel;
  template: string | null;
  active: boolean;
  created_at: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: string | null;
  channel: Channel;
  subject: string | null;
  body: string | null;
  variables: string[] | null;
  created_at: string;
}

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

function audienceLabel(a: AudienceType | undefined) {
  if (!a) return "Todos os clientes";
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

function triggerLabel(triggerType: string) {
  const map: Record<string, string> = {
    pet_birthday: "Data de nascimento do pet",
    post_purchase: "Pos-compra",
    cart_abandoned: "Carrinho abandonado",
  };
  return map[triggerType] || triggerType;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
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
/*  Template icon mapping                                              */
/* ------------------------------------------------------------------ */

const categoryIconMap: Record<
  string,
  { icon: typeof Gift; color: string; bg: string }
> = {
  natal: { icon: Gift, color: "text-red-500", bg: "bg-red-50" },
  "ano novo": { icon: PartyPopper, color: "text-amber-500", bg: "bg-amber-50" },
  "dia dos animais": {
    icon: PawPrint,
    color: "text-[#8b5e5e]",
    bg: "bg-[#fdf8f4]",
  },
  "dia das maes": { icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  caoniversario: { icon: Cake, color: "text-purple-500", bg: "bg-purple-50" },
  verao: { icon: Sparkles, color: "text-orange-500", bg: "bg-orange-50" },
};

function getTemplateIcon(category: string | null) {
  if (!category) return { icon: Mail, color: "text-[#8b5e5e]", bg: "bg-[#fdf8f4]" };
  const lower = category.toLowerCase();
  return (
    categoryIconMap[lower] || {
      icon: Mail,
      color: "text-[#8b5e5e]",
      bg: "bg-[#fdf8f4]",
    }
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ComunicacaoPage() {
  const supabase = createClient();

  // Data state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  // Loading state
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingAutoMessages, setLoadingAutoMessages] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Search / filter
  const [searchCampaign, setSearchCampaign] = useState("");

  // Campaign create/edit dialog
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [ncName, setNcName] = useState("");
  const [ncChannel, setNcChannel] = useState<Channel>("whatsapp");
  const [ncAudience, setNcAudience] = useState<AudienceType>("todos");
  const [ncSubject, setNcSubject] = useState("");
  const [ncMessage, setNcMessage] = useState("");

  // Auto-message create/edit dialog
  const [autoMsgDialogOpen, setAutoMsgDialogOpen] = useState(false);
  const [editingAutoMsg, setEditingAutoMsg] = useState<AutoMessage | null>(null);
  const [amName, setAmName] = useState("");
  const [amTrigger, setAmTrigger] = useState("pet_birthday");
  const [amChannel, setAmChannel] = useState<Channel>("whatsapp");
  const [amTemplate, setAmTemplate] = useState("");

  // Template create/edit dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(
    null
  );
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("");
  const [tplChannel, setTplChannel] = useState<Channel>("whatsapp");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "campaign" | "auto_message" | "template";
    id: string;
    name: string;
  } | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Fetch functions                                                  */
  /* ---------------------------------------------------------------- */

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar campanhas: " + error.message);
    } else {
      setCampaigns(data ?? []);
    }
    setLoadingCampaigns(false);
  }, []);

  const fetchAutoMessages = useCallback(async () => {
    setLoadingAutoMessages(true);
    const { data, error } = await supabase
      .from("auto_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar mensagens automaticas: " + error.message);
    } else {
      setAutoMessages(data ?? []);
    }
    setLoadingAutoMessages(false);
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar templates: " + error.message);
    } else {
      setTemplates(data ?? []);
    }
    setLoadingTemplates(false);
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchAutoMessages();
    fetchTemplates();
  }, [fetchCampaigns, fetchAutoMessages, fetchTemplates]);

  /* ---------------------------------------------------------------- */
  /*  Campaign CRUD                                                    */
  /* ---------------------------------------------------------------- */

  function resetCampaignForm() {
    setNcName("");
    setNcChannel("whatsapp");
    setNcAudience("todos");
    setNcSubject("");
    setNcMessage("");
    setEditingCampaign(null);
  }

  function openEditCampaign(c: Campaign) {
    setEditingCampaign(c);
    setNcName(c.name);
    setNcChannel(c.channel);
    setNcAudience(
      (c.audience_filter as { type?: AudienceType } | null)?.type ?? "todos"
    );
    setNcSubject(c.subject ?? "");
    setNcMessage(c.body ?? "");
    setNewCampaignOpen(true);
  }

  async function saveCampaign(status: CampaignStatus) {
    if (!ncName.trim()) {
      toast.error("Nome da campanha e obrigatorio.");
      return;
    }
    setSaving(true);

    const payload = {
      name: ncName.trim(),
      channel: ncChannel,
      status,
      subject: ncChannel === "email" ? ncSubject.trim() || null : null,
      body: ncMessage.trim() || null,
      audience_filter: { type: ncAudience },
      scheduled_at: status === "agendada" ? new Date().toISOString() : null,
      sent_at: status === "enviada" ? new Date().toISOString() : null,
    };

    if (editingCampaign) {
      const { error } = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", editingCampaign.id);

      if (error) {
        toast.error("Erro ao atualizar campanha: " + error.message);
      } else {
        toast.success("Campanha atualizada com sucesso!");
        setNewCampaignOpen(false);
        resetCampaignForm();
        fetchCampaigns();
      }
    } else {
      const { error } = await supabase.from("campaigns").insert(payload);

      if (error) {
        toast.error("Erro ao criar campanha: " + error.message);
      } else {
        toast.success(
          status === "enviada"
            ? "Campanha criada e enviada!"
            : status === "agendada"
            ? "Campanha agendada com sucesso!"
            : "Rascunho salvo com sucesso!"
        );
        setNewCampaignOpen(false);
        resetCampaignForm();
        fetchCampaigns();
      }
    }
    setSaving(false);
  }

  async function updateCampaignStatus(id: string, status: CampaignStatus) {
    const updateData: Record<string, unknown> = { status };
    if (status === "enviada") updateData.sent_at = new Date().toISOString();
    if (status === "agendada")
      updateData.scheduled_at = new Date().toISOString();

    const { error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status: " + error.message);
    } else {
      toast.success("Status atualizado!");
      fetchCampaigns();
    }
  }

  async function deleteCampaign(id: string) {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir campanha: " + error.message);
    } else {
      toast.success("Campanha excluida!");
      fetchCampaigns();
    }
  }

  async function duplicateCampaign(c: Campaign) {
    const { error } = await supabase.from("campaigns").insert({
      name: c.name + " (copia)",
      channel: c.channel,
      status: "rascunho" as CampaignStatus,
      subject: c.subject,
      body: c.body,
      audience_filter: c.audience_filter,
    });
    if (error) {
      toast.error("Erro ao duplicar campanha: " + error.message);
    } else {
      toast.success("Campanha duplicada como rascunho!");
      fetchCampaigns();
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Auto-message CRUD                                                */
  /* ---------------------------------------------------------------- */

  function resetAutoMsgForm() {
    setAmName("");
    setAmTrigger("pet_birthday");
    setAmChannel("whatsapp");
    setAmTemplate("");
    setEditingAutoMsg(null);
  }

  function openEditAutoMsg(m: AutoMessage) {
    setEditingAutoMsg(m);
    setAmName(m.name);
    setAmTrigger(m.trigger_type);
    setAmChannel(m.channel);
    setAmTemplate(m.template ?? "");
    setAutoMsgDialogOpen(true);
  }

  async function saveAutoMessage() {
    if (!amName.trim()) {
      toast.error("Nome da mensagem automatica e obrigatorio.");
      return;
    }
    setSaving(true);

    const payload = {
      name: amName.trim(),
      trigger_type: amTrigger,
      channel: amChannel,
      template: amTemplate.trim() || null,
      active: editingAutoMsg ? editingAutoMsg.active : true,
    };

    if (editingAutoMsg) {
      const { error } = await supabase
        .from("auto_messages")
        .update(payload)
        .eq("id", editingAutoMsg.id);

      if (error) {
        toast.error("Erro ao atualizar: " + error.message);
      } else {
        toast.success("Mensagem automatica atualizada!");
        setAutoMsgDialogOpen(false);
        resetAutoMsgForm();
        fetchAutoMessages();
      }
    } else {
      const { error } = await supabase.from("auto_messages").insert(payload);

      if (error) {
        toast.error("Erro ao criar: " + error.message);
      } else {
        toast.success("Mensagem automatica criada!");
        setAutoMsgDialogOpen(false);
        resetAutoMsgForm();
        fetchAutoMessages();
      }
    }
    setSaving(false);
  }

  async function toggleAutoMessage(id: string, currentActive: boolean) {
    setTogglingId(id);
    const { error } = await supabase
      .from("auto_messages")
      .update({ active: !currentActive })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status: " + error.message);
    } else {
      setAutoMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
      );
    }
    setTogglingId(null);
  }

  async function deleteAutoMessage(id: string) {
    const { error } = await supabase
      .from("auto_messages")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Mensagem automatica excluida!");
      fetchAutoMessages();
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Template CRUD                                                    */
  /* ---------------------------------------------------------------- */

  function resetTemplateForm() {
    setTplName("");
    setTplCategory("");
    setTplChannel("whatsapp");
    setTplSubject("");
    setTplBody("");
    setEditingTemplate(null);
  }

  function openEditTemplate(t: MessageTemplate) {
    setEditingTemplate(t);
    setTplName(t.name);
    setTplCategory(t.category ?? "");
    setTplChannel(t.channel);
    setTplSubject(t.subject ?? "");
    setTplBody(t.body ?? "");
    setTemplateDialogOpen(true);
  }

  async function saveTemplate() {
    if (!tplName.trim()) {
      toast.error("Nome do template e obrigatorio.");
      return;
    }
    setSaving(true);

    const payload = {
      name: tplName.trim(),
      category: tplCategory.trim() || null,
      channel: tplChannel,
      subject: tplChannel === "email" ? tplSubject.trim() || null : null,
      body: tplBody.trim() || null,
    };

    if (editingTemplate) {
      const { error } = await supabase
        .from("message_templates")
        .update(payload)
        .eq("id", editingTemplate.id);

      if (error) {
        toast.error("Erro ao atualizar template: " + error.message);
      } else {
        toast.success("Template atualizado!");
        setTemplateDialogOpen(false);
        resetTemplateForm();
        fetchTemplates();
      }
    } else {
      const { error } = await supabase.from("message_templates").insert(payload);

      if (error) {
        toast.error("Erro ao criar template: " + error.message);
      } else {
        toast.success("Template criado!");
        setTemplateDialogOpen(false);
        resetTemplateForm();
        fetchTemplates();
      }
    }
    setSaving(false);
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao excluir template: " + error.message);
    } else {
      toast.success("Template excluido!");
      fetchTemplates();
    }
  }

  function applyTemplate(body: string) {
    setNcMessage(body);
    setNewCampaignOpen(true);
  }

  /* ---------------------------------------------------------------- */
  /*  Delete confirmation                                              */
  /* ---------------------------------------------------------------- */

  async function confirmDelete() {
    if (!deleteTarget) return;
    switch (deleteTarget.type) {
      case "campaign":
        await deleteCampaign(deleteTarget.id);
        break;
      case "auto_message":
        await deleteAutoMessage(deleteTarget.id);
        break;
      case "template":
        await deleteTemplate(deleteTarget.id);
        break;
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  function insertVariable(tag: string) {
    setNcMessage((prev) => prev + tag);
  }

  function insertVariableAutoMsg(tag: string) {
    setAmTemplate((prev) => prev + tag);
  }

  function insertVariableTemplate(tag: string) {
    setTplBody((prev) => prev + tag);
  }

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchCampaign.toLowerCase())
  );

  /* ---------------------------------------------------------------- */
  /*  KPI calculations                                                 */
  /* ---------------------------------------------------------------- */

  const sentCampaigns = campaigns.filter((c) => c.status === "enviada");
  const kpiCampaignsSent = sentCampaigns.length;
  const kpiTotalSent = sentCampaigns.reduce(
    (sum, c) => sum + (c.total_sent ?? 0),
    0
  );
  const kpiTotalOpened = sentCampaigns.reduce(
    (sum, c) => sum + (c.total_opened ?? 0),
    0
  );
  const kpiOpenRate =
    kpiTotalSent > 0 ? Math.round((kpiTotalOpened / kpiTotalSent) * 100) : 0;
  const kpiActiveAutoMsgs = autoMessages.filter((m) => m.active).length;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

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

        <Button
          className="bg-[#8b5e5e] text-white hover:bg-[#7a4f4f]"
          onClick={() => {
            resetCampaignForm();
            setNewCampaignOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Campaign create/edit dialog */}
      <Dialog
        open={newCampaignOpen}
        onOpenChange={(open) => {
          setNewCampaignOpen(open);
          if (!open) resetCampaignForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#3d2b2b]">
              {editingCampaign ? "Editar Campanha" : "Criar Nova Campanha"}
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
            {ncChannel === "email" && (
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
            <Button
              variant="outline"
              onClick={() => {
                setNewCampaignOpen(false);
                resetCampaignForm();
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="border-[#8b5e5e]/30 text-[#8b5e5e]"
              onClick={() => saveCampaign("rascunho")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Pencil className="mr-1.5 size-4" />
              )}
              Salvar Rascunho
            </Button>
            <Button
              variant="outline"
              className="border-[#8b5e5e]/30 text-[#8b5e5e]"
              onClick={() => saveCampaign("agendada")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Clock className="mr-1.5 size-4" />
              )}
              Agendar
            </Button>
            <Button
              className="bg-[#8b5e5e] text-white hover:bg-[#7a4f4f]"
              onClick={() => saveCampaign("enviada")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 size-4" />
              )}
              Enviar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-message create/edit dialog */}
      <Dialog
        open={autoMsgDialogOpen}
        onOpenChange={(open) => {
          setAutoMsgDialogOpen(open);
          if (!open) resetAutoMsgForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#3d2b2b]">
              {editingAutoMsg
                ? "Editar Mensagem Automatica"
                : "Nova Mensagem Automatica"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Aniversario do Pet"
                value={amName}
                onChange={(e) => setAmName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Gatilho</Label>
                <Select
                  value={amTrigger}
                  onValueChange={(v) => setAmTrigger(v ?? "pet_birthday")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_birthday">
                      Aniversario do pet
                    </SelectItem>
                    <SelectItem value="post_purchase">Pos-compra</SelectItem>
                    <SelectItem value="cart_abandoned">
                      Carrinho abandonado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Canal</Label>
                <Select
                  value={amChannel}
                  onValueChange={(v) => setAmChannel(v as Channel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Template da Mensagem</Label>
              <Textarea
                rows={5}
                placeholder="Digite o template da mensagem. Use variaveis como {nome}, {pet_nome}..."
                value={amTemplate}
                onChange={(e) => setAmTemplate(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {variablesList.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariableAutoMsg(v.tag)}
                    className="rounded-full border border-[#8b5e5e]/20 bg-[#fdf8f4] px-2.5 py-0.5 text-xs text-[#8b5e5e] transition-colors hover:bg-[#8b5e5e]/10"
                    title={v.desc}
                  >
                    {v.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAutoMsgDialogOpen(false);
                resetAutoMsgForm();
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#8b5e5e] text-white hover:bg-[#7a4f4f]"
              onClick={saveAutoMessage}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {editingAutoMsg ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template create/edit dialog */}
      <Dialog
        open={templateDialogOpen}
        onOpenChange={(open) => {
          setTemplateDialogOpen(open);
          if (!open) resetTemplateForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#3d2b2b]">
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Natal"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Input
                  placeholder="Ex: Natal, Verao, Caoniversario"
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select
                value={tplChannel}
                onValueChange={(v) => setTplChannel(v as Channel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tplChannel === "email" && (
              <div className="space-y-1.5">
                <Label>Assunto</Label>
                <Input
                  placeholder="Assunto do e-mail"
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Corpo da Mensagem</Label>
              <Textarea
                rows={5}
                placeholder="Conteudo do template..."
                value={tplBody}
                onChange={(e) => setTplBody(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {variablesList.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariableTemplate(v.tag)}
                    className="rounded-full border border-[#8b5e5e]/20 bg-[#fdf8f4] px-2.5 py-0.5 text-xs text-[#8b5e5e] transition-colors hover:bg-[#8b5e5e]/10"
                    title={v.desc}
                  >
                    {v.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTemplateDialogOpen(false);
                resetTemplateForm();
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#8b5e5e] text-white hover:bg-[#7a4f4f]"
              onClick={saveTemplate}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {editingTemplate ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-[#3d2b2b]">
              Confirmar Exclusao
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#6b4c4c]">
            Tem certeza que deseja excluir{" "}
            <strong>{deleteTarget?.name}</strong>? Esta acao nao pode ser
            desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8b5e5e]/10">
              <Send className="size-5 text-[#8b5e5e]" />
            </div>
            <div>
              <p className="text-xs text-[#6b4c4c]">Campanhas Enviadas</p>
              <p className="text-xl font-bold text-[#3d2b2b]">
                {loadingCampaigns ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  kpiCampaignsSent
                )}
              </p>
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
              <p className="text-xl font-bold text-[#3d2b2b]">
                {loadingCampaigns ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  `${kpiOpenRate}%`
                )}
              </p>
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
              <p className="text-xl font-bold text-[#3d2b2b]">
                {loadingCampaigns ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  kpiTotalSent.toLocaleString("pt-BR")
                )}
              </p>
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
                {loadingAutoMessages ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  kpiActiveAutoMsgs
                )}
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
          <TabsTrigger value="templates">Templates</TabsTrigger>
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

          {/* Loading */}
          {loadingCampaigns && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
            </div>
          )}

          {/* Campaign cards */}
          {!loadingCampaigns && (
            <div className="space-y-3">
              {filteredCampaigns.map((c) => {
                const audienceType = (
                  c.audience_filter as { type?: AudienceType } | null
                )?.type;
                const openRate =
                  c.total_sent && c.total_sent > 0 && c.total_opened != null
                    ? Math.round((c.total_opened / c.total_sent) * 100)
                    : undefined;
                const clickRate =
                  c.total_sent && c.total_sent > 0 && c.total_clicked != null
                    ? Math.round((c.total_clicked / c.total_sent) * 100)
                    : undefined;

                return (
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
                            {c.body}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6b4c4c]">
                            {audienceType && (
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {audienceLabel(audienceType)}
                              </span>
                            )}
                            {c.total_sent != null && c.total_sent > 0 && (
                              <span className="flex items-center gap-1">
                                <Send className="size-3" />
                                {c.total_sent} enviados
                              </span>
                            )}
                            {c.scheduled_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                Agendada: {formatDate(c.scheduled_at)}
                              </span>
                            )}
                            {c.sent_at && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="size-3" />
                                Enviada: {formatDate(c.sent_at)}
                              </span>
                            )}
                          </div>

                          {/* Metrics for sent campaigns */}
                          {c.status === "enviada" && openRate !== undefined && (
                            <div className="flex items-center gap-4 pt-1">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-gray-100">
                                  <div
                                    className="h-2 rounded-full bg-green-500"
                                    style={{ width: `${openRate}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-green-700">
                                  {openRate}% abertos
                                </span>
                              </div>
                              {clickRate !== undefined && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 rounded-full bg-gray-100">
                                    <div
                                      className="h-2 rounded-full bg-blue-500"
                                      style={{ width: `${clickRate}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-blue-700">
                                    {clickRate}% cliques
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
                            title="Duplicar"
                            onClick={() => duplicateCampaign(c)}
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
                                onClick={() => openEditCampaign(c)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-blue-500 hover:text-blue-700"
                                title="Agendar"
                                onClick={() =>
                                  updateCampaignStatus(c.id, "agendada")
                                }
                              >
                                <Clock className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-green-500 hover:text-green-700"
                                title="Enviar"
                                onClick={() =>
                                  updateCampaignStatus(c.id, "enviada")
                                }
                              >
                                <Send className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-red-400 hover:text-red-600"
                                title="Excluir"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: "campaign",
                                    id: c.id,
                                    name: c.name,
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </>
                          )}
                          {c.status === "agendada" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-[#6b4c4c]"
                                title="Editar"
                                onClick={() => openEditCampaign(c)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-green-500 hover:text-green-700"
                                title="Enviar Agora"
                                onClick={() =>
                                  updateCampaignStatus(c.id, "enviada")
                                }
                              >
                                <Send className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-red-400 hover:text-red-600"
                                title="Cancelar"
                                onClick={() =>
                                  updateCampaignStatus(c.id, "cancelada")
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-12 text-[#6b4c4c]">
                  <MessageSquareMore className="size-10 opacity-30" />
                  <p className="text-sm">
                    {searchCampaign
                      ? "Nenhuma campanha encontrada"
                      : "Nenhuma campanha criada ainda"}
                  </p>
                  {!searchCampaign && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-[#8b5e5e]/30 text-[#8b5e5e]"
                      onClick={() => {
                        resetCampaignForm();
                        setNewCampaignOpen(true);
                      }}
                    >
                      <Plus className="mr-1.5 size-4" />
                      Criar primeira campanha
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
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
              onClick={() => {
                resetAutoMsgForm();
                setAutoMsgDialogOpen(true);
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Nova Automatica
            </Button>
          </div>

          {/* Loading */}
          {loadingAutoMessages && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
            </div>
          )}

          {!loadingAutoMessages && autoMessages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-[#6b4c4c]">
              <MessageSquareMore className="size-10 opacity-30" />
              <p className="text-sm">Nenhuma mensagem automatica criada ainda</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-[#8b5e5e]/30 text-[#8b5e5e]"
                onClick={() => {
                  resetAutoMsgForm();
                  setAutoMsgDialogOpen(true);
                }}
              >
                <Plus className="mr-1.5 size-4" />
                Criar primeira mensagem automatica
              </Button>
            </div>
          )}

          {!loadingAutoMessages && autoMessages.length > 0 && (
            <div className="space-y-3">
              {autoMessages.map((m) => (
                <Card
                  key={m.id}
                  className={cn(
                    "transition-all",
                    !m.active && "opacity-60"
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
                              m.active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }
                          >
                            {m.active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#6b4c4c]">
                          <span className="font-medium">Gatilho:</span>{" "}
                          {triggerLabel(m.trigger_type)}
                        </p>
                        <p className="line-clamp-2 text-sm text-[#6b4c4c]/80">
                          {m.template}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "text-xs",
                            m.active
                              ? "border-red-200 text-red-500 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          )}
                          onClick={() => toggleAutoMessage(m.id, m.active)}
                          disabled={togglingId === m.id}
                        >
                          {togglingId === m.id ? (
                            <Loader2 className="mr-1 size-3 animate-spin" />
                          ) : null}
                          {m.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-[#6b4c4c]"
                          title="Editar"
                          onClick={() => openEditAutoMsg(m)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-400 hover:text-red-600"
                          title="Excluir"
                          onClick={() => {
                            setDeleteTarget({
                              type: "auto_message",
                              id: m.id,
                              name: m.name,
                            });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---- Tab: Templates ---- */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6b4c4c]">
              Templates prontos para datas especiais. Clique para usar como base
              de uma nova campanha.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-[#8b5e5e]/30 text-[#8b5e5e]"
              onClick={() => {
                resetTemplateForm();
                setTemplateDialogOpen(true);
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Novo Template
            </Button>
          </div>

          {/* Loading */}
          {loadingTemplates && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-[#8b5e5e]" />
            </div>
          )}

          {!loadingTemplates && templates.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-[#6b4c4c]">
              <MessageSquareMore className="size-10 opacity-30" />
              <p className="text-sm">Nenhum template criado ainda</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-[#8b5e5e]/30 text-[#8b5e5e]"
                onClick={() => {
                  resetTemplateForm();
                  setTemplateDialogOpen(true);
                }}
              >
                <Plus className="mr-1.5 size-4" />
                Criar primeiro template
              </Button>
            </div>
          )}

          {!loadingTemplates && templates.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => {
                const iconInfo = getTemplateIcon(t.category);
                const Icon = iconInfo.icon;
                return (
                  <Card
                    key={t.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => applyTemplate(t.body ?? "")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg",
                            iconInfo.bg
                          )}
                        >
                          <Icon className={cn("size-5", iconInfo.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#3d2b2b]">
                            {t.name}
                          </h3>
                          <p className="text-xs text-[#6b4c4c]">
                            {t.category || "Sem categoria"} &middot;{" "}
                            {t.channel === "email" ? "E-mail" : "WhatsApp"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-[#6b4c4c]"
                            title="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTemplate(t);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-400 hover:text-red-600"
                            title="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                type: "template",
                                id: t.id,
                                name: t.name,
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-[#6b4c4c]/80">
                        {t.body}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
                        toast.success("Copiado!");
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
