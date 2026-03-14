"use client";

import { useState } from "react";
import {
  Gift,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  ShoppingCart,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ── Types ─────────────────────────────────────────── */
type VoucherStatus = "Disponivel" | "Utilizado" | "Expirado";

interface Voucher {
  id: string;
  code: string;
  product: string;
  discount: number;
  status: VoucherStatus;
  date: string;
  validUntil: string;
  usedDate?: string;
  redeemed?: boolean; // true = vale resgatado (recebido de alguem)
}

/* ── Status config ────────────────────────────────── */
const statusConfig: Record<VoucherStatus, { color: string; icon: React.ElementType }> = {
  Disponivel: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  Utilizado: { color: "bg-blue-100 text-blue-800", icon: Gift },
  Expirado: { color: "bg-gray-100 text-gray-600", icon: XCircle },
};

/* ── Mock data ─────────────────────────────────────── */
const mockVouchers: Voucher[] = [
  {
    id: "v1",
    code: "TESTE001",
    product: "Dogbook",
    discount: 100,
    status: "Disponivel",
    date: "19/02/2026",
    validUntil: "19/05/2026",
  },
  {
    id: "v2",
    code: "PAM-GIFT-B3M9",
    product: "Sessao Estudio",
    discount: 200,
    status: "Disponivel",
    date: "10/02/2026",
    validUntil: "10/05/2026",
  },
  {
    id: "v3",
    code: "PAM-GIFT-X1P4",
    product: "Dogbook",
    discount: 100,
    status: "Utilizado",
    date: "15/12/2025",
    validUntil: "15/03/2026",
    usedDate: "20/01/2026",
  },
];

const mockRedeemed: Voucher[] = [
  {
    id: "r1",
    code: "PAM-RES-7K2A",
    product: "Dogbook",
    discount: 150,
    status: "Disponivel",
    date: "05/03/2026",
    validUntil: "05/06/2026",
    redeemed: true,
  },
];

/* ── Component ─────────────────────────────────────── */
export default function ValesPage() {
  const [activeTab, setActiveTab] = useState<"meus" | "resgatados">("meus");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalCount = mockVouchers.length;
  const availableCount = mockVouchers.filter((v) => v.status === "Disponivel").length;
  const usedCount = mockVouchers.filter((v) => v.status === "Utilizado").length;
  const redeemedCount = mockRedeemed.length;

  const displayVouchers = activeTab === "meus" ? mockVouchers : mockRedeemed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Meu Vale-Presente
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e acompanhe seu vale-presente
        </p>
      </div>

      {/* ── KPIs ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Gift className="size-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CheckCircle className="size-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Disponiveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CheckCircle className="size-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{usedCount}</p>
            <p className="text-xs text-muted-foreground">Utilizados</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("meus")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "meus"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Meus Vales ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab("resgatados")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "resgatados"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Vales Resgatados ({redeemedCount})
        </button>
      </div>

      {/* ── Table ─────────────────────────────────── */}
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {activeTab === "meus" ? "Vales Comprados" : "Vales Resgatados"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === "meus"
                ? "Vales presente que voce adquiriu"
                : "Vales presente que voce recebeu de outras pessoas"}
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Codigo</th>
                  <th className="pb-2 pr-4 font-medium">Produto</th>
                  <th className="pb-2 pr-4 font-medium">Desconto</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Data</th>
                  <th className="pb-2 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {displayVouchers.map((v) => {
                  const cfg = statusConfig[v.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <code className="font-mono font-semibold text-foreground">
                          {v.code}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-foreground">{v.product}</td>
                      <td className="py-3 pr-4 text-foreground">
                        R$ {v.discount.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                        >
                          <StatusIcon className="size-3" />
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {v.date}
                      </td>
                      <td className="py-3">
                        {v.status === "Disponivel" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleCopy(v.id, v.code)}
                            >
                              {copiedId === v.id ? (
                                <>
                                  <CheckCircle className="size-3 text-green-600" />
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Send className="size-3" />
                                  Enviar Codigo
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-muted-foreground"
                            >
                              <ShoppingCart className="size-3" />
                              Usar para Mim
                            </Button>
                          </div>
                        )}
                        {v.status === "Utilizado" && (
                          <span className="text-xs text-muted-foreground">
                            Usado em {v.usedDate}
                          </span>
                        )}
                        {v.status === "Expirado" && (
                          <span className="text-xs text-muted-foreground">
                            Expirado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {displayVouchers.map((v) => {
              const cfg = statusConfig[v.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={v.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <code className="font-mono font-semibold text-sm">
                      {v.code}
                    </code>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}
                    >
                      <StatusIcon className="size-2.5" />
                      {v.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{v.product}</span>
                    <span>R$ {v.discount.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{v.date}</div>
                  {v.status === "Disponivel" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => handleCopy(v.id, v.code)}
                      >
                        {copiedId === v.id ? (
                          <>
                            <CheckCircle className="size-3 text-green-600" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Send className="size-3" />
                            Enviar Codigo
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-muted-foreground"
                      >
                        <ShoppingCart className="size-3" />
                        Usar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {displayVouchers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {activeTab === "meus"
                  ? "Voce ainda nao possui vale-presente."
                  : "Voce ainda nao resgatou nenhum vale-presente."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
