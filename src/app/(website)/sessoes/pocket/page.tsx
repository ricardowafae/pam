import type { Metadata } from "next";
import SessionPageContent from "@/components/sessoes/SessionPageContent";
import { SESSIONS } from "@/components/sessoes/session-data";

export const metadata: Metadata = {
  title: "Experiência Pocket - Sessão Fotográfica Pet",
  description:
    "Sessão rápida e acessível no estúdio para capturar momentos especiais do seu pet com iluminação profissional. R$ 900 em até 10x. Pinheiros, SP.",
  openGraph: {
    title: "Experiência Pocket - Sessão Fotográfica Pet",
    description:
      "Sessão rápida e acessível no estúdio. R$ 900 em até 10x.",
    images: ["/images/session-pocket.jpg"],
  },
};

export default function PocketPage() {
  const session = SESSIONS.find((s) => s.slug === "pocket")!;
  return <SessionPageContent session={session} />;
}
