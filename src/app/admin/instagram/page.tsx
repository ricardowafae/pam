"use client";

import React, { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DateRangeFilter,
  type DateRange,
  getDefault30DayRange,
} from "@/components/admin/DateRangeFilter";
import {
  Instagram,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Rss,
  Globe,
  Star,
  AlertTriangle,
  Link2,
  Newspaper,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";

/* ────────────────────── Types ────────────────────── */

interface IGPost {
  id: string;
  caption: string | null;
  post_type: "reels" | "carousel" | "story" | "single_image";
  status: "idea" | "draft" | "scheduled" | "published" | "archived";
  platform: string;
  scheduled_at: string | null;
  published_at: string | null;
  ig_media_id: string | null;
  ig_permalink: string | null;
  ig_thumbnail_url: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagement_rate: number;
  tags: string[];
  notes: string | null;
  media_urls: string[];
  created_at: string;
  updated_at: string;
}

interface DailyInsight {
  date: string;
  impressions: number;
  reach: number;
  profile_views: number;
  follower_count: number;
  followers_gained: number;
  website_clicks: number;
}

interface Competitor {
  id: string;
  handle: string;
  display_name: string | null;
  profile_pic_url: string | null;
  follower_count: number;
  following_count: number;
  media_count: number;
  avg_likes: number;
  avg_comments: number;
  engagement_rate: number;
  posting_frequency: number;
  notes: string | null;
  last_synced_at: string | null;
  competitor_posts?: CompetitorPost[];
}

interface CompetitorPost {
  id: string;
  post_type: string;
  caption_preview: string;
  permalink: string | null;
  likes: number;
  comments: number;
  posted_at: string;
}

interface NewsFeed {
  id: string;
  name: string;
  url: string;
  topic: string;
  is_active: boolean;
  last_fetched_at: string | null;
}

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source_name: string;
  summary: string | null;
  published_at: string;
  topic: string;
  is_read: boolean;
  is_bookmarked: boolean;
}

interface TokenStatus {
  connected: boolean;
  username?: string;
  userId?: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  lastRefreshed?: string;
}

/* ────────────────────── Helpers ────────────────────── */

const postTypeLabels: Record<string, string> = {
  reels: "Reels",
  carousel: "Carrossel",
  story: "Story",
  single_image: "Imagem",
};

const postStatusLabels: Record<string, string> = {
  idea: "Ideia",
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
};

