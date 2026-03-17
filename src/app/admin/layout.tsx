"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Camera,
  ShoppingCart,
  Image,
  Megaphone,
  UserCheck,
  DollarSign,
  UsersRound,
  Menu,
  LogOut,
  PawPrint,
  Gift,
  TrendingUp,
  MessageSquareMore,
  HandCoins,
  ShieldBan,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/sessoes", label: "Sessoes Foto", icon: Camera },
  { href: "/admin/pedidos", label: "Dogbooks", icon: ShoppingCart },
  { href: "/admin/galeria", label: "Galeria", icon: Image },
  { href: "/admin/influenciadores", label: "Influenciadores", icon: Megaphone },
  { href: "/admin/fotografos", label: "Fotografos", icon: UserCheck },
  { href: "/admin/conversao", label: "Conversao", icon: TrendingUp },
  { href: "/admin/comissoes", label: "Comissoes", icon: HandCoins },
  { href: "/admin/precos", label: "Produtos e Serviços", icon: DollarSign },
  { href: "/admin/vales", label: "Gestão de Vales", icon: Gift },
  { href: "/admin/comunicacao", label: "Comunicação", icon: MessageSquareMore },
  { href: "/admin/instagram", label: "Instagram", icon: Instagram },
  { href: "/admin/equipe", label: "Equipe", icon: UsersRound },
  { href: "/admin/blacklist", label: "Blocklist", icon: ShieldBan },
];

function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#8b5e5e] text-white"
                : "text-[#6b4c4c] hover:bg-[#8b5e5e]/10"
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/admin/login";

  // Login page renders without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#fdf8f4]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[#8b5e5e]/10 bg-white lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 px-6">
          <PawPrint className="size-6 text-[#8b5e5e]" />
          <span className="font-serif text-lg font-bold text-[#8b5e5e]">
            PAM Admin
          </span>
        </div>
        <Separator />
        <div className="mt-4 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-[#8b5e5e]/10 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="inline-flex size-8 items-center justify-center rounded-lg border border-[#8b5e5e]/20 text-[#8b5e5e] hover:bg-[#8b5e5e]/10 lg:hidden"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b px-6 py-4">
                  <SheetTitle className="flex items-center gap-2 font-serif text-[#8b5e5e]">
                    <PawPrint className="size-5" />
                    PAM Admin
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <SidebarNav onLinkClick={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <h2 className="text-sm font-medium text-[#6b4c4c] lg:text-base">
              Painel Administrativo
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6b4c4c]">Juliano Lemos</span>
            <Button variant="ghost" size="icon-sm" className="text-[#8b5e5e]">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
