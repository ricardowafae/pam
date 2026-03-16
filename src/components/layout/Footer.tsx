import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  institucional: [
    { label: "Sobre", href: "/#sobre" },
    { label: "FAQ", href: "/faq" },
    { label: "Depoimentos", href: "/depoimentos" },
    { label: "Termos de Uso", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
  ],
  produtos: [
    { label: "Dogbook", href: "/dogbook" },
    { label: "Sessão Pocket", href: "/sessoes/pocket" },
    { label: "Sessão Estúdio", href: "/sessoes/estudio" },
    { label: "Sessão Completa", href: "/sessoes/completa" },
    { label: "Vale Presente", href: "/vale-presente" },
  ],
  parceiros: [
    { label: "Área do Fotógrafo", href: "/parceiros/login" },
    { label: "Área do Influenciador", href: "/parceiros/login" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="Patas, Amor e Memórias"
                width={280}
                height={78}
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Fotolivros artesanais e sessões fotográficas para eternizar os
              melhores momentos com seu pet.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/patasamorememorias"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary/10 p-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              {/* TikTok - em breve */}
              <span
                className="rounded-full bg-primary/10 p-2 text-primary/40 cursor-default"
                aria-label="TikTok (em breve)"
                title="Em breve"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.81a4.84 4.84 0 01-1-.12z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">
              Institucional
            </h3>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">
              Produtos
            </h3>
            <ul className="space-y-2">
              {footerLinks.produtos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato + Parceiros */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">
                Contato
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href="mailto:patasamorememorias@gmail.com" className="hover:text-primary">
                    patasamorememorias@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href="tel:+5511936207631" className="hover:text-primary">
                    (11) 93620-7631
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>R. Claudio Soares, 72 - Pinheiros, São Paulo</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">
                Parceiros
              </h3>
              <ul className="space-y-2">
                {footerLinks.parceiros.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Patas, Amor e Memórias. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
