"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  DollarSign,
  FileText,
  Menu,
  PawPrint,
  Megaphone,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type PartnerRole = "fotografo" | "influenciador";

const navItemsByRole: Record<
  PartnerRole,
  { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  fotografo: [
    { href: "/parceiros/fotografo", label: "Sessoes de Foto", icon: Camera },
    { href: "/parceiros/comissoes", label: "Comissoes", icon: DollarSign },
    { href: "/parceiros/dados", label: "Dados Cadastrais", icon: FileText },
  ],
  influenciador: [
    { href: "/parceiros/influenciador", label: "Painel", icon: Megaphone },
    { href: "/parceiros/comissoes", label: "Comissoes", icon: DollarSign },
    { href: "/parceiros/dados", label: "Dados Cadastrais", icon: FileText },
  ],
};

const mockPartners: Record<PartnerRole, { name: string; initials: string }> = {
  fotografo: { name: "Juliano Lemos", initials: "JL" },
  influenciador: { name: "Camila Rocha", initials: "CR" },
};

const ROLE_STORAGE_KEY = "pam_partner_role";

/**
 * Detects the partner role from the URL and persists it in sessionStorage
 * so that shared pages (/parceiros/comissoes, /parceiros/dados) keep
 * the correct sidebar context.
 */
function usePartnerRole(): PartnerRole {
  const pathname = usePathname();

  // Always start with "fotografo" on server to avoid hydration mismatch
  const [role, setRole] = useState<PartnerRole>("fotografo");

  useEffect(() => {
    // On mount, read persisted role from sessionStorage
    const stored = sessionStorage.getItem(ROLE_STORAGE_KEY);
    if (stored === "fotografo" || stored === "influenciador") {
      setRole(stored);
    }
  }, []);

  useEffect(() => {
    // When navigating to an explicit role page, persist the role
    if (pathname.startsWith("/parceiros/influenciador")) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, "influenciador");
      setRole("influenciador");
    } else if (pathname.startsWith("/parceiros/fotografo")) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, "fotografo");
      setRole("fotografo");
    }
    // Shared pages (/parceiros/comissoes, /parceiros/dados) keep current role
  }, [pathname]);

  return role;
}

function SidebarContent() {
  const pathname = usePathname();
  const role = usePartnerRole();
  const partner = mockPartners[role];
  const navItems = navItemsByRole[role];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <Avatar size="lg">
            <AvatarFallback>{partner.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {partner.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {role}
            </p>
          </div>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <PawPrint className="size-3" />
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}

export default function ParceirosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/parceiros/login";

  // Login page renders without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <PawPrint className="size-5 text-primary" />
          <span className="font-serif text-base font-semibold text-primary">
            Portal Parceiros
          </span>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Header + Sheet */}
      <div className="flex flex-1 flex-col">
        <header className="md:hidden flex items-center justify-between border-b bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <PawPrint className="size-5 text-primary" />
            <span className="font-serif text-sm font-semibold text-primary">
              Parceiros
            </span>
          </div>
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg border border-input bg-background p-2 text-sm font-medium hover:bg-muted">
              <Menu className="size-5" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
