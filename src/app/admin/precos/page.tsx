"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  CreditCard,
  QrCode,
  Package,
  Percent,
  Tags,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Gift,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Send,
  Fingerprint,
  Layers,
  Ban,
} from "lucide-react";

/* ────────────────────── Types ────────────────────── */

interface GiftCouponOption {
  value: string;
  active: boolean;
}

interface GiftVolumeDiscount {
  minQty: string;
  discountPct: string;
}

interface GiftCardConfig {
  id: number;
  productName: string;
  active: boolean;
  has100PercentOff: boolean;
  couponOptions: GiftCouponOption[];
  volumeDiscounts: [GiftVolumeDiscount, GiftVolumeDiscount, GiftVolumeDiscount, GiftVolumeDiscount];
  validity: string;
}

interface DiscountTier {
  minQty: string;
  discountPct: string;
}

interface ProductConfig {
  id: number;
  name: string;
  price: string;
  active: boolean;
  maxInstallments: string;
  pixDiscount: string;
  influencerDiscount: string;
  discountTiers: [DiscountTier, DiscountTier, DiscountTier];
}

/* ────────────────────── Helpers ────────────────────── */

function parsePrice(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

/* ────────────────────── Initial Data ────────────────────── */

const initialProducts: ProductConfig[] = [
  {
    id: 1,
    name: "Dogbook",
    price: "490,00",
    active: true,
    maxInstallments: "10",
    pixDiscount: "5",
    influencerDiscount: "10",
    discountTiers: [
      { minQty: "2", discountPct: "5" },
      { minQty: "3", discountPct: "8" },
      { minQty: "4", discountPct: "10" },
    ],
  },
  {
    id: 2,
    name: "Sessão Pocket",
    price: "900,00",
    active: true,
    maxInstallments: "10",
    pixDiscount: "5",
    influencerDiscount: "10",
    discountTiers: [
      { minQty: "2", discountPct: "5" },
      { minQty: "3", discountPct: "8" },
      { minQty: "4", discountPct: "10" },
    ],
  },
  {
    id: 3,
    name: "Sessão Estúdio",
    price: "3.700,00",
    active: true,
    maxInstallments: "10",
    pixDiscount: "5",
    influencerDiscount: "10",
    discountTiers: [
      { minQty: "2", discountPct: "5" },
      { minQty: "3", discountPct: "8" },
      { minQty: "4", discountPct: "10" },
    ],
  },
  {
    id: 4,
    name: "Sessão Completa",
    price: "4.900,00",
    active: true,
    maxInstallments: "10",
    pixDiscount: "5",
    influencerDiscount: "10",
    discountTiers: [
      { minQty: "2", discountPct: "5" },
      { minQty: "3", discountPct: "8" },
      { minQty: "4", discountPct: "10" },
    ],
  },
];

const initialGiftCards: GiftCardConfig[] = [
  {
    id: 1,
    productName: "Dogbook",
    active: true,
    has100PercentOff: true,
    couponOptions: [
      { value: "50,00", active: true },
      { value: "100,00", active: true },
      { value: "200,00", active: true },
    ],
    volumeDiscounts: [
      { minQty: "5", discountPct: "10" },
      { minQty: "10", discountPct: "15" },
      { minQty: "25", discountPct: "17.5" },
      { minQty: "50", discountPct: "20" },
    ],
    validity: "360",
  },
  {
    id: 2,
    productName: "Sessão Pocket",
    active: true,
    has100PercentOff: true,
    couponOptions: [
      { value: "100,00", active: true },
      { value: "200,00", active: true },
      { value: "300,00", active: true },
    ],
    volumeDiscounts: [
      { minQty: "5", discountPct: "10" },
      { minQty: "10", discountPct: "15" },
      { minQty: "25", discountPct: "17.5" },
      { minQty: "50", discountPct: "20" },
    ],
    validity: "360",
  },
  {
    id: 3,
    productName: "Sessão Estúdio",
    active: true,
    has100PercentOff: true,
    couponOptions: [
      { value: "200,00", active: true },
      { value: "500,00", active: true },
      { value: "900,00", active: true },
    ],
    volumeDiscounts: [
      { minQty: "5", discountPct: "10" },
      { minQty: "10", discountPct: "15" },
      { minQty: "25", discountPct: "20" },
      { minQty: "50", discountPct: "25" },
    ],
    validity: "360",
  },
  {
    id: 4,
    productName: "Sessão Completa",
    active: true,
    has100PercentOff: true,
    couponOptions: [
      { value: "400,00", active: true },
      { value: "800,00", active: true },
      { value: "1.200,00", active: true },
    ],
    volumeDiscounts: [
      { minQty: "5", discountPct: "10" },
      { minQty: "10", discountPct: "15" },
      { minQty: "25", discountPct: "20" },
      { minQty: "50", discountPct: "25" },
    ],
    validity: "360",
  },
];

/* ────────────────────── Page ────────────────────── */

export default function PrecosPage() {
  const [products, setProducts] =
    useState<ProductConfig[]>(initialProducts);
  const [giftCards, setGiftCards] =
    useState<GiftCardConfig[]>(initialGiftCards);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [expandedGiftIds, setExpandedGiftIds] = useState<Set<number>>(
    new Set()
  );

  const toggleGiftExpanded = (id: number) => {
    setExpandedGiftIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateGiftCard = (
    id: number,
    field: keyof GiftCardConfig,
    value: string | boolean
  ) => {
    setGiftCards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const updateGiftCoupon = (
    giftId: number,
    couponIdx: number,
    field: keyof GiftCouponOption,
    value: string | boolean
  ) => {
    setGiftCards((prev) =>
      prev.map((g) => {
        if (g.id !== giftId) return g;
        const newOptions = [...g.couponOptions];
        newOptions[couponIdx] = { ...newOptions[couponIdx], [field]: value };
        return { ...g, couponOptions: newOptions };
      })
    );
  };

  const addGiftCoupon = (giftId: number) => {
    setGiftCards((prev) =>
      prev.map((g) => {
        if (g.id !== giftId) return g;
        return {
          ...g,
          couponOptions: [...g.couponOptions, { value: "", active: true }],
        };
      })
    );
  };

  const removeGiftCoupon = (giftId: number, couponIdx: number) => {
    setGiftCards((prev) =>
      prev.map((g) => {
        if (g.id !== giftId) return g;
        return {
          ...g,
          couponOptions: g.couponOptions.filter((_, i) => i !== couponIdx),
        };
      })
    );
  };

  const updateGiftVolume = (
    giftId: number,
    tierIdx: number,
    field: keyof GiftVolumeDiscount,
    value: string
  ) => {
    setGiftCards((prev) =>
      prev.map((g) => {
        if (g.id !== giftId) return g;
        const newVols = [...g.volumeDiscounts] as [
          GiftVolumeDiscount,
          GiftVolumeDiscount,
          GiftVolumeDiscount,
          GiftVolumeDiscount,
        ];
        newVols[tierIdx] = { ...newVols[tierIdx], [field]: value };
        return { ...g, volumeDiscounts: newVols };
      })
    );
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateProduct = (
    id: number,
    field: keyof ProductConfig,
    value: string | boolean
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const updateTier = (
    productId: number,
    tierIndex: number,
    field: keyof DiscountTier,
    value: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newTiers = [...p.discountTiers] as [
          DiscountTier,
          DiscountTier,
          DiscountTier,
        ];
        newTiers[tierIndex] = { ...newTiers[tierIndex], [field]: value };
        return { ...p, discountTiers: newTiers };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Produtos e Serviços
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie preços, condições de pagamento, descontos e vales
        </p>
      </div>

      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">Produtos e Serviços</TabsTrigger>
          <TabsTrigger value="cupons-resgate">Cupons de Resgate</TabsTrigger>
          <TabsTrigger value="vale-presentes">Vale Presentes</TabsTrigger>
        </TabsList>

        {/* ════════════════════ Produtos e Serviços Tab ════════════════════ */}
        <TabsContent value="produtos">
          <div className="mt-4 space-y-4">
            {products.map((product) => {
              const isExpanded = expandedIds.has(product.id);
              const basePrice = parsePrice(product.price);
              const installmentValue =
                basePrice / (parseInt(product.maxInstallments) || 1);
              const pixValue =
                basePrice * (1 - parseFloat(product.pixDiscount || "0") / 100);
              const activeTiers = product.discountTiers.filter(
                (t) => t.minQty && t.discountPct
              );

              return (
                <Card key={product.id}>
                  {/* ─── Collapsed summary (always visible) ─── */}
                  <CardHeader
                    className="cursor-pointer select-none space-y-0 py-4 transition-colors hover:bg-muted/30"
                    onClick={() => toggleExpanded(product.id)}
                  >
                    {/* Top row: name + chevron */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="size-5 text-primary/60" />
                        <CardTitle className="font-serif text-lg text-foreground">
                          {product.name}
                        </CardTitle>
                        <Badge
                          variant={product.active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(product.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </Button>
                    </div>

                    {/* Summary row when collapsed — full width grid */}
                    {!isExpanded && (
                      <>
                        {/* Desktop: horizontal grid */}
                        <div className="mt-3 hidden grid-cols-5 gap-4 border-t border-border pt-3 sm:grid">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Preço
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-foreground">
                              R$ {product.price}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Cartão
                            </p>
                            <p className="mt-0.5 text-sm text-foreground">
                              {product.maxInstallments}x de R${" "}
                              {formatBRL(installmentValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              PIX
                            </p>
                            <p className="mt-0.5 text-sm text-green-700">
                              R$ {formatBRL(pixValue)}{" "}
                              <span className="text-[10px] text-muted-foreground">
                                (-{product.pixDiscount}%)
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Influenciador
                            </p>
                            <p className="mt-0.5 text-sm text-purple-700">
                              -{product.influencerDiscount}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Desc. Quantidade
                            </p>
                            <p className="mt-0.5 text-sm text-foreground">
                              {activeTiers.length > 0
                                ? activeTiers
                                    .map(
                                      (t) => `${t.minQty}+ → ${t.discountPct}%`
                                    )
                                    .join("  ·  ")
                                : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Mobile: 2-column grid */}
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-3 sm:hidden">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Preço
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              R$ {product.price}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Cartão
                            </p>
                            <p className="text-sm text-foreground">
                              {product.maxInstallments}x R${" "}
                              {formatBRL(installmentValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              PIX
                            </p>
                            <p className="text-sm text-green-700">
                              R$ {formatBRL(pixValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Influenciador
                            </p>
                            <p className="text-sm text-purple-700">
                              -{product.influencerDiscount}%
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardHeader>

                  {/* ─── Expanded details ─── */}
                  {isExpanded && (
                    <CardContent className="space-y-6 pt-0">
                      {/* Active toggle */}
                      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-primary/60" />
                          <span className="text-sm font-medium text-foreground">
                            Produto {product.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <Switch
                          checked={product.active}
                          onCheckedChange={(checked) =>
                            updateProduct(product.id, "active", !!checked)
                          }
                        />
                      </div>

                      {/* ─── (i) Preço ─── */}
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Tags className="size-4 text-primary/60" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Preço
                          </h3>
                        </div>
                        <div className="max-w-xs">
                          <Label htmlFor={`price-${product.id}`}>
                            Preço Base (R$)
                          </Label>
                          <Input
                            id={`price-${product.id}`}
                            value={product.price}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "price",
                                e.target.value
                              )
                            }
                            className="mt-1 w-48"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* ─── (ii) Condições de Pagamento ─── */}
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <CreditCard className="size-4 text-primary/60" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Condições de Pagamento
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {/* Cartão */}
                          <div className="rounded-lg border border-border p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <CreditCard className="size-4 text-blue-500" />
                              <span className="text-sm font-medium text-foreground">
                                Cartão de Crédito
                              </span>
                            </div>
                            <Label
                              htmlFor={`installments-${product.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Parcelamento máximo
                            </Label>
                            <div className="mt-1 flex items-center gap-2">
                              <Input
                                id={`installments-${product.id}`}
                                type="number"
                                min="1"
                                max="24"
                                value={product.maxInstallments}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "maxInstallments",
                                    e.target.value
                                  )
                                }
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">
                                x sem juros
                              </span>
                            </div>
                            {basePrice > 0 && product.maxInstallments && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Até {product.maxInstallments}x de R${" "}
                                {formatBRL(installmentValue)}
                              </p>
                            )}
                          </div>

                          {/* PIX */}
                          <div className="rounded-lg border border-border p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <QrCode className="size-4 text-green-600" />
                              <span className="text-sm font-medium text-foreground">
                                PIX
                              </span>
                            </div>
                            <Label
                              htmlFor={`pix-${product.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Desconto PIX (%)
                            </Label>
                            <div className="mt-1 flex items-center gap-2">
                              <Input
                                id={`pix-${product.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={product.pixDiscount}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "pixDiscount",
                                    e.target.value
                                  )
                                }
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">
                                % de desconto
                              </span>
                            </div>
                            {basePrice > 0 && product.pixDiscount && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Preço PIX: R$ {formatBRL(pixValue)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* ─── Desconto Influenciador ─── */}
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Megaphone className="size-4 text-purple-500" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Desconto Influenciador
                          </h3>
                        </div>
                        <p className="mb-3 text-xs text-muted-foreground">
                          Desconto padrão aplicado automaticamente para compras
                          realizadas através do link de qualquer influenciador.
                        </p>
                        <div className="max-w-xs">
                          <Label
                            htmlFor={`influencer-${product.id}`}
                            className="text-xs"
                          >
                            Desconto (%)
                          </Label>
                          <div className="mt-1 flex items-center gap-2">
                            <Input
                              id={`influencer-${product.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={product.influencerDiscount}
                              onChange={(e) =>
                                updateProduct(
                                  product.id,
                                  "influencerDiscount",
                                  e.target.value
                                )
                              }
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">
                              % de desconto
                            </span>
                          </div>
                          {basePrice > 0 && product.influencerDiscount && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Preço via influenciador: R${" "}
                              {formatBRL(
                                basePrice *
                                  (1 -
                                    parseFloat(
                                      product.influencerDiscount || "0"
                                    ) /
                                      100)
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* ─── (iii) Desconto por Quantidade ─── */}
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Percent className="size-4 text-primary/60" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Desconto por Quantidade
                          </h3>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                          Desconto progressivo aplicado automaticamente nas
                          páginas de compra conforme a quantidade adquirida.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {product.discountTiers.map((tier, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-border p-4"
                            >
                              <p className="mb-3 text-xs font-medium text-muted-foreground">
                                Faixa {idx + 1}
                              </p>
                              <div className="space-y-3">
                                <div>
                                  <Label
                                    htmlFor={`qty-${product.id}-${idx}`}
                                    className="text-xs"
                                  >
                                    Quantidade mínima
                                  </Label>
                                  <Input
                                    id={`qty-${product.id}-${idx}`}
                                    type="number"
                                    min="1"
                                    value={tier.minQty}
                                    onChange={(e) =>
                                      updateTier(
                                        product.id,
                                        idx,
                                        "minQty",
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                    placeholder="Ex: 2"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`disc-${product.id}-${idx}`}
                                    className="text-xs"
                                  >
                                    Desconto (%)
                                  </Label>
                                  <Input
                                    id={`disc-${product.id}-${idx}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tier.discountPct}
                                    onChange={(e) =>
                                      updateTier(
                                        product.id,
                                        idx,
                                        "discountPct",
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                    placeholder="Ex: 5"
                                  />
                                </div>
                              </div>
                              {tier.minQty && tier.discountPct && (
                                <p className="mt-2 text-[11px] text-muted-foreground">
                                  A partir de {tier.minQty} un. →{" "}
                                  {tier.discountPct}% off
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Save button per product */}
                      <div className="flex justify-end">
                        <Button>
                          <Save className="size-4" />
                          Salvar {product.name}
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ════════════════════ Cupons de Resgate Tab ════════════════════ */}
        <TabsContent value="cupons-resgate">
          <div className="mt-4 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Cupons Padronizados de Resgate
                </h2>
                <p className="text-sm text-muted-foreground">
                  Cupons utilizados na aba de Conversao para recuperacao de leads e carrinhos abandonados.
                </p>
              </div>
            </div>

            {/* Standard Coupons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Tags className="size-4 text-primary/60" />
                  Cupons de Desconto Fixo
                </CardTitle>
                <CardDescription>
                  Cupons com valor fixo de desconto para acoes de repescagem. Estes cupons aparecem como opcoes na aba Conversao.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Codigo</TableHead>
                      <TableHead>Valor do Desconto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Usos</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-medium">
                          PAM10OFF
                        </code>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-green-600">
                        R$ 10,00 OFF
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          Valor Fixo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-50 text-green-700 text-[10px]">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        23
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Switch defaultChecked />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-medium">
                          PAM20OFF
                        </code>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-green-600">
                        R$ 20,00 OFF
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          Valor Fixo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-50 text-green-700 text-[10px]">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        15
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Switch defaultChecked />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-medium">
                          PAM50OFF
                        </code>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-green-600">
                        R$ 50,00 OFF
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          Valor Fixo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-50 text-green-700 text-[10px]">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        8
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Switch defaultChecked />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Influencer-linked coupons info */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
                  <Megaphone className="size-4" />
                  Cupons Vinculados a Influenciadores
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 space-y-2">
                <p>
                  Quando um lead chega por meio de um influenciador, o cupom de resgate e automaticamente vinculado ao slug do influenciador. Exemplo:
                </p>
                <div className="flex flex-wrap gap-2">
                  <code className="rounded bg-white px-2 py-1 text-xs font-mono text-blue-800 border border-blue-200">
                    CAMILAPET10OFF
                  </code>
                  <code className="rounded bg-white px-2 py-1 text-xs font-mono text-blue-800 border border-blue-200">
                    DOGLOVERSSP20OFF
                  </code>
                  <code className="rounded bg-white px-2 py-1 text-xs font-mono text-blue-800 border border-blue-200">
                    PETSTYLE50OFF
                  </code>
                </div>
                <p className="text-xs text-blue-600">
                  O link de retorno enviado ao lead tambem sera o link do influenciador (/p/slug), garantindo que a venda seja atribuida corretamente.
                </p>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuracoes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cupom unico por lead</p>
                    <p className="text-xs text-muted-foreground">
                      Cada lead so pode receber um cupom de resgate
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Validade do cupom</p>
                    <p className="text-xs text-muted-foreground">
                      Dias de validade apos o envio do cupom
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      defaultValue="7"
                      className="h-8 w-16 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">dias</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cumulativo com outros descontos</p>
                    <p className="text-xs text-muted-foreground">
                      Permitir usar cupom junto com desconto PIX ou progressivo
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════ Vale Presentes Tab ════════════════════ */}
        <TabsContent value="vale-presentes">
          <div className="mt-4 space-y-6">
            {/* ─── Regras Gerais ─── */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-foreground">
                  Regras &amp; Informações
                </CardTitle>
                <CardDescription>
                  Regras gerais aplicáveis a todos os vale-presentes vendidos na
                  plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Clock className="mt-0.5 size-5 shrink-0 text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Validade de 360 dias
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Os vale-presentes podem ser utilizados em até 360 dias
                        após a data de aquisição.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Disponível após a confirmação
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Assim que o pagamento for confirmado, os vales ficam
                        disponíveis imediatamente na área do cliente no portal.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Send className="mt-0.5 size-5 shrink-0 text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Presenteie qualquer pessoa
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Basta compartilhar o código exclusivo do vale com a
                        pessoa presenteada.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Fingerprint className="mt-0.5 size-5 shrink-0 text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Código único e seguro
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cada vale possui um código alfanumérico exclusivo.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Layers className="mt-0.5 size-5 shrink-0 text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Uso integral por pedido
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cada vale presente é válido para um único uso e sempre
                        compatível com o produto correspondente.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Ban className="mt-0.5 size-5 shrink-0 text-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Não cumulativo com promoções
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Os vale-presentes não são acumuláveis com cupons de
                        desconto ou promoções vigentes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Catálogo de Vale Presentes por Produto ─── */}
            <div>
              <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
                Catálogo de Vale Presentes
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Configure as opções de cupom de desconto e regras de compra para
                cada produto/serviço.
              </p>

              <div className="space-y-4">
                {giftCards.map((gc) => {
                  const isExpanded = expandedGiftIds.has(gc.id);
                  const activeCoupons = gc.couponOptions.filter(
                    (c) => c.active
                  );

                  return (
                    <Card key={gc.id}>
                      <CardHeader
                        className="cursor-pointer select-none space-y-0 py-4 transition-colors hover:bg-muted/30"
                        onClick={() => toggleGiftExpanded(gc.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Gift className="size-5 text-primary/60" />
                            <CardTitle className="font-serif text-lg text-foreground">
                              {gc.productName}
                            </CardTitle>
                            <Badge
                              variant={gc.active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {gc.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGiftExpanded(gc.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </Button>
                        </div>

                        {/* Summary when collapsed */}
                        {!isExpanded && (
                          <div className="mt-3 grid grid-cols-2 gap-4 border-t border-border pt-3 sm:grid-cols-4">
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Cupons
                              </p>
                              <p className="mt-0.5 text-sm text-foreground">
                                {activeCoupons
                                  .map((c) => `R$ ${c.value}`)
                                  .join(", ")}
                                {gc.has100PercentOff && ", 100% OFF"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Validade
                              </p>
                              <p className="mt-0.5 text-sm text-foreground">
                                {gc.validity} dias
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Desc. Volume
                              </p>
                              <p className="mt-0.5 text-sm text-foreground">
                                {gc.volumeDiscounts
                                  .filter((v) => v.minQty && v.discountPct)
                                  .map(
                                    (v) => `${v.minQty}+ → ${v.discountPct}%`
                                  )
                                  .join("  ·  ")}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="space-y-6 pt-0">
                          {/* Active toggle */}
                          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Gift className="size-4 text-primary/60" />
                              <span className="text-sm font-medium text-foreground">
                                Vale Presente{" "}
                                {gc.active ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                            <Switch
                              checked={gc.active}
                              onCheckedChange={(checked) =>
                                updateGiftCard(gc.id, "active", !!checked)
                              }
                            />
                          </div>

                          {/* Validade */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <Clock className="size-4 text-primary/60" />
                              <h3 className="text-sm font-semibold text-foreground">
                                Validade
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={gc.validity}
                                onChange={(e) =>
                                  updateGiftCard(
                                    gc.id,
                                    "validity",
                                    e.target.value
                                  )
                                }
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">
                                dias após a compra
                              </span>
                            </div>
                          </div>

                          <Separator />

                          {/* Opções de Cupom de Desconto */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <Tags className="size-4 text-primary/60" />
                              <h3 className="text-sm font-semibold text-foreground">
                                Opções de Vale-Presente (Cupons de Desconto)
                              </h3>
                            </div>
                            <p className="mb-4 text-xs text-muted-foreground">
                              Valores disponíveis para compra como cupom de
                              desconto para este produto.
                            </p>

                            <div className="space-y-3">
                              {gc.couponOptions.map((coupon, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                                >
                                  <span className="text-sm font-medium text-foreground">
                                    R$
                                  </span>
                                  <Input
                                    value={coupon.value}
                                    onChange={(e) =>
                                      updateGiftCoupon(
                                        gc.id,
                                        idx,
                                        "value",
                                        e.target.value
                                      )
                                    }
                                    className="w-32"
                                    placeholder="0,00"
                                  />
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    cupom de desconto
                                  </Badge>
                                  <div className="ml-auto flex items-center gap-2">
                                    <Switch
                                      checked={coupon.active}
                                      onCheckedChange={(checked) =>
                                        updateGiftCoupon(
                                          gc.id,
                                          idx,
                                          "active",
                                          !!checked
                                        )
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      onClick={() =>
                                        removeGiftCoupon(gc.id, idx)
                                      }
                                    >
                                      <Trash2 className="size-3.5 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                              {/* 100% OFF option */}
                              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3">
                                <span className="text-sm font-bold text-foreground">
                                  100% OFF
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  desconto máximo
                                </Badge>
                                <div className="ml-auto">
                                  <Switch
                                    checked={gc.has100PercentOff}
                                    onCheckedChange={(checked) =>
                                      updateGiftCard(
                                        gc.id,
                                        "has100PercentOff",
                                        !!checked
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => addGiftCoupon(gc.id)}
                              >
                                <Plus className="size-3.5" />
                                Adicionar Opção de Cupom
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          {/* Descontos por Volume */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <Percent className="size-4 text-primary/60" />
                              <h3 className="text-sm font-semibold text-foreground">
                                Descontos por Quantidade
                              </h3>
                            </div>
                            <p className="mb-4 text-xs text-muted-foreground">
                              Compras em maior quantidade garantem descontos
                              progressivos exclusivos.
                            </p>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {gc.volumeDiscounts.map((vol, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-border p-4"
                                >
                                  <p className="mb-3 text-xs font-medium text-muted-foreground">
                                    Faixa {idx + 1}
                                  </p>
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-xs">
                                        Quantidade mínima
                                      </Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={vol.minQty}
                                        onChange={(e) =>
                                          updateGiftVolume(
                                            gc.id,
                                            idx,
                                            "minQty",
                                            e.target.value
                                          )
                                        }
                                        className="mt-1"
                                        placeholder="Ex: 5"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">
                                        Desconto (%)
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={vol.discountPct}
                                        onChange={(e) =>
                                          updateGiftVolume(
                                            gc.id,
                                            idx,
                                            "discountPct",
                                            e.target.value
                                          )
                                        }
                                        className="mt-1"
                                        placeholder="Ex: 10"
                                      />
                                    </div>
                                  </div>
                                  {vol.minQty && vol.discountPct && (
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                      {vol.minQty}+ unid. → {vol.discountPct}%
                                      OFF
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Save */}
                          <div className="flex justify-end">
                            <Button>
                              <Save className="size-4" />
                              Salvar {gc.productName}
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
