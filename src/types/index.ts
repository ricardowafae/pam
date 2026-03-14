/* ═══════════════════════════════════════════════════════════════════════════
   Patas, Amor e Memorias — TypeScript Types (mirrors Supabase schema)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Auth & Roles ──
export type UserRole = "admin" | "equipe" | "cliente" | "fotografo" | "influenciador";

// ── Profile (extends auth.users) ──
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Customers ──
export interface Customer {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations (populated via joins)
  pets?: Pet[];
}

// ── Pets ──
export interface Pet {
  id: string;
  customer_id: string;
  name: string;
  breed: string | null;
  birthday: string | null;
  species: string;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

// ── Products ──
export type ProductCategory = "dogbook" | "sessao" | "vale_presente";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string | null;
  base_price: number;
  max_installments: number;
  pix_discount_pct: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── Volume Discounts ──
export interface VolumeDiscount {
  id: string;
  product_id: string;
  min_qty: number;
  max_qty: number | null;
  discount_pct: number;
  active: boolean;
  created_at: string;
}

// ── Cart (client-side only, not in DB) ──
export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Orders ──
export type OrderStatus = "pendente" | "pago" | "em_producao" | "enviado" | "entregue" | "cancelado";
export type PaymentMethod = "cartao" | "pix" | "boleto";
export type PaymentStatus = "pendente" | "processando" | "pago" | "falhou" | "reembolsado" | "expirado";

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  stripe_payment_id: string | null;
  stripe_checkout_id: string | null;
  coupon_id: string | null;
  influencer_id: string | null;
  tracking_code: string | null;
  nf_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  // Relations
  customer?: Customer;
  order_items?: OrderItem[];
}

// ── Order Items ──
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Relations
  product?: Product;
}

// ── Dogbooks ──
export type DogbookTheme = "verao" | "inverno" | "natal" | "ano_novo" | "caoniversario";
export type DogbookStage =
  | "aguardando_pagamento"
  | "aguardando_fotos"
  | "em_criacao"
  | "em_aprovacao"
  | "em_producao"
  | "enviado"
  | "concluido";

export interface Dogbook {
  id: string;
  order_item_id: string;
  order_id: string;
  customer_id: string;
  pet_id: string | null;
  sub_number: string;
  theme: DogbookTheme;
  stage: DogbookStage;
  total_pages: number;
  photos_uploaded: number;
  photos_max: number;
  deadline_creative: string | null;
  preview_ready: boolean;
  approved_at: string | null;
  nf_number: string | null;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  pet?: Pet;
  order?: Order;
}

// ── Dogbook Personality Traits ──
export interface DogbookTrait {
  id: string;
  dogbook_id: string;
  trait_name: string;
  rating: number;
  created_at: string;
}

// ── Photographers ──
export type PartnerStatus = "ativo" | "inativo";

export interface Photographer {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  portfolio_url: string | null;
  bio: string | null;
  status: PartnerStatus;
  price_pocket: number | null;
  price_estudio: number | null;
  price_completa: number | null;
  commission_pct: number;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  bank: string | null;
  agency: string | null;
  account: string | null;
  pix_key: string | null;
  work_period_start: string | null;
  work_period_end: string | null;
  available_monday: boolean;
  available_tuesday: boolean;
  available_wednesday: boolean;
  available_thursday: boolean;
  available_friday: boolean;
  available_saturday: boolean;
  available_sunday: boolean;
  created_at: string;
  updated_at: string;
}

// ── Photo Sessions ──
export type SessionType = "pocket" | "estudio" | "completa";
export type SessionStatus =
  | "aguardando_pagamento"
  | "agendada"
  | "confirmada"
  | "realizada"
  | "em_edicao"
  | "entregue"
  | "cancelada";

export interface PhotoSession {
  id: string;
  session_number: string;
  order_item_id: string | null;
  order_id: string | null;
  customer_id: string;
  photographer_id: string | null;
  pet_id: string | null;
  session_type: SessionType;
  status: SessionStatus;
  payment_status: PaymentStatus;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  location: string | null;
  total_photos: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  photographer?: Photographer;
  pet?: Pet;
}

// ── Influencers ──
export interface Influencer {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  slug: string;
  bio: string | null;
  status: PartnerStatus;
  commission_per_sale: number;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  bank: string | null;
  agency: string | null;
  account: string | null;
  pix_key: string | null;
  created_at: string;
  updated_at: string;
}

// ── Coupons ──
export type CouponType = "percentual" | "fixo";

export interface Coupon {
  id: string;
  code: string;
  coupon_type: CouponType;
  discount_value: number;
  influencer_id: string | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  single_use_per_customer: boolean;
  stackable: boolean;
  created_at: string;
  // Relations
  influencer?: Influencer;
}

// ── Commissions ──
export type CommissionStatus = "pendente" | "processando" | "pago";

export interface Commission {
  id: string;
  photographer_id: string | null;
  influencer_id: string | null;
  order_id: string | null;
  session_id: string | null;
  total_sale_value: number;
  commission_pct: number;
  commission_amount: number;
  status: CommissionStatus;
  paid_at: string | null;
  receipt_url: string | null;
  period_month: number;
  period_year: number;
  created_at: string;
}

// ── Gallery Photos ──
export type PermissionStatus = "pendente" | "solicitada" | "aprovada" | "recusada";

export interface GalleryPhoto {
  id: string;
  customer_id: string;
  dogbook_id: string | null;
  storage_path: string;
  url: string;
  file_name: string | null;
  file_size: number | null;
  pet_name: string | null;
  favorited: boolean;
  permission_status: PermissionStatus;
  permission_requested_at: string | null;
  uploaded_at: string;
  // Relations
  customer?: Customer;
}

// ── Team Members ──
export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  perm_dashboard: boolean;
  perm_analytics: boolean;
  perm_clientes: boolean;
  perm_sessoes: boolean;
  perm_pedidos: boolean;
  perm_galeria: boolean;
  perm_influenciadores: boolean;
  perm_fotografos: boolean;
  perm_precos: boolean;
  perm_equipe: boolean;
  perm_comunicacao: boolean;
  perm_conversao: boolean;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  work_start_date: string | null;
  work_end_date: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  bank: string | null;
  agency: string | null;
  account: string | null;
  pix_key: string | null;
  created_at: string;
  updated_at: string;
}

// ── Gift Cards ──
export interface GiftCard {
  id: string;
  code: string;
  purchaser_name: string;
  purchaser_email: string;
  recipient_name: string | null;
  recipient_email: string | null;
  amount: number;
  balance: number;
  message: string | null;
  order_id: string | null;
  redeemed_by: string | null;
  redeemed_at: string | null;
  expires_at: string;
  active: boolean;
  created_at: string;
}

// ── Leads ──
export type LeadStatus =
  | "visitante"
  | "carrinho"
  | "checkout_iniciado"
  | "pagamento_falhou"
  | "pix_expirado"
  | "boleto_pendente"
  | "pix_pendente"
  | "boleto_compensado"
  | "pix_compensado"
  | "convertido"
  | "resgatado";

export interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  source: string | null;
  influencer_id: string | null;
  product_interest: string | null;
  cart_value: number | null;
  recovery_link: string | null;
  coupon_sent: boolean;
  coupon_id: string | null;
  recovered: boolean;
  sessions_count: number;
  pages_viewed: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  // Relations
  influencer?: Influencer;
  coupon?: Coupon;
}

// ── Messages ──
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  body: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

// ── Campaigns ──
export type MessageChannel = "email" | "whatsapp";
export type CampaignStatus = "rascunho" | "agendada" | "enviada" | "cancelada";

export interface Campaign {
  id: string;
  name: string;
  channel: MessageChannel;
  status: CampaignStatus;
  subject: string | null;
  body: string;
  audience_filter: Record<string, unknown> | null;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
}

// ── Auto Messages ──
export interface AutoMessage {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  channel: MessageChannel;
  template: string;
  active: boolean;
  created_at: string;
}

// ── Message Templates ──
export interface MessageTemplate {
  id: string;
  name: string;
  category: string | null;
  channel: MessageChannel;
  subject: string | null;
  body: string;
  variables: string[];
  created_at: string;
}

// ── Page Views (Analytics) ──
export interface PageView {
  id: string;
  visitor_id: string | null;
  page_path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  session_id: string | null;
  influencer_id: string | null;
  created_at: string;
}
