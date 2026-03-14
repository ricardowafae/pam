"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  CreditCard,
  Lock,
  QrCode,
  Receipt,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type PaymentMethod = "cartao" | "pix" | "boleto";

/* ---------- mock order data (will come from context/state later) ---------- */
const mockOrder = {
  items: [
    {
      name: "Dogbook",
      quantity: 1,
      price: 490,
      image: "/images/dogbook-cover-closed.jpg",
    },
  ],
  subtotal: 490,
  discount: 0,
  total: 490,
  pixTotal: 465.5,
  installments: 10,
  installmentValue: 49,
};

export default function PagamentoPage() {
  const [method, setMethod] = useState<PaymentMethod>("cartao");
  const [processing, setProcessing] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* --- card fields --- */
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardInstallments, setCardInstallments] = useState("1");

  const order = mockOrder;

  /* --- field validation status --- */
  function fieldStatus(value: string) {
    if (!submitted) return null;
    const filled = value.trim().length > 0;
    return (
      <p className={cn(
        "mt-1 flex items-center gap-1 text-xs font-medium",
        filled ? "text-green-600" : "text-red-600"
      )}>
        {filled ? (
          <>
            <CheckCircle className="size-3" />
            Preenchido
          </>
        ) : (
          "Preenchimento obrigatório"
        )}
      </p>
    );
  }

  /* --- format card number with spaces --- */
  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  /* --- format expiry MM/AA --- */
  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  /* --- mock PIX code --- */
  const pixCode =
    "00020126580014br.gov.bcb.pix0136patasamorememorias@pix.com.br5204000053039865802BR5925PATAS AMOR E MEMORIAS6009SAO PAULO62070503***6304ABCD";

  function handleCopyPix() {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  }

  function handleSubmit() {
    setSubmitted(true);

    // Validate card fields
    if (method === "cartao") {
      const cardDigits = cardNumber.replace(/\s/g, "");
      if (
        !cardDigits ||
        !cardName.trim() ||
        !cardExpiry.trim() ||
        !cardCvv.trim()
      ) {
        return;
      }
    }

    setProcessing(true);
    // TODO: integrate with Stripe
    setTimeout(() => {
      setProcessing(false);
      alert("Pagamento processado com sucesso! (simulação)");
    }, 2000);
  }

  /* --- installment options --- */
  const installmentOptions = Array.from(
    { length: order.installments },
    (_, i) => {
      const n = i + 1;
      const value = order.total / n;
      return {
        value: String(n),
        label:
          n === 1
            ? `1x de R$ ${value.toFixed(2).replace(".", ",")} (sem juros)`
            : `${n}x de R$ ${value.toFixed(2).replace(".", ",")} (sem juros)`,
      };
    }
  );

  return (
    <div className="pb-16">
      {/* Back link */}
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          href="/carrinho"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar ao carrinho
        </Link>
      </div>

      {/* Title */}
      <h1 className="mt-4 text-center font-serif text-2xl font-bold text-foreground sm:text-3xl">
        Pagamento
      </h1>

      {/* Main grid */}
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* ============= LEFT COLUMN ============= */}
          <div className="space-y-6">
            {/* --- Payment method selector --- */}
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                <CreditCard className="size-5 text-primary" />
                Forma de Pagamento
              </h2>

              <div className="grid grid-cols-3 gap-2">
                {/* Cartão */}
                <button
                  type="button"
                  onClick={() => setMethod("cartao")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                    method === "cartao"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/30"
                  )}
                >
                  <CreditCard className="size-6" />
                  <span>Cartão</span>
                </button>

                {/* PIX */}
                <button
                  type="button"
                  onClick={() => setMethod("pix")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                    method === "pix"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/30"
                  )}
                >
                  <QrCode className="size-6" />
                  <span>PIX</span>
                </button>

                {/* Boleto */}
                <button
                  type="button"
                  onClick={() => setMethod("boleto")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                    method === "boleto"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/30"
                  )}
                >
                  <Receipt className="size-6" />
                  <span>Boleto</span>
                </button>
              </div>
            </section>

            {/* --- CARTÃO DE CRÉDITO --- */}
            {method === "cartao" && (
              <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
                <h2 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                  <Lock className="size-5 text-primary" />
                  Dados do Cartão
                </h2>

                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <Label htmlFor="cardNumber" className="text-foreground">
                      Número do Cartão *
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      maxLength={19}
                      className="mt-1.5 h-10 border-border/60 font-mono tracking-wider"
                    />
                    {fieldStatus(cardNumber)}
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <Label htmlFor="cardName" className="text-foreground">
                      Nome no Cartão *
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="Nome como está no cartão"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(e.target.value.toUpperCase())
                      }
                      className="mt-1.5 h-10 border-border/60 uppercase"
                    />
                    {fieldStatus(cardName)}
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-foreground">
                        Validade *
                      </Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        maxLength={5}
                        className="mt-1.5 h-10 border-border/60 font-mono"
                      />
                      {fieldStatus(cardExpiry)}
                    </div>
                    <div>
                      <Label htmlFor="cardCvv" className="text-foreground">
                        CVV *
                      </Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(
                            e.target.value.replace(/\D/g, "").slice(0, 4)
                          )
                        }
                        maxLength={4}
                        className="mt-1.5 h-10 border-border/60 font-mono"
                      />
                      {fieldStatus(cardCvv)}
                    </div>
                  </div>

                  {/* Installments */}
                  <div>
                    <Label
                      htmlFor="installments"
                      className="text-foreground"
                    >
                      Parcelas
                    </Label>
                    <select
                      id="installments"
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="mt-1.5 flex h-10 w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {installmentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={processing}
                  className="mt-6 w-full h-12 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm uppercase tracking-wide"
                >
                  <Lock className="size-4" />
                  {processing
                    ? "Processando..."
                    : `Pagar R$ ${order.total.toFixed(2).replace(".", ",")}`}
                </Button>
              </section>
            )}

            {/* --- PIX --- */}
            {method === "pix" && (
              <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
                <h2 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                  <QrCode className="size-5 text-primary" />
                  Pagamento via PIX
                </h2>

                <div className="flex flex-col items-center text-center">
                  {/* Discount badge */}
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle className="size-3.5" />
                    5% de desconto no PIX
                  </div>

                  {/* QR Code placeholder */}
                  <div className="mb-4 flex size-48 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                    <QrCode className="size-20 text-primary/40" />
                  </div>

                  <p className="mb-2 font-serif text-2xl font-bold text-foreground">
                    R$ {order.pixTotal.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie o código abaixo
                  </p>

                  {/* PIX Copy */}
                  <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/20 px-3 py-2">
                      <code className="flex-1 truncate text-xs text-muted-foreground">
                        {pixCode}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5 text-xs"
                        onClick={handleCopyPix}
                      >
                        {pixCopied ? (
                          <>
                            <CheckCircle className="size-3.5 text-green-600" />
                            Copiado!
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

                  <p className="mt-4 text-xs text-muted-foreground">
                    O pagamento via PIX é confirmado em poucos segundos.
                    <br />
                    Após a confirmação, você receberá um e-mail com os
                    próximos passos.
                  </p>
                </div>
              </section>
            )}

            {/* --- BOLETO --- */}
            {method === "boleto" && (
              <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
                <h2 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                  <Receipt className="size-5 text-primary" />
                  Pagamento via Boleto
                </h2>

                <div className="flex flex-col items-center text-center">
                  <p className="mb-2 font-serif text-2xl font-bold text-foreground">
                    R$ {order.total.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="mb-6 text-sm text-muted-foreground">
                    O boleto será gerado após clicar no botão abaixo.
                    <br />O prazo de compensação é de até 3 dias úteis.
                  </p>

                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
                      <Receipt className="size-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium mb-1">
                          Informações sobre Boleto
                        </p>
                        <ul className="space-y-1 text-amber-700">
                          <li>
                            • Vencimento em 3 dias úteis após a emissão
                          </li>
                          <li>
                            • Produção inicia após confirmação do pagamento
                          </li>
                          <li>
                            • Pagamento não parcelável
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full h-12 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm uppercase tracking-wide"
                    >
                      <Receipt className="size-4" />
                      {processing ? "Gerando boleto..." : "Gerar Boleto"}
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="size-4 text-green-600" />
                Compra segura
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-4 text-green-600" />
                Dados criptografados
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="size-4 text-green-600" />
                Stripe
              </div>
            </div>
          </div>

          {/* ============= RIGHT COLUMN — Order Summary ============= */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
                Resumo do Pedido
              </h2>

              {/* Items */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="shrink-0 overflow-hidden rounded-lg bg-secondary/30">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="size-14 object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap self-center">
                      R${" "}
                      {(item.price * item.quantity)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    R$ {order.subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span className="font-medium">
                      -R$ {order.discount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-3" />

              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base font-semibold text-foreground">
                  Total
                </span>
                <div className="text-right">
                  <p className="font-serif text-xl font-bold text-foreground">
                    R${" "}
                    {method === "pix"
                      ? order.pixTotal.toFixed(2).replace(".", ",")
                      : order.total.toFixed(2).replace(".", ",")}
                  </p>
                  {method === "cartao" && (
                    <p className="text-xs text-muted-foreground">
                      ou {order.installments}x de R${" "}
                      {order.installmentValue.toFixed(2).replace(".", ",")}
                    </p>
                  )}
                  {method === "pix" && (
                    <p className="text-xs text-green-600 font-medium">
                      com 5% de desconto
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Terms */}
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Ao adquirir qualquer produto ou serviço da Patas, Amor &
                Memórias, você concorda integralmente com nossos{" "}
                <Link
                  href="/termos"
                  className="underline hover:text-foreground transition-colors"
                >
                  Termos e Condições
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
