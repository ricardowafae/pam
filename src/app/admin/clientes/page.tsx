"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useCepLookup } from "@/hooks/useCepLookup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DateRangeFilter,
  type DateRange,
  isInRange,
  getDefault30DayRange,
} from "@/components/admin/DateRangeFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  ShoppingBag,
  Camera,
  BookOpen,
  FileSearch,
  X,
  Copy,
  Dog,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Star,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Repeat,
  Heart,
  Loader2,
  KeyRound,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface Pet {
  name: string;
  breed: string;
  birthDate: string;
  photoUrl: string;
  size: string;
  gender: string;
}

type ClientType = "pf" | "pj";

interface DogbookSubOrder {
  subId: string;
  theme: string;
  petName: string;
  stage: string;
  photosUploaded: number;
  photosRequired: number;
}

interface SessionSubOrder {
  subId: string;
  type: "Pocket" | "Estudio" | "Completa";
  petName: string;
  date: string;
  stage: string;
  photosDelivered: number;
}

interface Purchase {
  id: string;
  date: string;
  type: "dogbook" | "sessao" | "misto";
  dogbooks: DogbookSubOrder[];
  sessions: SessionSubOrder[];
  total: string;
  payment: "Pago" | "Pendente" | "Parcial";
  paymentMethod: string;
  coupon: string;
}

type ClientStatus = "ativo" | "inativo" | "novo";

interface Interaction {
  date: string;
  type: "compra" | "mensagem" | "sessao" | "aprovacao" | "upload" | "visita";
  description: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  clientType: ClientType;
  cpfCnpj: string;
  pets: Pet[];
  photoUrl: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  fullAddress: string;
  notes: string;
  razaoSocial: string;
  nomeFantasia: string;
  purchases: Purchase[];
  createdAt: string;
  lastActivity: string;
  status: ClientStatus;
  source: string;
  interactions: Interaction[];
  tags: string[];
}

/* ────────────────────── Mock Data ────────────────────── */

