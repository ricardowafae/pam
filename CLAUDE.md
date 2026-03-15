# Patas, Amor e Memorias - Projeto de Refatoracao

## O Que e o Projeto

Site de e-commerce para a marca "Patas, Amor e Memorias" - pet photography e Dogbook (fotolivros artesanais para pets). Localizado em Pinheiros, Sao Paulo. Servicos: venda de Dogbooks tematicos (Verao, Inverno, Natal, Ano Novo, Caoniversario), sessoes fotograficas pet (Pocket, Estudio, Completa), programa Give Back (10% doado a abrigos).

## Stack Atual (Lovable)

| Camada       | Tecnologia                        |
|--------------|-----------------------------------|
| Frontend     | React 18 + TypeScript + Tailwind CSS |
| Build        | Vite                              |
| Backend/DB   | Supabase (PostgreSQL)             |
| Auth         | Supabase Auth                     |
| Storage      | Supabase Storage                  |
| Pagamentos   | Stripe                            |
| Hosting      | Lovable Cloud                     |
| Chat Widget  | Flock (widget WhatsApp)           |

## Problemas Criticos Encontrados

### 1. SEO - GRAVE: Canonical URL Errada
- **Canonical aponta para dominio ERRADO**: `https://patasamorerisos.com.br/` (dominio antigo)
- **Dominio real**: `https://patasamorememorias.com.br`
- **OG URL tambem errada**: aponta para o dominio antigo
- **Impacto**: Google indexa o dominio errado, dividindo autoridade SEO

### 2. SEO - GRAVE: SPA sem SSR (Server-Side Rendering)
- O site e uma SPA (Single Page Application) React pura
- Crawlers do Google recebem HTML vazio com apenas `<div id="root">`
- Todo conteudo e renderizado via JavaScript no cliente
- **Impacto**: Conteudo invisivel para a maioria dos crawlers, indexacao precaria

### 3. SEO - Rota `/website/home` Desnecessaria
- URL principal: `/website/home` em vez de `/`
- URLs de produto: `/website/produto/dogbook`
- **Impacto**: URLs longas e nao-semanticas prejudicam ranking

### 4. SEO - Sem Sitemap
- Nenhum sitemap.xml detectado
- Sem link para sitemap no HTML

### 5. Social Media - Integracao Minima
- Apenas icone do Instagram no footer (sem link para TikTok)
- Sem Open Graph otimizado para compartilhamento social
- Sem meta tags do TikTok/Pinterest
- Sem feed do Instagram embutido
- Sem botao de compartilhamento em produtos

### 6. Performance
- Bundle JS unico (`index-cqD3huN1.js`) - sem code splitting
- Apenas 1 arquivo CSS monolitico
- Imagens sem lazy loading nativo (0 de 21 usam loading="lazy")

## Avaliacao da Escolha Tecnologica

### O que o Lovable fez bem
- **React + TypeScript**: Boa base, ecosistema maduro
- **Tailwind CSS**: Excelente para design system e responsividade
- **Supabase**: Backend serverless adequado para o porte do projeto
- **Stripe**: Melhor opcao para pagamentos internacionais

### O que NAO foi a escolha mais assertiva
- **SPA pura para site de e-commerce**: E a pior escolha para SEO. Sites de e-commerce dependem de busca organica. React SPA sem SSR e invisivel para Google na maioria dos casos
- **Lovable Cloud hosting**: Sem controle sobre headers, redirects, server-side rendering
- **Roteamento client-side apenas**: Sem pre-rendering, sem meta tags dinamicas por pagina
- **Sem Next.js ou Remix**: O Lovable gera Vite puro, que nao suporta SSR nativamente

### Recomendacao: Migrar para Next.js
| Criterio           | Vite SPA (atual) | Next.js (recomendado) |
|--------------------|-------------------|-----------------------|
| SSR/SSG            | Nao               | Sim (nativo)          |
| SEO                | Pessimo           | Excelente             |
| Meta tags dinamicas| Nao               | Sim (per-page)        |
| Sitemap automatico | Nao               | Sim (plugin)          |
| Image optimization | Nao               | next/image            |
| Code splitting     | Manual            | Automatico            |
| Deploy             | Lovable Cloud     | Vercel (gratis)       |
| React compativel   | -                 | 100% compativel       |

## Estrutura de Pastas Recomendada (Next.js App Router)

