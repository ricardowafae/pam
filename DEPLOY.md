# Deploy — Patas, Amor e Memorias

Guia completo para colocar o site no ar.

## Pre-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com) (gratis)
- Conta no [Supabase](https://supabase.com) (projeto ja existe: `ozyvrubofvkrhgyrwnot`)
- Conta no [Stripe](https://stripe.com)
- Acesso ao DNS do dominio `patasamorememorias.com.br`

---

## 1. Supabase — Banco de Dados

### 1.1 Executar Migration

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/ozyvrubofvkrhgyrwnot
2. Va em **SQL Editor**
3. Cole o conteudo de `supabase/migrations/00001_initial_schema.sql`
4. Clique em **Run**

> O script cria todas as 25 tabelas, enums, triggers, RLS policies, storage buckets, e seeds com produtos e cupons iniciais.

### 1.2 Verificar Tabelas

Apos executar, verifique em **Table Editor** que as seguintes tabelas foram criadas:
- `profiles`, `customers`, `pets`, `products`, `volume_discounts`
- `orders`, `order_items`, `dogbooks`, `dogbook_traits`
- `photographers`, `photo_sessions`
- `influencers`, `coupons`, `coupon_usages`, `commissions`
- `gallery_photos`, `team_members`, `gift_cards`
- `leads`, `messages`
- `campaigns`, `auto_messages`, `message_templates`
- `page_views`

### 1.3 Configurar Storage

Os buckets sao criados automaticamente pelo migration. Verifique em **Storage**:
- `customer-photos` (privado)
- `dogbook-previews` (privado)
- `product-images` (publico)
- `team-avatars` (privado)
- `campaign-assets` (privado)

### 1.4 Criar Usuario Admin

1. Va em **Authentication > Users > Add User**
2. Email: `patasamorememorias@gmail.com`
3. Password: defina uma senha forte
4. Em **User Metadata**, adicione: `{"role": "admin", "full_name": "Admin PAM"}`
5. Confirme — o trigger automatico criara o registro na tabela `profiles`

---

## 2. Stripe — Pagamentos

### 2.1 Criar Conta Stripe

1. Acesse https://dashboard.stripe.com
2. Complete a verificacao da conta (dados bancarios, CNPJ)
3. Ative o modo **Test** primeiro para testar

### 2.2 Obter Chaves

1. Va em **Developers > API Keys**
2. Copie:
   - **Publishable key** (`pk_test_...` ou `pk_live_...`)
   - **Secret key** (`sk_test_...` ou `sk_live_...`)

### 2.3 Criar Webhook

1. Va em **Developers > Webhooks > Add Endpoint**
2. URL: `https://patasamorememorias.com.br/api/stripe/webhook`
3. Eventos para ouvir:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copie o **Signing secret** (`whsec_...`)

### 2.4 Configurar Parcelamento

1. Va em **Settings > Payments > Payment Methods**
2. Ative **Card payments with installments** para Brasil
3. Configure ate 10 parcelas

---

## 3. GitHub — Repositorio

### 3.1 Criar Repo

```bash
cd C:\Users\Ricardo\Desktop\PAM_Claude
git init
git add .
git commit -m "Initial commit: PAM Next.js full project"
git remote add origin https://github.com/SEU_USUARIO/pam-nextjs.git
git push -u origin main
```

### 3.2 .gitignore

Confirme que `.env.local` esta no `.gitignore` (ja deve estar).

---

## 4. Vercel — Deploy

### 4.1 Importar Projeto

1. Acesse https://vercel.com/new
2. Importe o repositorio do GitHub
3. Framework: **Next.js** (detectado automaticamente)
4. Build Command: `npm run build`
5. Output: `.next`

### 4.2 Variaveis de Ambiente

Adicione na Vercel (Settings > Environment Variables):

| Variavel | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ozyvrubofvkrhgyrwnot.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (copiar do .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | (copiar do .env.local) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (da conta Stripe) |
| `STRIPE_SECRET_KEY` | (da conta Stripe) |
| `STRIPE_WEBHOOK_SECRET` | (do webhook criado) |
| `NEXT_PUBLIC_SITE_URL` | `https://patasamorememorias.com.br` |

### 4.3 Deploy

Clique em **Deploy**. A Vercel compila e publica automaticamente.

---

## 5. Dominio — DNS

### 5.1 Adicionar Dominio na Vercel

1. Na Vercel, va em **Settings > Domains**
2. Adicione: `patasamorememorias.com.br`
3. Adicione tambem: `www.patasamorememorias.com.br`

### 5.2 Configurar DNS

No painel do registrador de dominio (Registro.br, GoDaddy, Cloudflare, etc.):

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

> Se usar Cloudflare, desative o proxy (nuvem cinza) para SSL funcionar com Vercel.

### 5.3 SSL

A Vercel configura SSL automaticamente apos o DNS propagar (ate 48h, normalmente minutos).

---

## 6. Integracoes Externas (Pos-Deploy)

### 6.1 WhatsApp Business API

Opcoes:
- **Z-API** (brasileiro, mais simples): https://z-api.io
- **Twilio** (global, mais robusto): https://twilio.com

Configuracao:
1. Criar conta e obter credenciais
2. Adicionar variaveis de ambiente na Vercel:
   - `WHATSAPP_API_URL`
   - `WHATSAPP_API_TOKEN`
3. Implementar envio via Supabase Edge Functions

### 6.2 Email Transacional

Opcoes:
- **Resend** (moderno, otimo DX): https://resend.com
- **SendGrid** (robusto): https://sendgrid.com

Configuracao:
1. Criar conta, verificar dominio
2. Adicionar: `RESEND_API_KEY` ou `SENDGRID_API_KEY`
3. Configurar DNS (SPF, DKIM, DMARC) para entregabilidade

### 6.3 Google Analytics

1. Criar propriedade GA4 em https://analytics.google.com
2. Obter **Measurement ID** (G-XXXXXXXXXX)
3. Adicionar no `src/app/layout.tsx` com Google Tag Manager script

### 6.4 Meta Pixel (Facebook/Instagram Ads)

1. Obter Pixel ID no Meta Business Suite
2. Adicionar script no `src/app/layout.tsx`
3. Configurar eventos: ViewContent, AddToCart, InitiateCheckout, Purchase

---

## 7. Checklist Final

- [ ] Migration SQL executada no Supabase
- [ ] Storage buckets criados
- [ ] Usuario admin criado
- [ ] Chaves Stripe configuradas (test mode primeiro)
- [ ] Webhook Stripe apontando para URL de producao
- [ ] Repositorio no GitHub
- [ ] Projeto na Vercel com variaveis de ambiente
- [ ] Dominio configurado com DNS correto
- [ ] SSL ativo
- [ ] Testar fluxo completo: navegar > carrinho > checkout > pagamento
- [ ] Testar login admin
- [ ] Testar login portal cliente
- [ ] Migrar para Stripe Live mode quando tudo estiver OK
- [ ] Configurar WhatsApp API
- [ ] Configurar email transacional
- [ ] Adicionar analytics

---

## Comandos Uteis

```bash
# Desenvolvimento local
npm run dev

# Build de producao
npm run build

# Verificar erros de lint
npm run lint

# Executar migration no Supabase CLI (opcional)
npx supabase db push
```
