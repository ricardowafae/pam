"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";

interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface Props {
  value: CreditCardData;
  onChange: (data: CreditCardData) => void;
  installmentCount: number;
  onInstallmentChange: (count: number) => void;
  maxInstallments: number;
  total: number;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function getCardBrand(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^636/.test(digits) || /^6011/.test(digits)) return "Elo";
  return "";
}

export default function CreditCardForm({
  value,
  onChange,
  installmentCount,
  onInstallmentChange,
  maxInstallments,
  total,
}: Props) {
  const [displayNumber, setDisplayNumber] = useState(
    formatCardNumber(value.number)
  );

  const brand = getCardBrand(value.number);

  function handleNumberChange(raw: string) {
    const formatted = formatCardNumber(raw);
    setDisplayNumber(formatted);
    onChange({ ...value, number: raw.replace(/\D/g, "").slice(0, 16) });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="size-4 text-primary" />
        <span className="text-sm font-semibold">Dados do Cartao</span>
        <Lock className="size-3 text-muted-foreground ml-auto" />
        <span className="text-[10px] text-muted-foreground">
          Pagamento seguro
        </span>
      </div>

      {/* Card Number */}
      <div className="space-y-1.5">
        <Label htmlFor="cardNumber" className="text-xs">
          Numero do Cartao
        </Label>
        <div className="relative">
          <Input
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            value={displayNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            maxLength={19}
            inputMode="numeric"
            autoComplete="cc-number"
          />
          {brand && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              {brand}
            </span>
          )}
        </div>
      </div>

      {/* Holder Name */}
      <div className="space-y-1.5">
        <Label htmlFor="holderName" className="text-xs">
          Nome no Cartao
        </Label>
        <Input
          id="holderName"
          placeholder="Como esta impresso no cartao"
          value={value.holderName}
          onChange={(e) =>
            onChange({ ...value, holderName: e.target.value.toUpperCase() })
          }
          autoComplete="cc-name"
        />
      </div>

      {/* Expiry + CVV Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="expiryMonth" className="text-xs">
            Mes
          </Label>
          <select
            id="expiryMonth"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={value.expiryMonth}
            onChange={(e) =>
              onChange({ ...value, expiryMonth: e.target.value })
            }
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, "0");
              return (
                <option key={m} value={m}>
                  {m}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expiryYear" className="text-xs">
            Ano
          </Label>
          <select
            id="expiryYear"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={value.expiryYear}
            onChange={(e) =>
              onChange({ ...value, expiryYear: e.target.value })
            }
          >
            <option value="">AA</option>
            {Array.from({ length: 12 }, (_, i) => {
              const y = new Date().getFullYear() + i;
              return (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ccv" className="text-xs">
            CVV
          </Label>
          <Input
            id="ccv"
            placeholder="123"
            value={value.ccv}
            onChange={(e) =>
              onChange({
                ...value,
                ccv: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
            maxLength={4}
            inputMode="numeric"
            autoComplete="cc-csc"
          />
        </div>
      </div>

      {/* Installments */}
      {maxInstallments > 1 && (
        <div className="space-y-1.5">
          <Label htmlFor="installments" className="text-xs">
            Parcelas
          </Label>
          <select
            id="installments"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={installmentCount}
            onChange={(e) => onInstallmentChange(Number(e.target.value))}
          >
            {Array.from({ length: maxInstallments }, (_, i) => {
              const count = i + 1;
              const installmentValue = total / count;
              return (
                <option key={count} value={count}>
                  {count}x de R${" "}
                  {installmentValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                  {count === 1 ? " (a vista)" : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
}
