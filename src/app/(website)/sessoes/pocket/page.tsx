import type { Metadata } from "next";
import SessionPageContent from "@/components/sessoes/SessionPageContent";
import { getSessions } from "@/components/sessoes/session-data";
import { getServerSideData } from "@/lib/payment-config-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Experiência Pocket - Sessão Fotográfica Pet",
  description:
    "Sessão rápida e acessível no estúdio para capturar momentos especiais do seu pet com iluminação profissional. Pinheiros, SP.",
  openGraph: {
    title: "Experiência Pocket - Sessão Fotográfica Pet",
    description:
      "Sessão rápida e acessível no estúdio. Pinheiros, SP.",
    images: ["/images/session-pocket.jpg"],
  },
};

export default async function PocketPage() {
  const { paymentConfig, prices } = await getServerSideData();
  const sessions = getSessions({ paymentConfig, prices });
  const session = sessions.find((s) => s.slug === "pocket")!;

  return (
    <SessionPageContent
      session={session}
      serverInstallments={paymentConfig.maxInstallments}
      serverPixDiscountPct={paymentConfig.pixDiscountPct}
    />
  );
}