const mockClients: Client[] = [
  {
    id: 1,
    name: "Ana Souza",
    email: "ana@email.com",
    phone: "(11) 99123-4567",
    city: "Sao Paulo",
    state: "SP",
    clientType: "pf",
    cpfCnpj: "123.456.789-00",
    photoUrl: "",
    pets: [
      { name: "Thor", breed: "Golden Retriever", birthDate: "2022-05-15", photoUrl: "", size: "Grande", gender: "Macho" },
      { name: "Luna", breed: "SRD", birthDate: "2023-01-20", photoUrl: "", size: "Medio", gender: "Femea" },
    ],
    address: { cep: "05423-010", street: "R. dos Pinheiros", number: "1234", complement: "Apto 42", neighborhood: "Pinheiros", city: "Sao Paulo", state: "SP" },
    fullAddress: "R. dos Pinheiros, 1234, Apto 42 - Pinheiros, Sao Paulo - SP",
    notes: "Prefere agendamentos pela manha",
    razaoSocial: "",
    nomeFantasia: "",
    purchases: [
      {
        id: "#PAM-001",
        date: "2026-03-10",
        type: "dogbook",
        dogbooks: [
          { subId: "#PAM-001-1", theme: "Verao", petName: "Thor", stage: "Em Producao", photosUploaded: 30, photosRequired: 30 },
        ],
        sessions: [],
        total: "R$ 490,00",
        payment: "Pago",
        paymentMethod: "Cartao 10x",
        coupon: "",
      },
      {
        id: "#SES-001",
        date: "2026-03-10",
        type: "sessao",
        dogbooks: [],
        sessions: [
          { subId: "#SES-001-1", type: "Pocket", petName: "Thor", date: "2026-03-15", stage: "Confirmada", photosDelivered: 0 },
        ],
        total: "R$ 900,00",
        payment: "Pago",
        paymentMethod: "PIX",
        coupon: "",
      },
    ],
    createdAt: "2025-12-01",
    lastActivity: "2026-03-10",
    status: "ativo",
    source: "Instagram",
    interactions: [
      { date: "2026-03-10", type: "compra", description: "Comprou Dogbook Verao + Sessao Pocket" },
      { date: "2026-03-08", type: "visita", description: "Visitou pagina de sessoes" },
      { date: "2026-03-05", type: "mensagem", description: "Perguntou sobre temas disponiveis" },
    ],
    tags: ["VIP", "Recorrente"],
  },
  {
    id: 2,
    name: "Carlos Mendes",
    email: "carlos@email.com",
    phone: "(11) 98765-4321",
    city: "Sao Paulo",
    state: "SP",
    clientType: "pf",
    cpfCnpj: "987.654.321-00",
    photoUrl: "",
    pets: [
      { name: "Luna", breed: "Labrador", birthDate: "2021-08-10", photoUrl: "", size: "Grande", gender: "Femea" },
      { name: "Bella", breed: "Poodle", birthDate: "2023-03-05", photoUrl: "", size: "Pequeno", gender: "Femea" },
    ],
    address: { cep: "01310-100", street: "Av. Paulista", number: "900", complement: "", neighborhood: "Bela Vista", city: "Sao Paulo", state: "SP" },
    fullAddress: "Av. Paulista, 900 - Bela Vista, Sao Paulo - SP",
    notes: "",
    razaoSocial: "",
    nomeFantasia: "",
    purchases: [
      {
        id: "#PAM-002",
        date: "2026-03-09",
        type: "misto",
        dogbooks: [
          { subId: "#PAM-002-1", theme: "Natal", petName: "Luna", stage: "Aprovacao Layout", photosUploaded: 30, photosRequired: 30 },
          { subId: "#PAM-002-2", theme: "Caoniversario", petName: "Luna", stage: "Aguardando Fotos", photosUploaded: 12, photosRequired: 30 },
        ],
        sessions: [
          { subId: "#SES-002-1", type: "Estudio", petName: "Luna", date: "2026-03-16", stage: "Aguardando Pagamento", photosDelivered: 0 },
          { subId: "#SES-002-2", type: "Pocket", petName: "Bella", date: "2026-03-17", stage: "Agendada", photosDelivered: 0 },
        ],
        total: "R$ 5.531,00",
        payment: "Parcial",
        paymentMethod: "Cartao 10x",
        coupon: "FIRST10",
      },
    ],
    createdAt: "2026-01-15",
    lastActivity: "2026-03-09",
    status: "ativo",
    source: "Google",
    interactions: [
      { date: "2026-03-09", type: "compra", description: "Compra mista: 2 Dogbooks + 2 Sessoes" },
      { date: "2026-03-07", type: "visita", description: "Visitou pagina do Dogbook" },
    ],
    tags: [],
  },
  {
    id: 3,
    name: "Fernanda Lima",
    email: "fernanda@email.com",
    phone: "(11) 97654-3210",
    city: "Campinas",
    state: "SP",
    clientType: "pf",
    cpfCnpj: "456.789.123-00",
    photoUrl: "",
    pets: [
      { name: "Max", breed: "Pastor Alemao", birthDate: "2020-11-30", photoUrl: "", size: "Grande", gender: "Macho" },
    ],
    address: { cep: "13010-001", street: "R. Barao de Jaguara", number: "500", complement: "", neighborhood: "Centro", city: "Campinas", state: "SP" },
    fullAddress: "R. Barao de Jaguara, 500 - Centro, Campinas - SP",
    notes: "Cliente VIP - 3a compra",
    razaoSocial: "",
    nomeFantasia: "",
    purchases: [
      {
        id: "#PAM-003",
        date: "2026-03-08",
        type: "dogbook",
        dogbooks: [
          { subId: "#PAM-003-1", theme: "Inverno", petName: "Max", stage: "Aprovacao Layout", photosUploaded: 30, photosRequired: 30 },
        ],
        sessions: [],
        total: "R$ 490,00",
        payment: "Pago",
        paymentMethod: "PIX",
        coupon: "",
      },
      {
        id: "#SES-003",
        date: "2026-03-08",
        type: "sessao",
        dogbooks: [],
        sessions: [
          { subId: "#SES-003-1", type: "Completa", petName: "Max", date: "2026-03-18", stage: "Realizada", photosDelivered: 45 },
        ],
        total: "R$ 4.900,00",
        payment: "Pago",
        paymentMethod: "Cartao 10x",
        coupon: "",
      },
      {
        id: "#PAM-010",
        date: "2025-10-05",
        type: "dogbook",
        dogbooks: [
          { subId: "#PAM-010-1", theme: "Natal", petName: "Max", stage: "Entregue", photosUploaded: 30, photosRequired: 30 },
        ],
        sessions: [],
        total: "R$ 490,00",
        payment: "Pago",
        paymentMethod: "PIX",
        coupon: "",
      },
    ],
    createdAt: "2025-06-20",
    lastActivity: "2026-03-18",
    status: "ativo",
    source: "Indicacao",
    interactions: [
      { date: "2026-03-18", type: "sessao", description: "Sessao Completa realizada" },
      { date: "2026-03-08", type: "compra", description: "Comprou Dogbook Inverno + Sessao Completa" },
      { date: "2025-10-05", type: "compra", description: "Comprou Dogbook Natal" },
      { date: "2025-10-20", type: "aprovacao", description: "Aprovou layout Dogbook Natal" },
      { date: "2025-11-02", type: "mensagem", description: "Recebeu Dogbook, elogiou qualidade" },
    ],
    tags: ["VIP", "Recorrente", "3+ compras"],
  },
  {
    id: 4,
    name: "Mariana Costa",
    email: "mariana@email.com",
    phone: "(11) 96543-2109",
    city: "Sao Paulo",
    state: "SP",
    clientType: "pj",
    cpfCnpj: "12.345.678/0001-99",
    photoUrl: "",
    pets: [
      { name: "Mel", breed: "Dachshund", birthDate: "2022-02-14", photoUrl: "", size: "Pequeno", gender: "Femea" },
      { name: "Bob", breed: "Lhasa Apso", birthDate: "2021-07-01", photoUrl: "", size: "Pequeno", gender: "Macho" },
    ],
    address: { cep: "04543-011", street: "R. Funchal", number: "263", complement: "Sala 12", neighborhood: "Vila Olimpia", city: "Sao Paulo", state: "SP" },
    fullAddress: "R. Funchal, 263, Sala 12 - Vila Olimpia, Sao Paulo - SP",
    notes: "Empresa de pet care, compra corporativa",
    razaoSocial: "Pet Care LTDA",
    nomeFantasia: "Mariana Pet Care",
    purchases: [
      {
        id: "#PAM-004",
        date: "2026-03-05",
        type: "misto",
        dogbooks: [
          { subId: "#PAM-004-1", theme: "Caoniversario", petName: "Mel", stage: "Enviado", photosUploaded: 30, photosRequired: 30 },
          { subId: "#PAM-004-2", theme: "Verao", petName: "Bob", stage: "Em Producao", photosUploaded: 30, photosRequired: 30 },
          { subId: "#PAM-004-3", theme: "Natal", petName: "Mel", stage: "Aguardando Fotos", photosUploaded: 8, photosRequired: 30 },
        ],
        sessions: [
          { subId: "#SES-004-1", type: "Pocket", petName: "Mel", date: "2026-03-20", stage: "Entregue", photosDelivered: 20 },
          { subId: "#SES-004-2", type: "Estudio", petName: "Bob", date: "2026-03-21", stage: "Em Edicao", photosDelivered: 0 },
          { subId: "#SES-004-3", type: "Completa", petName: "Mel", date: "2026-03-22", stage: "Confirmada", photosDelivered: 0 },
        ],
        total: "R$ 10.823,00",
        payment: "Pago",
        paymentMethod: "Cartao 10x",
        coupon: "PETCARE20",
      },
    ],
    createdAt: "2025-09-10",
    lastActivity: "2026-03-22",
    status: "ativo",
    source: "Influenciador",
    interactions: [
      { date: "2026-03-22", type: "sessao", description: "Sessao Completa confirmada" },
      { date: "2026-03-05", type: "compra", description: "Compra corporativa: 3 Dogbooks + 3 Sessoes" },
    ],
    tags: ["Corporativo", "Alto Valor"],
  },
  {
    id: 5,
    name: "Pedro Santos",
    email: "pedro@email.com",
    phone: "(11) 95432-1098",
    city: "Santo Andre",
    state: "SP",
    clientType: "pf",
    cpfCnpj: "321.654.987-00",
    photoUrl: "",
    pets: [
      { name: "Pipoca", breed: "Pug", birthDate: "2023-06-12", photoUrl: "", size: "Pequeno", gender: "Femea" },
    ],
    address: { cep: "09020-010", street: "R. das Figueiras", number: "78", complement: "", neighborhood: "Centro", city: "Santo Andre", state: "SP" },
    fullAddress: "R. das Figueiras, 78 - Centro, Santo Andre - SP",
    notes: "",
    razaoSocial: "",
    nomeFantasia: "",
    purchases: [
      {
        id: "#PAM-005",
        date: "2026-02-28",
        type: "dogbook",
        dogbooks: [
          { subId: "#PAM-005-1", theme: "Ano Novo", petName: "Pipoca", stage: "Entregue", photosUploaded: 30, photosRequired: 30 },
        ],
        sessions: [],
        total: "R$ 490,00",
        payment: "Pago",
        paymentMethod: "PIX",
        coupon: "",
      },
    ],
    createdAt: "2026-02-01",
    lastActivity: "2026-02-28",
    status: "ativo",
    source: "Google",
    interactions: [
      { date: "2026-02-28", type: "compra", description: "Comprou Dogbook Ano Novo" },
      { date: "2026-03-10", type: "mensagem", description: "Elogiou o Dogbook recebido" },
    ],
    tags: [],
  },
  {
    id: 6,
    name: "Rodrigo Alves",
    email: "rodrigo@email.com",
    phone: "(21) 99876-5432",
    city: "Rio de Janeiro",
    state: "RJ",
    clientType: "pf",
    cpfCnpj: "654.321.987-00",
    photoUrl: "",
    pets: [
      { name: "Simba", breed: "Shiba Inu", birthDate: "2024-01-05", photoUrl: "", size: "Medio", gender: "Macho" },
      { name: "Nala", breed: "Shiba Inu", birthDate: "2024-01-05", photoUrl: "", size: "Medio", gender: "Femea" },
    ],
    address: { cep: "22041-080", street: "R. Barata Ribeiro", number: "450", complement: "Cobertura", neighborhood: "Copacabana", city: "Rio de Janeiro", state: "RJ" },
    fullAddress: "R. Barata Ribeiro, 450, Cobertura - Copacabana, Rio de Janeiro - RJ",
    notes: "",
    razaoSocial: "",
    nomeFantasia: "",
    purchases: [
      {
        id: "#PAM-006",
        date: "2026-03-12",
        type: "dogbook",
        dogbooks: [
          { subId: "#PAM-006-1", theme: "Verao", petName: "Simba", stage: "Aguardando Pagamento", photosUploaded: 0, photosRequired: 30 },
          { subId: "#PAM-006-2", theme: "Inverno", petName: "Simba", stage: "Aguardando Pagamento", photosUploaded: 0, photosRequired: 30 },
        ],
        sessions: [],
        total: "R$ 931,00",
        payment: "Pendente",
        paymentMethod: "",
        coupon: "",
      },
      {
        id: "#SES-006",
        date: "2026-03-12",
        type: "sessao",
        dogbooks: [],
        sessions: [
          { subId: "#SES-006-1", type: "Completa", petName: "Simba", date: "2026-03-25", stage: "Agendada", photosDelivered: 0 },
          { subId: "#SES-006-2", type: "Pocket", petName: "Nala", date: "2026-03-26", stage: "Aguardando Pagamento", photosDelivered: 0 },
        ],
        total: "R$ 5.800,00",
        payment: "Parcial",
        paymentMethod: "Cartao 10x",
        coupon: "",
      },
    ],
    createdAt: "2026-03-01",
    lastActivity: "2026-03-12",
    status: "novo",
    source: "Instagram",
    interactions: [
      { date: "2026-03-12", type: "compra", description: "Primeira compra: 2 Dogbooks + 2 Sessoes" },
    ],
    tags: ["Novo"],
  },
  {
    id: 7,
    name: "Julia Ferreira",
    email: "julia@email.com",
    phone: "(11) 94321-8765",
    city: "Sao Paulo",
    state: "SP",
    clientType: "pf",
    cpfCnpj: "111.222.333-44",
    photoUrl: "",
    pets: [
      { name: "Biscuit", breed: "Bulldog Frances", birthDate: "2023-09-01", photoUrl: "", size: "Pequeno", gender: "Macho" },
    ],
    address: { cep: "01414-001", street: "R. Augusta", number: "1200", complement: "Apto 5B", neighborhood: "Consolacao", city: "Sao Paulo", state: "SP" },
    fullAddress: "R. Augusta, 1200, Apto 5B - Consolacao, Sao Paulo - SP",
    notes: "Nao comprou nos ultimos 6 meses",
    razaoSocial: "",
    nomeFantasia: "",
    purchases: [
      {
        id: "#PAM-007",
        date: "2025-08-15",
        type: "dogbook",
        dogbooks: [
          { subId: "#PAM-007-1", theme: "Inverno", petName: "Biscuit", stage: "Entregue", photosUploaded: 30, photosRequired: 30 },
        ],
        sessions: [],
        total: "R$ 490,00",
        payment: "Pago",
        paymentMethod: "PIX",
        coupon: "",
      },
    ],
    createdAt: "2025-08-01",
    lastActivity: "2025-09-20",
    status: "inativo",
    source: "Google",
    interactions: [
      { date: "2025-08-15", type: "compra", description: "Comprou Dogbook Inverno" },
      { date: "2025-09-20", type: "mensagem", description: "Elogiou produto recebido" },
    ],
    tags: ["Inativo"],
  },
];