function postStatusColor(status: string) {
  switch (status) {
    case "published": return "bg-green-100 text-green-700 border-green-200";
    case "scheduled": return "bg-blue-100 text-blue-700 border-blue-200";
    case "draft": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "idea": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function postTypeColor(type: string) {
  switch (type) {
    case "reels": return "bg-purple-100 text-purple-700 border-purple-200";
    case "carousel": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "story": return "bg-pink-100 text-pink-700 border-pink-200";
    case "single_image": return "bg-teal-100 text-teal-700 border-teal-200";
    default: return "bg-gray-100 text-gray-600";
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function truncate(s: string | null, max: number) {
  if (!s) return "-";
  return s.length > max ? s.slice(0, max) + "..." : s;
}

const topicLabels: Record<string, string> = {
  all: "Todos",
  tools: "Ferramentas",
  research: "Pesquisa",
  business: "Negocios",
  general: "Geral",
};

/* ────────────────────── Page ────────────────────── */

export default function InstagramPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-[#8b5e5e]" /></div>}>
      <InstagramPage />
    </Suspense>
  );
}

function InstagramPage() {
  const searchParams = useSearchParams();

  // Token / connection state
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({ connected: false });
  const [checkingToken, setCheckingToken] = useState(true);

  // Posts state
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState("all");
  const [postTypeFilter, setPostTypeFilter] = useState("all");
  const [editPost, setEditPost] = useState<Partial<IGPost> | null>(null);
  const [savingPost, setSavingPost] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Insights state
  const [insights, setInsights] = useState<DailyInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [syncingInsights, setSyncingInsights] = useState(false);
  const [insightDays, setInsightDays] = useState(30);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Competitors state
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [editCompetitor, setEditCompetitor] = useState<Partial<Competitor> | null>(null);
  const [savingCompetitor, setSavingCompetitor] = useState(false);

  // News state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [feeds, setFeeds] = useState<NewsFeed[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsTopic, setNewsTopic] = useState("all");
  const [fetchingNews, setFetchingNews] = useState(false);
  const [editFeed, setEditFeed] = useState<Partial<NewsFeed> | null>(null);
  const [savingFeed, setSavingFeed] = useState(false);
  const [showFeedManager, setShowFeedManager] = useState(false);

  /* ─── Token check ─── */
  const checkToken = useCallback(async () => {
    setCheckingToken(true);
    try {
      const res = await adminFetch("/api/admin/instagram/token");
      if (res.ok) {
        const data = await res.json();
        setTokenStatus(data);
      }
    } catch { /* ignore */ }
    setCheckingToken(false);
  }, []);

  /* ─── Handle OAuth code ─── */
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      (async () => {
        try {
          const res = await adminFetch("/api/admin/instagram/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "exchange", code }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(`Instagram conectado: @${data.username}`);
            setTokenStatus({ connected: true, username: data.username, expiresAt: data.expiresAt, daysUntilExpiry: 60 });
            // Clean URL
            window.history.replaceState({}, "", "/admin/instagram");
          } else {
            toast.error(data.error || "Erro ao conectar");
          }
        } catch {
          toast.error("Erro ao trocar token");
        }
      })();
    }
  }, [searchParams]);

  /* ─── Fetch posts ─── */
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await adminFetch("/api/admin/instagram/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch { /* ignore */ }
    setLoadingPosts(false);
  }, []);

  /* ─── Fetch insights ─── */
  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await adminFetch(`/api/admin/instagram/insights?days=${insightDays}`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch { /* ignore */ }
    setLoadingInsights(false);
  }, [insightDays]);

  /* ─── Fetch competitors ─── */
  const fetchCompetitors = useCallback(async () => {
    setLoadingCompetitors(true);
    try {
      const res = await adminFetch("/api/admin/instagram/competitors");
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data.competitors || []);
      }
    } catch { /* ignore */ }
    setLoadingCompetitors(false);
  }, []);

  /* ─── Fetch news ─── */
  const fetchNews = useCallback(async () => {
    setLoadingNews(true);
    try {
      const [articlesRes, feedsRes] = await Promise.all([
        adminFetch(`/api/admin/instagram/news/articles?topic=${newsTopic}`),
        adminFetch("/api/admin/instagram/news/feeds"),
      ]);
      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data.articles || []);
      }
      if (feedsRes.ok) {
        const data = await feedsRes.json();
        setFeeds(data.feeds || []);
      }
    } catch { /* ignore */ }
    setLoadingNews(false);
  }, [newsTopic]);

  /* ─── Initial load ─── */
  useEffect(() => {
    checkToken();
    fetchPosts();
    fetchInsights();
    fetchCompetitors();
    fetchNews();
  }, [checkToken, fetchPosts, fetchInsights, fetchCompetitors, fetchNews]);

  /* ─── Actions ─── */
  const handleSyncPosts = async () => {
    setSyncing(true);
    try {
      const res = await adminFetch("/api/admin/instagram/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.synced} posts sincronizados`);
        fetchPosts();
      } else {
        toast.error(data.error || "Erro ao sincronizar");
      }
    } catch {
      toast.error("Erro ao sincronizar");
    }
    setSyncing(false);
  };

  const handleSyncInsights = async () => {
    setSyncingInsights(true);
    try {
      const res = await adminFetch("/api/admin/instagram/insights", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.upserted} dias de insights sincronizados`);
        fetchInsights();
      } else {
        toast.error(data.error || "Erro ao sincronizar");
      }
    } catch {
      toast.error("Erro ao sincronizar insights");
    }
    setSyncingInsights(false);
  };

  const handleSavePost = async () => {
    if (!editPost) return;
    setSavingPost(true);
    try {
      const res = await adminFetch("/api/admin/instagram/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPost),
      });
      if (res.ok) {
        toast.success(editPost.id ? "Post atualizado" : "Post criado");
        setEditPost(null);
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar");
      }
    } catch {
      toast.error("Erro ao salvar post");
    }
    setSavingPost(false);
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await adminFetch("/api/admin/instagram/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Post removido");
        fetchPosts();
      }
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleSaveCompetitor = async () => {
    if (!editCompetitor) return;
    setSavingCompetitor(true);
    try {
      const res = await adminFetch("/api/admin/instagram/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCompetitor),
      });
      if (res.ok) {
        toast.success(editCompetitor.id ? "Competidor atualizado" : "Competidor adicionado");
        setEditCompetitor(null);
        fetchCompetitors();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar");
      }
    } catch {
      toast.error("Erro ao salvar competidor");
    }
    setSavingCompetitor(false);
  };

  const handleDeleteCompetitor = async (id: string) => {
    try {
      const res = await adminFetch("/api/admin/instagram/competitors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Competidor removido");
        fetchCompetitors();
      }
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleFetchNews = async () => {
    setFetchingNews(true);
    try {
      const res = await adminFetch("/api/admin/instagram/news/articles", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.fetched} artigos atualizados`);
        fetchNews();
      } else {
        toast.error(data.error || "Erro ao buscar noticias");
      }
    } catch {
      toast.error("Erro ao buscar noticias");
    }
    setFetchingNews(false);
  };

  const handleSaveFeed = async () => {
    if (!editFeed) return;
    setSavingFeed(true);
    try {
      const res = await adminFetch("/api/admin/instagram/news/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFeed),
      });
      if (res.ok) {
        toast.success(editFeed.id ? "Feed atualizado" : "Feed adicionado");
        setEditFeed(null);
        fetchNews();
      }
    } catch {
      toast.error("Erro ao salvar feed");
    }
    setSavingFeed(false);
  };

  const handleDeleteFeed = async (id: string) => {
    try {
      const res = await adminFetch("/api/admin/instagram/news/feeds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Feed removido");
        fetchNews();
      }
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleRefreshToken = async () => {
    try {
      const res = await adminFetch("/api/admin/instagram/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Token renovado com sucesso");
        checkToken();
      } else {
        toast.error(data.error || "Erro ao renovar token");
      }
    } catch {
      toast.error("Erro ao renovar token");
    }
  };

  /* ─── Filtered posts ─── */
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (postStatusFilter !== "all" && p.status !== postStatusFilter) return false;
      if (postTypeFilter !== "all" && p.post_type !== postTypeFilter) return false;
      if (postSearch) {
        const q = postSearch.toLowerCase();
        return (p.caption || "").toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [posts, postStatusFilter, postTypeFilter, postSearch]);

  /* ─── Insights KPIs ─── */
  const insightKPIs = useMemo(() => {
    if (insights.length === 0) return { totalImpressions: 0, avgEngagement: 0, currentFollowers: 0, growth: 0 };
    const totalImpressions = insights.reduce((s, i) => s + i.impressions, 0);
    const totalReach = insights.reduce((s, i) => s + i.reach, 0);
    const avgEngagement = totalReach > 0 ? Number(((totalImpressions / totalReach) * 100).toFixed(1)) : 0;
    const currentFollowers = insights[insights.length - 1]?.follower_count || 0;
    const firstFollowers = insights[0]?.follower_count || currentFollowers;
    const growth = currentFollowers - firstFollowers;
    return { totalImpressions, avgEngagement, currentFollowers, growth };
  }, [insights]);

  /* ─── Calendar data ─── */
  const calendarPosts = useMemo(() => {
    const map: Record<number, IGPost[]> = {};
    posts.forEach((p) => {
      const dateStr = p.scheduled_at || p.published_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    });
    return map;
  }, [posts, calMonth, calYear]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  /* ─── Post KPIs ─── */
  const postKPIs = useMemo(() => {
    const total = posts.length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const ideas = posts.filter((p) => p.status === "idea").length;
    return { total, scheduled, drafts, ideas };
  }, [posts]);

  /* ─── Connect URL ─── */
  const FB_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_FB_APP_ID || "";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://patasamorememorias.com.br";
  const connectUrl = `https://www.facebook.com/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(SITE_URL + "/admin/instagram")}&scope=instagram_basic,pages_show_list,pages_read_engagement,business_management&response_type=code`;

  const monthNames = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  /* ────────────────────── RENDER ────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#8b5e5e] flex items-center gap-2">
            <Instagram className="size-6" />
            Instagram
          </h1>
          <p className="text-sm text-[#6b4c4c]">
            Gerenciamento de conteudo, analytics e monitoramento
          </p>
        </div>

        {/* Connection status */}
        {!checkingToken && (
          <div className="flex items-center gap-2">
            {tokenStatus.connected ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  @{tokenStatus.username}
                </Badge>
                {tokenStatus.daysUntilExpiry !== undefined && tokenStatus.daysUntilExpiry < 7 && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <AlertTriangle className="size-3 mr-1" />
                    Token expira em {tokenStatus.daysUntilExpiry}d
                  </Badge>
                )}
                <Button variant="outline" size="xs" onClick={handleRefreshToken}>
                  <RefreshCw className="size-3 mr-1" /> Renovar Token
                </Button>
              </div>
            ) : (
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                onClick={() => { window.location.href = connectUrl; }}
              >
                <Instagram className="size-4 mr-2" /> Conectar Instagram
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gerenciador">
        <TabsList className="bg-[#fdf8f4] border">
          <TabsTrigger value="gerenciador" className="data-[state=active]:bg-[#8b5e5e] data-[state=active]:text-white">
            <FileText className="size-4 mr-1" /> Gerenciador
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#8b5e5e] data-[state=active]:text-white">
            <BarChart3 className="size-4 mr-1" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="calendario" className="data-[state=active]:bg-[#8b5e5e] data-[state=active]:text-white">
            <Calendar className="size-4 mr-1" /> Calendario
          </TabsTrigger>
          <TabsTrigger value="competidores" className="data-[state=active]:bg-[#8b5e5e] data-[state=active]:text-white">
            <Users className="size-4 mr-1" /> Competidores
          </TabsTrigger>
          <TabsTrigger value="noticias" className="data-[state=active]:bg-[#8b5e5e] data-[state=active]:text-white">
            <Newspaper className="size-4 mr-1" /> Noticias Pet
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB 1: GERENCIADOR ═══════════════ */}
        <TabsContent value="gerenciador" className="space-y-4 mt-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Posts", value: postKPIs.total, icon: FileText, color: "text-[#8b5e5e]" },
              { label: "Agendados", value: postKPIs.scheduled, icon: Calendar, color: "text-blue-600" },
              { label: "Rascunhos", value: postKPIs.drafts, icon: Edit, color: "text-yellow-600" },
              { label: "Ideias", value: postKPIs.ideas, icon: Star, color: "text-gray-500" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <kpi.icon className={`size-5 ${kpi.color}`} />
                  <div>
                    <p className="text-xs text-[#6b4c4c]/70">{kpi.label}</p>
                    <p className="text-lg font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters + actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por caption ou notas..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={postStatusFilter} onValueChange={(v) => setPostStatusFilter(v || "all")}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="idea">Ideias</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={postTypeFilter} onValueChange={(v) => setPostTypeFilter(v || "all")}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="reels">Reels</SelectItem>
                <SelectItem value="carousel">Carrossel</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="single_image">Imagem</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={() => setEditPost({ status: "idea", post_type: "single_image", platform: "instagram", tags: [] })} className="bg-[#8b5e5e] hover:bg-[#6b4c4c]">
                <Plus className="size-4 mr-1" /> Novo Post
              </Button>
              {tokenStatus.connected && (
                <Button variant="outline" onClick={handleSyncPosts} disabled={syncing}>
                  {syncing ? <Loader2 className="size-4 mr-1 animate-spin" /> : <RefreshCw className="size-4 mr-1" />}
                  Sincronizar
                </Button>
              )}
            </div>
          </div>

          {/* Posts table */}
          {loadingPosts ? (
            <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-[#8b5e5e]" /></div>
          ) : filteredPosts.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum post encontrado</CardContent></Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Caption</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="hidden md:table-cell">Engajamento</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{truncate(post.caption, 60)}</p>
                        {post.ig_permalink && (
                          <a href={post.ig_permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            <ExternalLink className="size-3" /> Ver no IG
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={postTypeColor(post.post_type)}>{postTypeLabels[post.post_type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={postStatusColor(post.status)}>{postStatusLabels[post.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {post.published_at ? formatDate(post.published_at) : post.scheduled_at ? formatDate(post.scheduled_at) : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Heart className="size-3" />{post.likes}</span>
                          <span className="flex items-center gap-0.5"><MessageCircle className="size-3" />{post.comments}</span>
                          <span className="flex items-center gap-0.5"><Bookmark className="size-3" />{post.saves}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-xs" onClick={() => setEditPost(post)}>
                            <Edit className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="size-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════ TAB 2: ANALYTICS ═══════════════ */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <Button
                  key={d}
                  variant={insightDays === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInsightDays(d)}
                  className={insightDays === d ? "bg-[#8b5e5e]" : ""}
                >
                  {d} dias
                </Button>
              ))}
            </div>
            {tokenStatus.connected && (
              <Button variant="outline" onClick={handleSyncInsights} disabled={syncingInsights}>
                {syncingInsights ? <Loader2 className="size-4 mr-1 animate-spin" /> : <RefreshCw className="size-4 mr-1" />}
                Sincronizar Insights
              </Button>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Impressoes Totais", value: insightKPIs.totalImpressions.toLocaleString("pt-BR"), icon: Eye, color: "text-[#8b5e5e]" },
              { label: "Taxa de Engajamento", value: `${insightKPIs.avgEngagement}%`, icon: TrendingUp, color: "text-green-600" },
              { label: "Seguidores", value: insightKPIs.currentFollowers.toLocaleString("pt-BR"), icon: Users, color: "text-blue-600" },
              { label: "Crescimento", value: `${insightKPIs.growth >= 0 ? "+" : ""}${insightKPIs.growth}`, icon: TrendingUp, color: insightKPIs.growth >= 0 ? "text-green-600" : "text-red-600" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <kpi.icon className={`size-5 ${kpi.color}`} />
                  <div>
                    <p className="text-xs text-[#6b4c4c]/70">{kpi.label}</p>
                    <p className="text-lg font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          {loadingInsights ? (
            <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-[#8b5e5e]" /></div>
          ) : insights.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              Nenhum dado de insights disponivel.
              {tokenStatus.connected && " Clique em 'Sincronizar Insights' para importar dados."}
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Line chart: impressions + reach */}
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium text-[#6b4c4c]">Impressoes & Alcance</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={insights}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip labelFormatter={(v) => formatDate(String(v))} />
                      <Line type="monotone" dataKey="impressions" stroke="#8b5e5e" strokeWidth={2} name="Impressoes" dot={false} />
                      <Line type="monotone" dataKey="reach" stroke="#d4956a" strokeWidth={2} name="Alcance" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar chart: profile views + website clicks */}
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium text-[#6b4c4c]">Visitas ao Perfil & Cliques no Site</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={insights}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip labelFormatter={(v) => formatDate(String(v))} />
                      <Bar dataKey="profile_views" fill="#8b5e5e" name="Visitas Perfil" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="website_clicks" fill="#d4956a" name="Cliques Site" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Line chart: follower growth */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-sm font-medium text-[#6b4c4c]">Crescimento de Seguidores</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={insights}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip labelFormatter={(v) => formatDate(String(v))} />
                      <Line type="monotone" dataKey="follower_count" stroke="#8b5e5e" strokeWidth={2} name="Seguidores" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top posts */}
          {posts.filter((p) => p.status === "published").length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-[#6b4c4c]">Top Posts por Engajamento</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Caption</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Saves</TableHead>
                      <TableHead>Engajamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts
                      .filter((p) => p.status === "published")
                      .sort((a, b) => b.engagement_rate - a.engagement_rate)
                      .slice(0, 10)
                      .map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm truncate">{post.caption || "-"}</p>
                          </TableCell>
                          <TableCell><Badge className={postTypeColor(post.post_type)}>{postTypeLabels[post.post_type]}</Badge></TableCell>
                          <TableCell>{post.likes}</TableCell>
                          <TableCell>{post.comments}</TableCell>
                          <TableCell>{post.saves}</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-700">{post.engagement_rate}%</Badge></TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════ TAB 3: CALENDÁRIO ═══════════════ */}
        <TabsContent value="calendario" className="space-y-4 mt-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
              else setCalMonth(calMonth - 1);
            }}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="font-serif text-lg font-bold text-[#8b5e5e]">
              {monthNames[calMonth]} {calYear}
            </h2>
            <Button variant="outline" size="sm" onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
              else setCalMonth(calMonth + 1);
            }}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Calendar grid */}
          <Card>
            <CardContent className="p-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {dayNames.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-[#6b4c4c] py-1">{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px">
                {/* Empty cells for first day offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[80px] bg-gray-50/50 rounded" />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayPosts = calendarPosts[day] || [];
                  const isToday = day === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();
                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] p-1 rounded border cursor-pointer transition-colors hover:bg-[#8b5e5e]/5 ${isToday ? "border-[#8b5e5e] bg-[#8b5e5e]/5" : "border-transparent"}`}
                      onClick={() => {
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        setEditPost({ status: "idea", post_type: "single_image", platform: "instagram", tags: [], scheduled_at: dateStr + "T12:00" });
                      }}
                    >
                      <span className={`text-xs font-medium ${isToday ? "text-[#8b5e5e] font-bold" : "text-[#6b4c4c]"}`}>{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayPosts.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${postStatusColor(p.status)}`}
                            onClick={(e) => { e.stopPropagation(); setEditPost(p); }}
                            title={p.caption || ""}
                          >
                            {truncate(p.caption, 15)}
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} mais</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex gap-4 text-xs">
            {Object.entries(postStatusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`size-3 rounded ${postStatusColor(key)}`} />
                <span className="text-[#6b4c4c]">{label}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ═══════════════ TAB 4: COMPETIDORES ═══════════════ */}
        <TabsContent value="competidores" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6b4c4c]">
              Monitore concorrentes. Dados sao inseridos manualmente (a API do Instagram nao permite acessar metricas de outras contas).
            </p>
            <Button onClick={() => setEditCompetitor({ follower_count: 0, following_count: 0, media_count: 0, avg_likes: 0, avg_comments: 0, engagement_rate: 0, posting_frequency: 0 })} className="bg-[#8b5e5e] hover:bg-[#6b4c4c]">
              <Plus className="size-4 mr-1" /> Adicionar
            </Button>
          </div>

          {loadingCompetitors ? (
            <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-[#8b5e5e]" /></div>
          ) : competitors.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum competidor cadastrado</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {competitors.map((comp) => (
                <Card key={comp.id} className="relative">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                          {comp.handle?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">@{comp.handle}</p>
                          {comp.display_name && <p className="text-xs text-muted-foreground">{comp.display_name}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => setEditCompetitor(comp)}>
                          <Edit className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteCompetitor(comp.id)}>
                          <Trash2 className="size-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{comp.follower_count.toLocaleString("pt-BR")}</p>
                        <p className="text-[10px] text-muted-foreground">Seguidores</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{comp.media_count}</p>
                        <p className="text-[10px] text-muted-foreground">Posts</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{comp.engagement_rate}%</p>
                        <p className="text-[10px] text-muted-foreground">Engajamento</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Heart className="size-3" /> Media: {comp.avg_likes}</div>
                      <div className="flex items-center gap-1"><MessageCircle className="size-3" /> Media: {comp.avg_comments}</div>
                    </div>
                    {comp.last_synced_at && (
                      <p className="text-[10px] text-muted-foreground">Atualizado: {formatDate(comp.last_synced_at)}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════ TAB 5: NOTÍCIAS PET ═══════════════ */}
        <TabsContent value="noticias" className="space-y-4 mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {["all", "general", "business", "research", "tools"].map((t) => (
                <Button
                  key={t}
                  variant={newsTopic === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewsTopic(t)}
                  className={newsTopic === t ? "bg-[#8b5e5e]" : ""}
                >
                  {topicLabels[t]}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFeedManager(true)}>
                <Rss className="size-4 mr-1" /> Gerenciar Feeds
              </Button>
              <Button variant="outline" size="sm" onClick={handleFetchNews} disabled={fetchingNews}>
                {fetchingNews ? <Loader2 className="size-4 mr-1 animate-spin" /> : <RefreshCw className="size-4 mr-1" />}
                Atualizar
              </Button>
            </div>
          </div>

          {loadingNews ? (
            <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-[#8b5e5e]" /></div>
          ) : articles.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              Nenhum artigo encontrado. Adicione feeds RSS e clique em &quot;Atualizar&quot;.
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#8b5e5e] hover:underline line-clamp-2"
                        >
                          {article.title}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{article.source_name}</Badge>
                          <Badge variant="outline" className="text-[10px]">{topicLabels[article.topic] || article.topic}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDate(article.published_at)}</span>
                        </div>
                        {article.summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                        )}
                      </div>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4 text-muted-foreground hover:text-[#8b5e5e]" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════ DIALOGS ═══════════════ */}

      {/* Post Dialog */}
      <Dialog open={!!editPost} onOpenChange={(open) => !open && setEditPost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#8b5e5e]">
              {editPost?.id ? "Editar Post" : "Novo Post"}
            </DialogTitle>
            <DialogDescription>Preencha os detalhes do post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Caption</Label>
              <Textarea
                value={editPost?.caption || ""}
                onChange={(e) => setEditPost((prev) => prev ? { ...prev, caption: e.target.value } : prev)}
                rows={4}
                placeholder="Escreva a legenda do post..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={editPost?.post_type || "single_image"} onValueChange={(v) => setEditPost((prev) => prev ? { ...prev, post_type: v as IGPost["post_type"] } : prev)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_image">Imagem</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="carousel">Carrossel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editPost?.status || "idea"} onValueChange={(v) => setEditPost((prev) => prev ? { ...prev, status: v as IGPost["status"] } : prev)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Ideia</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data agendada</Label>
              <Input
                type="datetime-local"
                value={editPost?.scheduled_at?.slice(0, 16) || ""}
                onChange={(e) => setEditPost((prev) => prev ? { ...prev, scheduled_at: e.target.value } : prev)}
              />
            </div>
            <div>
              <Label>Tags (separadas por virgula)</Label>
              <Input
                value={(editPost?.tags || []).join(", ")}
                onChange={(e) => setEditPost((prev) => prev ? { ...prev, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) } : prev)}
                placeholder="#dogbook, #pet, #fotografia"
              />
            </div>
            <div>
              <Label>Notas internas</Label>
              <Textarea
                value={editPost?.notes || ""}
                onChange={(e) => setEditPost((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
                rows={2}
                placeholder="Notas internas sobre o post..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>Cancelar</Button>
            <Button onClick={handleSavePost} disabled={savingPost} className="bg-[#8b5e5e] hover:bg-[#6b4c4c]">
              {savingPost ? <Loader2 className="size-4 mr-1 animate-spin" /> : null}
              {editPost?.id ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Competitor Dialog */}
      <Dialog open={!!editCompetitor} onOpenChange={(open) => !open && setEditCompetitor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#8b5e5e]">
              {editCompetitor?.id ? "Editar Competidor" : "Adicionar Competidor"}
            </DialogTitle>
            <DialogDescription>Insira os dados do competidor manualmente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Handle (@username)</Label>
              <Input
                value={editCompetitor?.handle || ""}
                onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, handle: e.target.value.replace("@", "") } : prev)}
                placeholder="petshopexemplo"
              />
            </div>
            <div>
              <Label>Nome</Label>
              <Input
                value={editCompetitor?.display_name || ""}
                onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, display_name: e.target.value } : prev)}
                placeholder="Pet Shop Exemplo"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Seguidores</Label>
                <Input type="number" value={editCompetitor?.follower_count || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, follower_count: Number(e.target.value) } : prev)} />
              </div>
              <div>
                <Label>Seguindo</Label>
                <Input type="number" value={editCompetitor?.following_count || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, following_count: Number(e.target.value) } : prev)} />
              </div>
              <div>
                <Label>Posts</Label>
                <Input type="number" value={editCompetitor?.media_count || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, media_count: Number(e.target.value) } : prev)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Media Likes</Label>
                <Input type="number" value={editCompetitor?.avg_likes || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, avg_likes: Number(e.target.value) } : prev)} />
              </div>
              <div>
                <Label>Media Comments</Label>
                <Input type="number" value={editCompetitor?.avg_comments || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, avg_comments: Number(e.target.value) } : prev)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Engajamento (%)</Label>
                <Input type="number" step="0.1" value={editCompetitor?.engagement_rate || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, engagement_rate: Number(e.target.value) } : prev)} />
              </div>
              <div>
                <Label>Posts/Semana</Label>
                <Input type="number" step="0.1" value={editCompetitor?.posting_frequency || 0} onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, posting_frequency: Number(e.target.value) } : prev)} />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={editCompetitor?.notes || ""}
                onChange={(e) => setEditCompetitor((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCompetitor(null)}>Cancelar</Button>
            <Button onClick={handleSaveCompetitor} disabled={savingCompetitor} className="bg-[#8b5e5e] hover:bg-[#6b4c4c]">
              {savingCompetitor ? <Loader2 className="size-4 mr-1 animate-spin" /> : null}
              {editCompetitor?.id ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feed Manager Dialog */}
      <Dialog open={showFeedManager} onOpenChange={setShowFeedManager}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#8b5e5e]">Gerenciar Feeds RSS</DialogTitle>
            <DialogDescription>Adicione ou remova fontes de noticias</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {feeds.map((feed) => (
              <div key={feed.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <p className="text-sm font-medium">{feed.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">{feed.url}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{topicLabels[feed.topic]}</Badge>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteFeed(feed.id)}>
                  <Trash2 className="size-3.5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-3">
            <p className="text-sm font-medium text-[#6b4c4c]">Adicionar Feed</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editFeed?.name || ""}
                  onChange={(e) => setEditFeed((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Pet Business"
                />
              </div>
              <div>
                <Label>Topico</Label>
                <Select value={editFeed?.topic || "general"} onValueChange={(v) => setEditFeed((prev) => ({ ...prev, topic: v || "general" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="business">Negocios</SelectItem>
                    <SelectItem value="research">Pesquisa</SelectItem>
                    <SelectItem value="tools">Ferramentas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>URL do RSS</Label>
              <Input
                value={editFeed?.url || ""}
                onChange={(e) => setEditFeed((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/feed/"
              />
            </div>
            <Button
              onClick={handleSaveFeed}
              disabled={savingFeed || !editFeed?.name || !editFeed?.url}
              className="bg-[#8b5e5e] hover:bg-[#6b4c4c] w-full"
            >
              {savingFeed ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Plus className="size-4 mr-1" />}
              Adicionar Feed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
