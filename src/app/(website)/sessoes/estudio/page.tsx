import type { Metadata } from "next";
import SessionPageContent from "@/components/sessoes/SessionPageContent";
import { SESSIONS } from "@/components/sessoes/session-data";

export const metadata: Metadata = {
  title: "Sessão Estúdio - Sessão Fotográfica Pet",
  description:
    "Sessão completa no estúdio com cenários temáticos exclusivos, iluminação profissional e muita diversão. R$ 3.700 em até 10x. Pinheiros, SP.",
  openGraph: {
    title: "Sessão Estúdio - Sessão Fotográfica Pet",
    description:
      "Sessão completa no estúdio com cenários exclusivos. R$ 3.700 em até 10x.",
    images: ["/images/session-estudio.jpg"],
  },
};

export default function EstudioPage() {
  const session = SESSIONS.find((s) => s.slug === "estudio")!;
  return <SessionPageContent session={session} />;
}