/* ────────────────────── Helpers ────────────────────── */

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseCurrency(str: string): number {
  const val = parseFloat(str.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
  return isNaN(val) ? 0 : val;
}

function stageColor(stage: string) {
  switch (stage) {
    case "Entregue":
      return "text-green-700 bg-green-50 border-green-200";
    case "Enviado":
      return "text-purple-700 bg-purple-50 border-purple-200";
    case "Em Producao":
    case "Em Edicao":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "Aprovacao Layout":
    case "Realizada":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "Aguardando Fotos":
    case "Agendada":
    case "Confirmada":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "Aguardando Pagamento":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

function sessionTypeBadge(type: string) {
  switch (type) {
    case "Pocket":
      return "bg-emerald-100 text-emerald-700";
    case "Estudio":
      return "bg-blue-100 text-blue-700";
    case "Completa":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statusColor(status: ClientStatus) {
  switch (status) {
    case "ativo":
      return "bg-green-100 text-green-700 border-green-200";
    case "inativo":
      return "bg-gray-100 text-gray-500 border-gray-200";
    case "novo":
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
}

function statusLabel(status: ClientStatus) {
  switch (status) {
    case "ativo": return "Ativo";
    case "inativo": return "Inativo";
    case "novo": return "Novo";
  }
}

function interactionIcon(type: Interaction["type"]) {
  switch (type) {
    case "compra": return <ShoppingBag className="size-3 text-green-600" />;
    case "mensagem": return <MessageSquare className="size-3 text-blue-600" />;
    case "sessao": return <Camera className="size-3 text-purple-600" />;
    case "aprovacao": return <CheckCircle className="size-3 text-emerald-600" />;
    case "upload": return <ImageIcon className="size-3 text-amber-600" />;
    case "visita": return <Eye className="size-3 text-gray-500" />;
  }
}

function getClientStats(client: Client) {
  let totalDogbooks = 0;
  let totalSessions = 0;
  let totalSpent = 0;
  let delivered = 0;
  let pending = 0;

  client.purchases.forEach((p) => {
    totalDogbooks += p.dogbooks.length;
    totalSessions += p.sessions.length;
    totalSpent += parseCurrency(p.total);
    p.dogbooks.forEach((d) => {
      if (d.stage === "Entregue") delivered++;
      else pending++;
    });
    p.sessions.forEach((s) => {
      if (s.stage === "Entregue") delivered++;
      else pending++;
    });
  });

  return {
    totalPurchases: client.purchases.length,
    totalDogbooks,
    totalSessions,
    totalSpentNum: totalSpent,
    totalSpent: formatCurrency(totalSpent),
    delivered,
    pending,
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 12) return `${totalMonths} mes${totalMonths !== 1 ? "es" : ""}`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (m === 0) return `${y} ano${y > 1 ? "s" : ""}`;
  return `${y}a ${m}m`;
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

/* ────────────────────── New Client Form State ────────────────────── */

interface NewPetField {
  name: string;
  breed: string;
  birthDate: string;
  size: string;
  gender: string;
}

const emptyPet: NewPetField = { name: "", breed: "", birthDate: "", size: "", gender: "" };

/* ────────────────────── Client History Panel ────────────────────── */

function ClientHistoryPanel({ client }: { client: Client }) {
  const stats = getClientStats(client);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resumo" | "compras" | "timeline">("resumo");

  return (
    <div className="space-y-6">
      {/* ── Client Header ── */}
      <div className="flex items-start gap-5 rounded-xl border bg-muted/20 p-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-lg font-bold text-[#8b5e5e]">
          {getInitials(client.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">{client.name}</h3>
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusColor(client.status)}`}>
              {statusLabel(client.status)}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" /> <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" /> {client.phone}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="size-3.5 shrink-0" /> {client.fullAddress}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              {client.clientType === "pf" ? "Pessoa Fisica" : "Pessoa Juridica"}
            </Badge>
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              {client.clientType === "pf" ? `CPF: ${client.cpfCnpj}` : `CNPJ: ${client.cpfCnpj}`}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Cliente desde {formatDate(client.createdAt)} · Origem: {client.source}
            </span>
          </div>
          {client.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {client.tags.map((tag) => (
                <span key={tag} className="inline-flex rounded-full bg-[#8b5e5e]/10 px-2.5 py-1 text-[10px] font-medium text-[#8b5e5e]">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {client.clientType === "pj" && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              {client.razaoSocial} · {client.nomeFantasia}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1.5">
        {(["resumo", "compras", "timeline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "resumo" ? "Resumo" : tab === "compras" ? "Compras" : "Timeline"}
          </button>
        ))}
      </div>

      {/* ── Tab: Resumo ── */}
      {activeTab === "resumo" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <div className="rounded-xl border bg-background p-4 text-center">
              <ShoppingBag className="mx-auto size-5 text-primary/60" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalPurchases}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Compras</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <BookOpen className="mx-auto size-5 text-primary/60" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalDogbooks}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Dogbooks</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <Camera className="mx-auto size-5 text-primary/60" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Sessoes</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <DollarSign className="mx-auto size-5 text-green-600" />
              <p className="mt-2 text-lg font-bold text-green-600">{stats.totalSpent}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Total Gasto</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <CheckCircle className="mx-auto size-5 text-green-600" />
              <p className="mt-2 text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Entregues</p>
            </div>
            <div className="rounded-xl border bg-background p-4 text-center">
              <Clock className="mx-auto size-5 text-amber-600" />
              <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Pendentes</p>
            </div>
          </div>

          {/* Engagement */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ultima Atividade</p>
              <p className="mt-1.5 text-base font-semibold">{formatDate(client.lastActivity)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">ha {daysSince(client.lastActivity)} dias</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket Medio</p>
              <p className="mt-1.5 text-base font-semibold">
                {stats.totalPurchases > 0
                  ? formatCurrency(stats.totalSpentNum / stats.totalPurchases)
                  : "R$ 0,00"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Origem</p>
              <p className="mt-1.5 text-base font-semibold">{client.source}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</p>
              <p className="mt-1.5 text-base font-semibold">{client.clientType === "pf" ? "Pessoa Fisica" : "Pessoa Juridica"}</p>
            </div>
          </div>

          {/* Pets */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Dog className="size-3.5" /> Pets ({client.pets.length})
            </h4>
            <div className="space-y-1.5">
              {client.pets.map((pet, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-sm">
                    🐾
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{pet.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {pet.breed} · {pet.gender} · {pet.size} · {calculateAge(pet.birthDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Observacoes
              </h4>
              <p className="rounded-lg border bg-muted/20 p-2.5 text-xs text-foreground">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Compras ── */}
      {activeTab === "compras" && (
        <div className="space-y-2">
          {client.purchases.map((purchase) => {
            const isExpanded = expandedPurchase === purchase.id;
            const totalItems = purchase.dogbooks.length + purchase.sessions.length;

            return (
              <div key={purchase.id} className="rounded-lg border">
                <button
                  onClick={() => setExpandedPurchase(isExpanded ? null : purchase.id)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {purchase.id}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {purchase.type === "dogbook" ? "Dogbook" : purchase.type === "sessao" ? "Sessao" : "Misto"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(purchase.date)} · {totalItems} item{totalItems > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={purchase.payment === "Pago" ? "default" : purchase.payment === "Parcial" ? "outline" : "destructive"}
                      className="text-[9px]"
                    >
                      {purchase.payment}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">{purchase.total}</span>
                    {isExpanded ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-3 pb-3 pt-2">
                    <div className="mb-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span>Data: {formatDate(purchase.date)}</span>
                      {purchase.paymentMethod && <span>· Pagamento: {purchase.paymentMethod}</span>}
                      {purchase.coupon && <span>· Cupom: <span className="font-mono text-primary">{purchase.coupon}</span></span>}
                    </div>

                    {purchase.dogbooks.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">Dogbooks</p>
                        {purchase.dogbooks.map((d) => (
                          <div key={d.subId} className="mb-1 flex items-center justify-between rounded border-l-2 border-l-primary/30 bg-muted/10 px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <BookOpen className="size-3 text-primary/50" />
                              <div>
                                <span className="font-mono text-[10px] text-primary/70">{d.subId}</span>
                                <span className="ml-1.5 text-xs text-foreground">{d.theme} ({d.petName})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <ImageIcon className="size-2.5" />
                                {d.photosUploaded}/{d.photosRequired}
                              </div>
                              <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${stageColor(d.stage)}`}>
                                {d.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {purchase.sessions.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">Sessoes Fotograficas</p>
                        {purchase.sessions.map((s) => (
                          <div key={s.subId} className="mb-1 flex items-center justify-between rounded border-l-2 border-l-purple-300 bg-muted/10 px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <Camera className="size-3 text-purple-400" />
                              <div>
                                <span className="font-mono text-[10px] text-primary/70">{s.subId}</span>
                                <span className={`ml-1 inline-flex rounded-full px-1 py-0.5 text-[8px] font-medium ${sessionTypeBadge(s.type)}`}>{s.type}</span>
                                <span className="ml-1 text-xs text-foreground">{s.petName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {s.date && (
                                <span className="text-[9px] text-muted-foreground">{formatDate(s.date)}</span>
                              )}
                              {s.photosDelivered > 0 && (
                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                  <ImageIcon className="size-2.5" />
                                  {s.photosDelivered}
                                </div>
                              )}
                              <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${stageColor(s.stage)}`}>
                                {s.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {client.purchases.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhuma compra realizada
            </p>
          )}
        </div>
      )}

      {/* ── Tab: Timeline ── */}
      {activeTab === "timeline" && (
        <div className="space-y-0">
          {client.interactions.length > 0 ? (
            <div className="relative ml-3 border-l border-muted-foreground/20 pl-5">
              {client.interactions.map((interaction, idx) => (
                <div key={idx} className="relative mb-4 last:mb-0">
                  <div className="absolute -left-[23px] top-0.5 flex size-4 items-center justify-center rounded-full border bg-background">
                    {interactionIcon(interaction.type)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{interaction.description}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(interaction.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhuma interacao registrada
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────── Page ────────────────────── */

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "todos">("todos");
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // New client form state
  const [clientType, setClientType] = useState<ClientType>("pf");
  const [newPets, setNewPets] = useState<NewPetField[]>([{ ...emptyPet }]);

  // Address form state
  const [newCep, setNewCep] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newComplement, setNewComplement] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  const cepLookup = useCepLookup(
    useMemo(() => ({
      onSuccess: (data) => {
        setNewStreet(data.logradouro || "");
        setNewNeighborhood(data.bairro || "");
        setNewCity(data.localidade || "");
        setNewState(data.uf || "");
        if (data.complemento) setNewComplement(data.complemento);
      },
    }), [])
  );

  const addPet = () => {
    if (newPets.length < 10) {
      setNewPets([...newPets, { ...emptyPet }]);
    }
  };

  const removePet = (idx: number) => {
    setNewPets(newPets.filter((_, i) => i !== idx));
  };

  const updatePet = (idx: number, field: keyof NewPetField, value: string) => {
    setNewPets(
      newPets.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const [resettingEmail, setResettingEmail] = useState<string | null>(null);

  const handleResetPassword = async (email: string, name: string) => {
    setResettingEmail(email);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar email");
      }
      toast.success(`Email de redefinição de senha enviado para ${name}!`, {
        description: `Um link foi enviado para ${email}.`,
      });
    } catch (err: any) {
      toast.error("Erro ao enviar email de redefinição.", {
        description: err.message,
      });
    } finally {
      setResettingEmail(null);
    }
  };

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.pets.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "todos" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* KPIs - filtered by date range */
  const clientsInRange = mockClients.filter((c) => isInRange(c.createdAt, dateRange));
  const totalClients = clientsInRange.length;
  const totalPets = clientsInRange.reduce((sum, c) => sum + c.pets.length, 0);
  const allPurchasesInRange = mockClients.flatMap((c) =>
    c.purchases.filter((p) => isInRange(p.date, dateRange))
  );
  const totalPurchases = allPurchasesInRange.length;
  const totalRevenue = allPurchasesInRange.reduce((sum, p) => sum + parseCurrency(p.total), 0);
  const activeClients = mockClients.filter((c) =>
    c.purchases.some((p) => isInRange(p.date, dateRange))
  ).length;
  const newClients = mockClients.filter(
    (c) => c.status === "novo" && isInRange(c.createdAt, dateRange)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus clientes, pets e historico de compras
          </p>
        </div>

        {/* ── New Client Button ── */}
        <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
          <DialogTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#8b5e5e] px-4 text-sm font-medium text-white hover:bg-[#7a4f4f]">
            <UserPlus className="size-4" />
            Novo Cliente
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-[#8b5e5e]" />
                Novo Cliente
              </DialogTitle>
              <DialogDescription>
                Cadastre um novo cliente preenchendo os dados abaixo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Photo */}
              <div className="rounded-lg border bg-muted/20 p-4 text-center">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Foto do Cliente
                </p>
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                  <Users className="size-6 text-muted-foreground" />
                </div>
                <button className="mt-2 text-[10px] font-medium text-[#8b5e5e] hover:underline">
                  Escolher foto
                </button>
              </div>

              {/* Client Type */}
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Tipo de Cliente
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setClientType("pf")}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      clientType === "pf"
                        ? "bg-[#8b5e5e] text-white"
                        : "border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    Pessoa Fisica
                  </button>
                  <button
                    onClick={() => setClientType("pj")}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      clientType === "pj"
                        ? "bg-[#8b5e5e] text-white"
                        : "border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    Pessoa Juridica
                  </button>
                </div>
              </div>

              {/* PF-specific: CPF */}
              {clientType === "pf" && (
                <div className="grid gap-1">
                  <Label className="text-xs">CPF</Label>
                  <Input placeholder="000.000.000-00" />
                </div>
              )}

              {/* PJ-specific fields */}
              {clientType === "pj" && (
                <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <Label className="text-xs">Razao Social</Label>
                    <Input placeholder="Razao Social" />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Nome Fantasia</Label>
                    <Input placeholder="Nome Fantasia" />
                  </div>
                  <div className="grid gap-1 sm:col-span-2">
                    <Label className="text-xs">CNPJ</Label>
                    <Input placeholder="00.000.000/0000-00" />
                  </div>
                </div>
              )}

              {/* Basic info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label className="text-xs">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="Nome do cliente" />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" placeholder="email@exemplo.com" />
                </div>
              </div>

              <div className="grid gap-1">
                <Label className="text-xs">
                  Telefone/WhatsApp <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="(11) 99999-9999" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Endereco
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">CEP</Label>
                    <div className="relative">
                      <Input
                        placeholder="00000-000"
                        value={newCep}
                        onChange={(e) => setNewCep(e.target.value)}
                        onBlur={() => cepLookup.fetchCep(newCep)}
                      />
                      {cepLookup.loading && (
                        <Loader2 className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-1 sm:col-span-1">
                    <Label className="text-xs">Rua</Label>
                    <Input
                      placeholder="Rua"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Numero</Label>
                    <Input
                      placeholder="N°"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Complemento</Label>
                    <Input
                      placeholder="Apto, Sala..."
                      value={newComplement}
                      onChange={(e) => setNewComplement(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Bairro</Label>
                    <Input
                      placeholder="Bairro"
                      value={newNeighborhood}
                      onChange={(e) => setNewNeighborhood(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Cidade</Label>
                    <Input
                      placeholder="Cidade"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Estado</Label>
                    <Input
                      placeholder="UF"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Endereco Completo</Label>
                  <div className="relative">
                    <Input
                      readOnly
                      value={
                        [newStreet, newNumber, newComplement, newNeighborhood, newCity, newState, newCep]
                          .filter(Boolean)
                          .join(", ") || ""
                      }
                      placeholder="Preenchido automaticamente"
                      className="bg-muted/30 pr-9"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pets */}
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    🐾 Pets ({newPets.length}/10)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPet}
                    disabled={newPets.length >= 10}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1 size-3" />
                    Adicionar Pet
                  </Button>
                </div>

                {newPets.map((pet, idx) => (
                  <div key={idx} className="relative rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">
                        Pet {idx + 1}
                      </p>
                      {newPets.length > 1 && (
                        <button
                          onClick={() => removePet(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-amber-50">
                        🐾
                      </div>
                      <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div className="grid gap-1">
                          <Label className="text-xs">
                            Nome <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Nome do pet"
                            value={pet.name}
                            onChange={(e) => updatePet(idx, "name", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Raca</Label>
                          <Input
                            placeholder="Raca"
                            value={pet.breed}
                            onChange={(e) => updatePet(idx, "breed", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Data de Nascimento</Label>
                          <Input
                            type="date"
                            value={pet.birthDate}
                            onChange={(e) => updatePet(idx, "birthDate", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Porte</Label>
                          <select
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                            value={pet.size}
                            onChange={(e) => updatePet(idx, "size", e.target.value)}
                          >
                            <option value="">Selecione</option>
                            <option value="Mini">Mini</option>
                            <option value="Pequeno">Pequeno</option>
                            <option value="Medio">Medio</option>
                            <option value="Grande">Grande</option>
                            <option value="Gigante">Gigante</option>
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Sexo</Label>
                          <select
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                            value={pet.gender}
                            onChange={(e) => updatePet(idx, "gender", e.target.value)}
                          >
                            <option value="">Selecione</option>
                            <option value="Macho">Macho</option>
                            <option value="Femea">Femea</option>
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Idade</Label>
                          <Input
                            readOnly
                            value={pet.birthDate ? calculateAge(pet.birthDate) : ""}
                            placeholder="Calculada automaticamente"
                            className="bg-muted/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Source */}
              <div className="grid gap-1">
                <Label className="text-xs">Como conheceu a PAM?</Label>
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Selecione</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Google">Google</option>
                  <option value="Indicacao">Indicacao</option>
                  <option value="Influenciador">Influenciador</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Notes */}
              <div className="grid gap-1">
                <Label className="text-xs">Observacoes</Label>
                <textarea
                  placeholder="Observacoes sobre o cliente..."
                  className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewClientModal(false)}
              >
                Cancelar
              </Button>
              <Button className="bg-[#8b5e5e] hover:bg-[#7a4f4f]">
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Date Filter ── */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Novos Clientes
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dog className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Pets Cadastrados
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalPets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-primary/60" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Compras
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalPurchases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-green-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Receita
              </p>
            </div>
            <p className="mt-2 text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Clientes Ativos
              </p>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{activeClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-600" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Ticket Medio
              </p>
            </div>
            <p className="mt-2 text-lg font-bold text-blue-600">
              {totalPurchases > 0 ? formatCurrency(totalRevenue / totalPurchases) : "R$ 0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Client Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Lista de Clientes</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou pet..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(["todos", "ativo", "novo", "inativo"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-[#8b5e5e] text-white"
                      : "border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s === "todos" ? "Todos" : s === "ativo" ? "Ativos" : s === "novo" ? "Novos" : "Inativos"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="hidden md:table-cell">Pets</TableHead>
                  <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                  <TableHead className="text-center">Pedidos</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Total Gasto</TableHead>
                  <TableHead className="hidden xl:table-cell">Ultimo Pedido</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const stats = getClientStats(client);
                  const lastPurchase = client.purchases.length > 0
                    ? client.purchases.reduce((latest, p) =>
                        new Date(p.date) > new Date(latest.date) ? p : latest
                      )
                    : null;

                  return (
                    <TableRow key={client.id}>
                      {/* Client avatar + name + status */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-[#8b5e5e]/10 text-xs font-bold text-[#8b5e5e]">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {client.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1">
                              <Badge variant="outline" className="text-[9px]">
                                {client.clientType === "pf" ? "PF" : "PJ"}
                              </Badge>
                              <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${statusColor(client.status)}`}>
                                {statusLabel(client.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-xs text-foreground">
                            <Phone className="size-3 text-muted-foreground" />
                            {client.phone}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="size-3" />
                            {client.email}
                          </span>
                        </div>
                      </TableCell>

                      {/* Pets */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {client.pets.map((pet, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800"
                            >
                              🐾 {pet.name}
                              <span className="text-amber-600/60">
                                ({pet.breed})
                              </span>
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* City */}
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {client.city}, {client.state}
                      </TableCell>

                      {/* Orders */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            {stats.totalPurchases}
                          </span>
                          <div className="flex gap-1">
                            {stats.totalDogbooks > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                                <BookOpen className="size-2.5" />
                                {stats.totalDogbooks}
                              </span>
                            )}
                            {stats.totalSessions > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-1 py-0.5 text-[9px] font-medium text-purple-700">
                                <Camera className="size-2.5" />
                                {stats.totalSessions}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Total Spent */}
                      <TableCell className="text-right hidden sm:table-cell">
                        <span className="text-sm font-semibold text-foreground">
                          {stats.totalSpent}
                        </span>
                      </TableCell>

                      {/* Last Order */}
                      <TableCell className="hidden xl:table-cell">
                        {lastPurchase ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] text-primary/70">{lastPurchase.id}</span>
                            <span className="text-[10px] text-muted-foreground">{formatDate(lastPurchase.date)}</span>
                            <Badge
                              variant={lastPurchase.payment === "Pago" ? "default" : lastPurchase.payment === "Parcial" ? "outline" : "destructive"}
                              className="w-fit text-[8px]"
                            >
                              {lastPurchase.payment}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* History Sheet */}
                          <Sheet>
                            <SheetTrigger className="inline-flex size-7 items-center justify-center rounded-md text-[#8b5e5e] hover:bg-muted" title="Investigar cliente">
                              <FileSearch className="size-3.5" />
                            </SheetTrigger>
                            <SheetContent className="w-full overflow-y-auto sm:max-w-[112rem]">
                              <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-[#8b5e5e]">
                                  <FileSearch className="size-4" />
                                  Historico do Cliente
                                </SheetTitle>
                              </SheetHeader>
                              <div className="mt-4">
                                <ClientHistoryPanel client={client} />
                              </div>
                            </SheetContent>
                          </Sheet>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-[#8b5e5e]"
                            title="Editar cliente"
                            onClick={() => setEditClient(client)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          {/* WhatsApp */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-green-600"
                            title="Enviar mensagem via WhatsApp"
                            onClick={() => {
                              const phone = client.phone.replace(/\D/g, "");
                              const fullPhone = phone.startsWith("55") ? phone : `55${phone}`;
                              const message = encodeURIComponent(
                                `Ola ${client.name.split(" ")[0]}, tudo bem? Aqui e a equipe Patas, Amor e Memorias! 🐾`
                              );
                              window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
                            }}
                          >
                            <MessageSquare className="size-3.5" />
                          </Button>

                          {/* Reset Password */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-amber-600"
                            title="Resetar senha do cliente"
                            disabled={resettingEmail === client.email}
                            onClick={() => handleResetPassword(client.email, client.name)}
                          >
                            {resettingEmail === client.email ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <KeyRound className="size-3.5" />
                            )}
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-red-500"
                            title="Excluir cliente"
                            onClick={() => setDeleteClient(client)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum cliente encontrado
              </p>
            </div>
          )}

          {/* Results count */}
          <div className="border-t px-4 py-2">
            <p className="text-[11px] text-muted-foreground">
              {filteredClients.length} de {mockClients.length} clientes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ════════════════════ Delete Confirmation Modal ════════════════════ */}
      <Dialog open={!!deleteClient} onOpenChange={(open) => !open && setDeleteClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Confirmar Exclusao
            </DialogTitle>
            <DialogDescription className="pt-2">
              Tem certeza que deseja excluir o cliente{" "}
              <span className="font-semibold text-foreground">{deleteClient?.name}</span>?
              Esta acao nao podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteClient && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">
                Ao excluir este cliente, todos os dados associados serao removidos permanentemente,
                incluindo historico de compras, pets cadastrados e interacoes.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteClient(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // TODO: API call to delete client
                setDeleteClient(null);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Excluir Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Edit Client Modal ════════════════════ */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#8b5e5e]">
              <Pencil className="size-4" />
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Edite as informacoes de {editClient?.name}
            </DialogDescription>
          </DialogHeader>
          {editClient && (
            <div className="space-y-5">
              {/* Personal Info */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dados Pessoais
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input defaultValue={editClient.name} className="mt-1" />
                  </div>
                  <div>
                    <Label>E-mail *</Label>
                    <Input defaultValue={editClient.email} type="email" className="mt-1" />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input defaultValue={editClient.phone} className="mt-1" />
                  </div>
                  <div>
                    <Label>{editClient.clientType === "pf" ? "CPF" : "CNPJ"}</Label>
                    <Input defaultValue={editClient.cpfCnpj} className="mt-1" disabled />
                  </div>
                  {editClient.clientType === "pj" && (
                    <>
                      <div>
                        <Label>Razao Social</Label>
                        <Input defaultValue={editClient.razaoSocial || ""} className="mt-1" />
                      </div>
                      <div>
                        <Label>Nome Fantasia</Label>
                        <Input defaultValue={editClient.nomeFantasia || ""} className="mt-1" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Endereco
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Endereco Completo</Label>
                    <Input defaultValue={editClient.fullAddress} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["ativo", "novo", "inativo"] as const).map((s) => (
                    <button
                      key={s}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        editClient.status === s
                          ? "border-[#8b5e5e] bg-[#8b5e5e] text-white"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {s === "ativo" ? "Ativo" : s === "novo" ? "Novo" : "Inativo"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Observacoes
                </p>
                <textarea
                  defaultValue={editClient.notes || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Observacoes sobre o cliente..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditClient(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#8b5e5e] text-white hover:bg-[#7a5050]"
              onClick={() => {
                // TODO: API call to save client
                setEditClient(null);
              }}
            >
              Salvar Alteracoes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
