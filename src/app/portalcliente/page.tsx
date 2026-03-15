"use client";

import {
  Book,
  Camera,
  MessageCircle,
  Cake,
  Gift,
  PawPrint,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
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
import Link from "next/link";

/* ── Mock user ─────────────────────────────────────── */
const mockUser = {
  name: "Ana",
  pets: [
    { name: "Luna", birthday: "15 de Abril", daysUntilBirthday: 32 },
    { name: "Thor", birthday: "10 de Agosto", daysUntilBirthday: 149 },
  ],
};

/* ── Mock pending items ────────────────────────────── */
const pendingItems = [
  {
    id: "1",
    label: "Dogbook Verao da Luna",
    sub: "Aguardando aprovacao do layout",
    href: "/portalcliente/meus-dogbooks",
    icon: Book,
    badge: "Em Aprovacao",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "2",
    label: "Dogbook Natal do Thor",
    sub: "Envie suas fotos favoritas",
    href: "/portalcliente/meus-dogbooks",
    icon: Book,
    badge: "Enviar Fotos",
    badgeColor: "bg-amber-100 text-amber-800",
  },
];

const upcomingSession = {
  type: "Estudio",
  date: "22/03/2026",
  time: "10:00",
  location: "Estudio PAM - Pinheiros",
  pets: ["Luna", "Thor"],
};

export default function PortalClienteDashboard() {
  const nextBirthday = mockUser.pets.reduce((a, b) =>
    a.daysUntilBirthday < b.daysUntilBirthday ? a : b
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Greeting */}
      <div className="text-center py-4">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Ola, {mockUser.name}! 🐾
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vinda ao seu Portal. Veja o que esta acontecendo.
        </p>
      </div>

      {/* Pending Actions */}
      {pendingItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Para voce fazer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <item.icon className="size-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Session */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="size-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Proxima Sessao: {upcomingSession.type}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {upcomingSession.date} as {upcomingSession.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {upcomingSession.location}
                </span>
              </div>
              <div className="flex gap-1 mt-1">
                {upcomingSession.pets.map((pet) => (
                  <span
                    key={pet}
                    className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5"
                  >
                    <PawPrint className="size-2.5" />
                    {pet}
                  </span>
                ))}
              </div>
            </div>
            <Link href="/portalcliente/sessoes">
              <Button variant="outline" size="sm">
                Ver
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/portalcliente/meus-dogbooks">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
            <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
              <Book className="size-8 text-primary" />
              <p className="text-sm font-medium">Meus Dogbooks</p>
              <Badge variant="secondary" className="text-xs">4 dogbooks</Badge>
            </CardContent>
          </Card>
        </Link>
        <Link href="/portalcliente/sessoes">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
            <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
              <Camera className="size-8 text-primary" />
              <p className="text-sm font-medium">Sessoes Foto</p>
              <Badge variant="secondary" className="text-xs">3 sessoes</Badge>
            </CardContent>
          </Card>
        </Link>
        <Link href="/portalcliente/vales">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
            <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
              <Gift className="size-8 text-primary" />
              <p className="text-sm font-medium">Vale-Presente</p>
              <Badge variant="secondary" className="text-xs">2 ativos</Badge>
            </CardContent>
          </Card>
        </Link>
        <a href="https://wa.me/5511936207631" target="_blank" rel="noopener noreferrer">
          <Card className="hover:border-green-300 transition-colors cursor-pointer h-full">
            <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
              <MessageCircle className="size-8 text-green-600" />
              <p className="text-sm font-medium">WhatsApp</p>
              <span className="text-xs text-muted-foreground">Fale conosco</span>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* Pet Birthday */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Cake className="size-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                Caoniversario da {nextBirthday.name} se aproxima!
              </p>
              <p className="text-xs text-muted-foreground">
                {nextBirthday.birthday} — Faltam {nextBirthday.daysUntilBirthday} dias
              </p>
            </div>
            <Link href="/dogbook">
              <Button size="sm" variant="secondary">
                Presente
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
