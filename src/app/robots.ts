import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/portalcliente", "/parceiros", "/login", "/cadastro"],
      },
    ],
    sitemap: "https://patasamorememorias.com.br/sitemap.xml",
  };
}
