/* ─────────── Types ─────────── */

export interface SessionData {
  slug: "pocket" | "estudio" | "completa";
  badge: string;
  title: string;
  description: string;
  price: number;
  installments: number;
  pixPrice: number;
  image: string;
  duration: string;
  photosCount: string;
  location: string;
  features: string[];
  highlight?: boolean;
}

/* ─────────── All Sessions Data ─────────── */

export const SESSIONS: SessionData[] = [
  {
    slug: "pocket",
    badge: "Profissional",
    title: "Experiência Pocket",
    description:
      "Sessão rápida e acessível no estúdio para capturar momentos especiais do seu pet com iluminação profissional.",
    price: 900,
    installments: 10,
    pixPrice: 855,
    image: "/images/session-pocket.jpg",
    duration: "1 hora",
    photosCount: "5 fotos editadas",
    location: "Pinheiros, SP",
    features: [
      "5 fotos editadas em alta resolução para download",
      "1 hora de sessão em Estúdio",
      "Fotos com até 2 pessoas + pet",
      "Iluminação profissional",
    ],
  },
  {
    slug: "estudio",
    badge: "Profissional",
    title: "Sessão Estúdio",
    description:
      "Sessão completa no estúdio com cenários temáticos exclusivos, iluminação profissional e muita diversão para capturar a essência do seu pet.",
    price: 3700,
    installments: 10,
    pixPrice: 3515,
    image: "/images/session-estudio.jpg",
    duration: "3 horas",
    photosCount: "20 fotos editadas",
    location: "Pinheiros, SP",
    features: [
      "20 fotos editadas em alta resolução para download",
      "3 horas de sessão em Estúdio",
      "Fotos com até 3 pessoas + pet",
      "Iluminação profissional",
      "Figurinos e acessórios disponíveis",
      "Dogbook incluso",
    ],
  },
  {
    slug: "completa",
    badge: "Profissional",
    title: "Sessão Ar-livre + Estúdio",
    description:
      "O melhor dos dois mundos! Combine fotos no estúdio em Pinheiros - SP, com sessão ao ar-livre em parques ou praças de São Paulo para momentos ainda mais especiais.",
    price: 4900,
    installments: 10,
    pixPrice: 4655,
    image: "/images/session-completa.jpg",
    duration: "5 horas",
    photosCount: "40 fotos editadas",
    location: "Pinheiros, SP",
    features: [
      "40 fotos editadas em alta resolução para download",
      "5 horas de sessão (3h estúdio + 2h externo)",
      "Sessão ao ar-livre - Parque do Povo em São Paulo",
      "Fotos com até 5 pessoas + pet",
      "Maquiagem e cabelo (até 2 pessoas)",
      "Figurinos e acessórios disponíveis",
      "Dogbook incluso",
    ],
    highlight: true,
  },
];