```
PAM_Claude/
├── CLAUDE.md
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raiz (navbar, footer, metadata global)
│   │   ├── page.tsx                # Home (/)
│   │   ├── dogbook/
│   │   │   └── page.tsx            # /dogbook
│   │   ├── sessoes/
│   │   │   └── page.tsx            # /sessoes
│   │   ├── depoimentos/
│   │   │   └── page.tsx            # /depoimentos
│   │   ├── faq/
│   │   │   └── page.tsx            # /faq
│   │   ├── vale-presente/
│   │   │   └── page.tsx            # /vale-presente
│   │   ├── termos/
│   │   │   └── page.tsx            # /termos
│   │   ├── privacidade/
│   │   │   └── page.tsx            # /privacidade
│   │   └── admin/
│   │       └── page.tsx            # /admin (client-side, protegido)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── WhatsAppWidget.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── DogbookSection.tsx
│   │   │   ├── ThemesCarousel.tsx
│   │   │   ├── PawPrintSection.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── PhotographySection.tsx
│   │   │   ├── GiveBackSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── FAQSection.tsx
│   │   └── shared/
│   │       ├── SEOHead.tsx
│   │       └── SocialShare.tsx
│   ├── lib/
│   │   ├── supabase.ts             # Cliente Supabase
│   │   ├── stripe.ts               # Config Stripe
│   │   └── utils.ts
│   ├── hooks/
│   └── types/
└── .env.local                      # NEXT_PUBLIC_SUPABASE_URL, keys, etc.
```

## Secoes do Site Atual (para migrar)

1. **Hero** - CTA principal com "Conhecer o Dogbook" e "Sessoes Fotograficas"
2. **Sobre** - Memoria Afetiva, Arte & Emocao, Give Back
3. **Dogbook** - Fotolivro com temas (Verao, Inverno, Natal, Ano Novo, Caoniversario)
4. **Personalidade Canina** - Secao sobre caracteristicas do pet
5. **Marca da Pegada** - Registro da patinha do pet no livro
6. **Como Funciona** - 3 passos (Compre, Envie fotos, Aprove e receba)
7. **Sessoes Pet** - Fotografo Juliano Lemos, 3 pacotes (Pocket, Estudio, Completa)
8. **Give Back** - 10% doado para abrigos
9. **Depoimentos** - Historias de clientes
10. **FAQ** - Perguntas sobre Dogbook e Sessoes
11. **Footer** - Contato, navegacao, Instagram, WhatsApp

## Plano de Migracao

### Fase 1: Exportar codigo do Lovable via GitHub
- Conectar repo GitHub no Lovable (Settings > GitHub)
- Clonar repo localmente para esta pasta
- Mapear todos os componentes e rotas

### Fase 2: Scaffold Next.js
- Criar projeto Next.js com App Router
- Configurar Tailwind, shadcn/ui, Supabase client, Stripe
- Migrar componentes React (maioria sera copy-paste com ajustes de import)

### Fase 3: SEO
- Corrigir canonical para `patasamorememorias.com.br`
- Metadata API do Next.js para meta tags dinamicas por pagina
- Gerar sitemap.xml automatico
- Implementar robots.txt
- Structured data (JSON-LD) por pagina
- URLs semanticas (/ em vez de /website/home)
- next/image para otimizacao automatica de imagens

### Fase 4: Social Media
- Adicionar link TikTok no footer e Open Graph
- Instagram feed embed na home ou pagina dedicada
- Botoes de compartilhamento em produtos (WhatsApp, Instagram Stories, TikTok)
- Meta tags especificas para cada rede social
- Rich snippets para produtos (preco, disponibilidade)

### Fase 5: Deploy
- Deploy na Vercel (gratis para projetos pessoais)
- Configurar dominio patasamorememorias.com.br
- Configurar variaveis de ambiente (Supabase, Stripe)
- Testar integracao de pagamentos

## Contato / Info do Negocio

- **Email**: patasamorememorias@gmail.com
- **Telefone**: (11) 97105-3445
- **Endereco**: R. Claudio Soares, 72 - Pinheiros, Sao Paulo
- **Instagram**: Presente no footer (icone)
- **WhatsApp**: Widget Flock ativo no site

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Regras do Projeto

- Idioma do codigo: ingles (nomes de variaveis, componentes)
- Idioma do conteudo: portugues brasileiro
- Estilo visual: tons rosa/bege/marrom (palette do Tailwind customizada)
- Fontes: serif para titulos, sans-serif para corpo
- Sempre usar next/image em vez de <img>
- Cada pagina deve ter metadata propria (title, description, OG tags)
- Componentes em PascalCase, arquivos em kebab-case ou PascalCase
