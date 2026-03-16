"use client";

import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Calendar, Clock } from "lucide-react";

interface BoletoData {
  bankSlipUrl: string;
  invoiceUrl: string;
  dueDate: string;
}

interface Props {
  boletoData: BoletoData;
  orderNumber: string;
}

export default function BoletoPayment({ boletoData, orderNumber }: Props) {
  const formattedDate = new Date(boletoData.dueDate + "T12:00:00").toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <FileText className="size-5 text-primary" />
          <h3 className="text-lg font-semibold">Boleto Gerado</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Pedido <span className="font-medium">#{orderNumber}</span>
        </p>
      </div>

      {/* Due date */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 py-3 px-4">
        <Calendar className="size-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          Vencimento:{" "}
          <span className="font-semibold">{formattedDate}</span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          className="w-full gap-2"
          onClick={() => window.open(boletoData.bankSlipUrl, "_blank")}
        >
          <ExternalLink className="size-4" />
          Abrir Boleto PDF
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => window.open(boletoData.invoiceUrl, "_blank")}
        >
          <FileText className="size-4" />
          Ver Fatura Completa
        </Button>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
        <p className="text-xs font-medium text-foreground">
          Informacoes importantes:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-start gap-2">
            <Clock className="size-3 mt-0.5 shrink-0" />
            O boleto pode levar ate 3 dias uteis para ser compensado
          </li>
          <li className="flex items-start gap-2">
            <FileText className="size-3 mt-0.5 shrink-0" />
            Voce pode pagar em qualquer banco, loteria ou app bancario
          </li>
          <li className="flex items-start gap-2">
            <Calendar className="size-3 mt-0.5 shrink-0" />
            Apos o vencimento, o boleto sera cancelado automaticamente
          </li>
        </ul>
      </div>
    </div>
  );
}
