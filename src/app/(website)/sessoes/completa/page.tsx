import type { Metadata } from "next";
import SessionPageContent from "@/components/sessoes/SessionPageContent";
import { getSessions } from "@/components/sessoes/session-data";
import { getServerSideData } from "@/lib/payment-config-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sessão Ar-livre + Estúdio - Sessão Fotográfica Pet",
  description:
    "O melhor dos dois mundos! Fotos no estúdio e ao ar-livre em São Paulo. 40 fotos, 5 horas. Pinheiros, SP.",
  openGraph: {
    title: "Sessão Ar-livre + Estúdio - Sessão Fotográfica Pet",
    description:
      "Combine fotos no estúdio com sessão ao ar-livre. Pinheiros, SP.",
    images: ["/images/session-completa.jpg"],
  },
};

export default async function CompletaPage() {
  const { paymentConfig, prices } = await getServerSideData();
  const sessions = getSessions({ paymentConfig, prices });
  const session = sessions.find((s) => s.slug === "completa")!;

  return (
    <SessionPageContent
      session={session}
      serverInstallments={paymentConfig.maxInstallments}
      serverPixDiscountPct={paymentConfig.pixDiscountPct}
    />
  );
}
