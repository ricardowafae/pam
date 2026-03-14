import type { Metadata } from "next";
import SessionPageContent from "@/components/sessoes/SessionPageContent";
import { SESSIONS } from "@/components/sessoes/session-data";

export const metadata: Metadata = {
  title: "Sessão Ar-livre + Estúdio - Sessão Fotográfica Pet",
  description:
    "O melhor dos dois mundos! Fotos no estúdio e ao ar-livre em São Paulo. 40 fotos, 5 horas. R$ 4.900 em até 10x. Pinheiros, SP.",
  openGraph: {
    title: "Sessão Ar-livre + Estúdio - Sessão Fotográfica Pet",
    description:
      "Combine fotos no estúdio com sessão ao ar-livre. R$ 4.900 em até 10x.",
    images: ["/images/session-completa.jpg"],
  },
};

export default function CompletaPage() {
  const session = SESSIONS.find((s) => s.slug === "completa")!;
  return <SessionPageContent session={session} />;
}
