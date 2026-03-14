import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Patas, Amor e Memorias | Dogbook e Sessoes Fotograficas Pet",
    template: "%s | Patas, Amor e Memorias",
  },
  description:
    "Fotolivros artesanais e sessoes fotograficas para eternizar os melhores momentos com seu pet. Dogbook premium com temas exclusivos.",
  metadataBase: new URL("https://patasamorememorias.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://patasamorememorias.com.br",
    siteName: "Patas, Amor e Memorias",
    title: "Patas, Amor e Memorias | Dogbook e Sessoes Fotograficas Pet",
    description:
      "Fotolivros artesanais e sessoes fotograficas para eternizar os melhores momentos com seu pet.",
    images: [
      {
        url: "https://patasamorememorias.com.br/assets/hero-family-dog-CxyQ9XD6.jpg",
        width: 1200,
        height: 630,
        alt: "Patas, Amor e Memorias - Dogbook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patas, Amor e Memorias | Dogbook e Sessoes Fotograficas Pet",
    description:
      "Fotolivros artesanais e sessoes fotograficas para eternizar os melhores momentos com seu pet.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Patas, Amor e Memórias",
  description:
    "Fotolivros artesanais e sessões fotográficas para eternizar os melhores momentos com seu pet.",
  url: "https://patasamorememorias.com.br",
  telephone: "+55-11-97105-3445",
  email: "patas.amor.risadas@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Claudio Soares, 72",
    addressLocality: "Pinheiros",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  image: "https://patasamorememorias.com.br/images/hero-family-dog.jpg",
  priceRange: "$$",
  openingHours: "Mo-Fr 09:00-18:00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
