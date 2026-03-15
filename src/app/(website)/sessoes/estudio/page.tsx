import type { Metadata } from "next";
import SessionPageContent from "@/components/sessoes/SessionPageContent";
import { getSessions } from "@/components/sessoes/session-data";
import { getServerSideData } from "@/lib/payment-config-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sessão Estúdio - Sessão Fotográfica Pet",
  description:
    "Sessão completa no estúdio com cenários temáticos exclusivos, iluminação profissional e muita diversão. Pinheiros, SP.",
  openGraph: {
    title: "Sessão Estúdio - Sessão Fotográfica Pet",
    description:
      "Sessão completa no estúdio com cenários exclusivos. Pinheiros, SP.",
    images: ["/images/session-estudio.jpg"],
  },
};

export default async function EstudioPage() {
  const { paymentConfig, prices } = await getServerSideData();
  const sessions = getSessions({ paymentConfig, prices });
  const session = sessions.find((s) => s.slug === "estudio")!;

  return (
    <SessionPageContent
      session={session}
      serverInstallments={paymentConfig.maxInstallments}
      serverPixDiscountPct={paymentConfig.pixDiscountPct}
    />
  );
}
