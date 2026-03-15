"use client";

import { usePaymentConfig } from "@/hooks/usePaymentConfig";
import { getPixPrice } from "@/lib/pricing-config";

interface Props {
  price: number;
}

export default function SessionPriceDisplay({ price }: Props) {
  const paymentCfg = usePaymentConfig();
  const installments = paymentCfg.maxInstallments;
  const installmentValue = (price / installments).toFixed(2).replace(".", ",");
  const pixPrice = getPixPrice(price, paymentCfg.pixDiscountPct);

  return (
    <>
      <p className="text-xs text-muted-foreground">
        ou {installments}x de R$ {installmentValue}
      </p>
      <p className="text-xs font-medium text-green-600 mt-0.5">
        No PIX: R${" "}
        {pixPrice.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}{" "}
        ({paymentCfg.pixDiscountPct}% off)
      </p>
    </>
  );
}
