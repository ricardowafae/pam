import type { Metadata } from "next";
import { getServerSideData } from "@/lib/payment-config-server";
import DogbookClient from "./DogbookClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dogbook - Fotolivro Artesanal Premium",
  description:
    "Dogbook: o fotolivro artesanal premium que eterniza os momentos especiais com seu pet. Capa em linho, 24 páginas, temas exclusivos.",
};

export default async function DogbookPage() {
  const { paymentConfig, prices } = await getServerSideData();

  return (
    <DogbookClient
      price={prices.dogbook}
      maxInstallments={paymentConfig.maxInstallments}
      pixDiscountPct={paymentConfig.pixDiscountPct}
    />
  );
}
