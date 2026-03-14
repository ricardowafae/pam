import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vale Presente - Presenteie com Amor",
  description:
    "Dê a alguém especial a oportunidade de eternizar os momentos mais preciosos com seu pet. Vale-presentes para Dogbook e Sessões Fotográficas. Pinheiros, SP.",
  openGraph: {
    title: "Vale Presente - Presenteie com Amor",
    description:
      "Vale-presentes para Dogbook e Sessões Fotográficas Pet. Descontos progressivos para compras em quantidade.",
    images: ["/images/dogbook-cover-closed.jpg"],
  },
};

export default function ValePresenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
