"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { clearInfluencerTracking } from "@/lib/influencer-tracking";

type PaymentStatus = "loading" | "success" | "processing" | "error";

function PagamentoSucessoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    async function fetchStatus() {
      try {
        const res = await fetch(
          `/api/stripe/checkout-status?session_id=${sessionId}`
        );
        const data = await res.json();

        if (data.status === "complete" && data.paymentStatus === "paid") {
          setStatus("success");
          setOrderNumber(data.orderNumber);
        } else if (data.status === "complete") {
          // Payment might still be processing (e.g. boleto)
          setStatus("processing");
          setOrderNumber(data.orderNumber);
        } else {
          setStatus("error");
        }

        // Clear cart and influencer tracking once
        if (!clearedRef.current) {
          clearedRef.current = true;
          clearCart();
          clearInfluencerTracking();
        }
      } catch {
        setStatus("error");
      }
    }

    fetchStatus();
  }, [sessionId, clearCart]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-primary" />
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Verificando pagamento...
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Aguarde enquanto confirmamos seu pagamento.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Pagamento Confirmado!
            </h1>
            {orderNumber && (
              <p className="mt-3 text-sm text-muted-foreground">
                Pedido:{" "}
                <span className="font-semibold text-foreground">
                  #{orderNumber}
                </span>
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Obrigado pela sua compra! Você receberá um e-mail de confirmação
              em breve com os detalhes do seu pedido.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  Voltar para a Home
                </Button>
              </Link>
              <Link href="/dogbook">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Package className="mr-2 size-4" />
                  Ver mais produtos
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "processing" && (
          <>
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100">
              <Package className="size-10 text-amber-600" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Pedido Registrado!
            </h1>
            {orderNumber && (
              <p className="mt-3 text-sm text-muted-foreground">
                Pedido:{" "}
                <span className="font-semibold text-foreground">
                  #{orderNumber}
                </span>
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Seu pedido foi registrado e o pagamento está sendo processado.
              Você receberá um e-mail assim que o pagamento for confirmado.
            </p>
            <div className="mt-8">
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  Voltar para a Home
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-10 text-red-600" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Algo deu errado
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Não foi possível confirmar seu pagamento. Se você acredita que
              houve um erro, entre em contato conosco.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/carrinho">
                <Button className="w-full sm:w-auto">
                  Voltar ao Carrinho
                </Button>
              </Link>
              <a
                href="https://wa.me/5511971053445"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full sm:w-auto">
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PagamentoSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-primary" />
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Carregando...
            </h1>
          </div>
        </div>
      }
    >
      <PagamentoSucessoContent />
    </Suspense>
  );
}
