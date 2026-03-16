"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Clock, Loader2, QrCode } from "lucide-react";
import Image from "next/image";

interface PixData {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface Props {
  pixData: PixData;
  paymentId: string;
  orderNumber: string;
  onPaymentConfirmed: () => void;
}

export default function PixPayment({
  pixData,
  paymentId,
  orderNumber,
  onPaymentConfirmed,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [checking, setChecking] = useState(false);
  const [expired, setExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    const expDate = new Date(pixData.expirationDate);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expirado");
        setExpired(true);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pixData.expirationDate]);

  // Auto-poll every 5 seconds
  const checkStatus = useCallback(async () => {
    try {
      setChecking(true);
      const res = await fetch(
        `/api/asaas/payment-status?payment_id=${paymentId}`
      );
      const data = await res.json();

      if (data.status === "success") {
        onPaymentConfirmed();
      }
    } catch {
      // Silently retry
    } finally {
      setChecking(false);
    }
  }, [paymentId, onPaymentConfirmed]);

  useEffect(() => {
    if (expired) return;
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus, expired]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pixData.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = pixData.payload;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <QrCode className="size-5 text-primary" />
          <h3 className="text-lg font-semibold">Pagamento via PIX</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Pedido <span className="font-medium">#{orderNumber}</span>
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="rounded-xl border-2 border-dashed border-primary/30 p-4 bg-white">
          <Image
            src={`data:image/png;base64,${pixData.encodedImage}`}
            alt="QR Code PIX"
            width={220}
            height={220}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Copy-paste code */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground text-center">
          Ou copie o codigo PIX:
        </p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-xs font-mono break-all max-h-16 overflow-auto">
            {pixData.payload}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 gap-1.5"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {expired ? (
            <span className="text-destructive font-medium">QR Code expirado</span>
          ) : (
            <>
              Expira em{" "}
              <span className="font-medium text-foreground">{timeLeft}</span>
            </>
          )}
        </span>
      </div>

      {/* Check status button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={checkStatus}
        disabled={checking || expired}
      >
        {checking ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verificando...
          </>
        ) : (
          "Ja realizei o pagamento"
        )}
      </Button>

      {/* Instructions */}
      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
        <p className="text-xs font-medium text-foreground">Como pagar:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com PIX</li>
          <li>Escaneie o QR Code ou cole o codigo</li>
          <li>Confirme o pagamento</li>
        </ol>
        <p className="text-xs text-green-600 font-medium mt-2">
          O pagamento e confirmado instantaneamente!
        </p>
      </div>
    </div>
  );
}
