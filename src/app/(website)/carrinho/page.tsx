"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Gift,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCepLookup } from "@/hooks/useCepLookup";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePaymentConfig } from "@/hooks/usePaymentConfig";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

type PersonType = "pf" | "pj";

export default function CarrinhoPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    discountAmount,
    total,
    pixTotal,
    totalItems,
  } = useCart();

  /* --- form state --- */
  const [personType, setPersonType] = useState<PersonType>("pf");
  const [valeCode, setValeCode] = useState("");

  /* --- form fields --- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");

  /* --- address --- */
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  /* --- CEP auto-fill --- */
  const cepLookup = useCepLookup(
    useMemo(
      () => ({
        onSuccess: (data) => {
          setEndereco(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
          if (data.complemento) setComplemento(data.complemento);
        },
      }),
      []
    )
  );

  const handleCepBlur = () => {
    cepLookup.fetchCep(cep);
  };

  /* --- validation --- */
  const [submitted, setSubmitted] = useState(false);

  function fieldStatus(value: string) {
    if (!submitted) return null;
    const filled = value.trim().length > 0;
    return (
      <p className={cn(
        "mt-1 flex items-center gap-1 text-xs font-medium",
        filled ? "text-green-600" : "text-red-600"
      )}>
        {filled ? (
          <>
            <CheckCircle className="size-3" />
            Preenchido
          </>
        ) : (
          "Preenchimento obrigatório"
        )}
      </p>
    );
  }

  function handleApplyVale() {
    if (!valeCode.trim()) {
      toast.error("Digite o código do vale presente.");
      return;
    }
    toast.info("Funcionalidade de vale presente em breve!");
  }

  function handleContinue() {
    setSubmitted(true);

    const requiredPersonal = personType === "pf"
      ? [name, email, phone, cpf]
      : [name, razaoSocial, email, phone, cnpj];
    const requiredAddress = [cep, endereco, numero, bairro, cidade, estado];
    const allRequired = [...requiredPersonal, ...requiredAddress];

    const hasEmpty = allRequired.some((v) => v.trim().length === 0);
    if (hasEmpty) {
      toast.error("Preencha todos os campos obrigatórios.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // All fields filled — navigate to payment page
    router.push("/pagamento");
  }

  /* --- derived values --- */
  const paymentCfg = usePaymentConfig();
  const maxInstallments = paymentCfg.maxInstallments;
  const installmentValue = total / maxInstallments;

  /* --- empty cart --- */
  if (items.length === 0) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">
            Carrinho
          </h1>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/30 py-16">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
              Seu carrinho está vazio
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Adicione produtos ao carrinho para continuar
            </p>
            <div className="flex gap-3">
              <Link href="/dogbook">
                <Button>Ver Dogbook</Button>
              </Link>
              <Link href="/sessoes">
                <Button variant="outline">Ver Sessões</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          href="/dogbook"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Continuar comprando
        </Link>
      </div>

      {/* Title */}
      <h1 className="mt-4 text-center font-serif text-2xl font-bold text-foreground sm:text-3xl">
        Finalizar Pedido
      </h1>

      {/* Main grid: form left, summary right */}
      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ============= LEFT COLUMN ============= */}
          <div className="space-y-8">
            {/* --- Dados Pessoais --- */}
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                <User className="size-5 text-primary" />
                Dados Pessoais
              </h2>

              {/* PF / PJ toggle */}
              <div className="mb-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPersonType("pf")}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    personType === "pf"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => setPersonType("pj")}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    personType === "pj"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  Pessoa Jurídica
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-foreground">
                    {personType === "pj" ? "Nome Fantasia *" : "Nome Completo *"}
                  </Label>
                  <Input
                    id="name"
                    placeholder={personType === "pj" ? "Nome fantasia da empresa" : "Seu nome completo"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1.5 h-10 border-border/60"
                  />
                  {fieldStatus(name)}
                </div>

                {/* PJ-specific: Razão Social */}
                {personType === "pj" && (
                  <div>
                    <Label htmlFor="razaoSocial" className="text-foreground">
                      Razão Social *
                    </Label>
                    <Input
                      id="razaoSocial"
                      placeholder="Razão social da empresa"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(razaoSocial)}
                  </div>
                )}

                {/* Email + Phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(email)}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">
                      Telefone / WhatsApp *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(phone)}
                  </div>
                </div>

                {/* CPF or CNPJ */}
                {personType === "pf" ? (
                  <div className="max-w-xs">
                    <Label htmlFor="cpf" className="text-foreground">
                      CPF *
                    </Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(cpf)}
                  </div>
                ) : (
                  <div className="max-w-xs">
                    <Label htmlFor="cnpj" className="text-foreground">
                      CNPJ *
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(cnpj)}
                  </div>
                )}
              </div>
            </section>

            {/* --- Endereço de Entrega --- */}
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                <MapPin className="size-5 text-primary" />
                Endereço de Entrega
              </h2>

              <div className="space-y-4">
                {/* CEP + Endereço */}
                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <div>
                    <Label htmlFor="cep" className="text-foreground">
                      CEP *
                    </Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        onBlur={handleCepBlur}
                        required
                        className="mt-1.5 h-10 border-border/60"
                      />
                      {cepLookup.loading && (
                        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 mt-0.5 size-4 animate-spin text-primary" />
                      )}
                    </div>
                    {fieldStatus(cep)}
                  </div>
                  <div>
                    <Label htmlFor="endereco" className="text-foreground">
                      Endereço *
                    </Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, Avenida..."
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(endereco)}
                  </div>
                </div>

                {/* Número + Complemento + Bairro */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="numero" className="text-foreground">
                      Número *
                    </Label>
                    <Input
                      id="numero"
                      placeholder="123"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(numero)}
                  </div>
                  <div>
                    <Label htmlFor="complemento" className="text-foreground">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      placeholder="Apto, Bloco..."
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="mt-1.5 h-10 border-border/60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro" className="text-foreground">
                      Bairro *
                    </Label>
                    <Input
                      id="bairro"
                      placeholder="Seu bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(bairro)}
                  </div>
                </div>

                {/* Cidade + Estado */}
                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <div>
                    <Label htmlFor="cidade" className="text-foreground">
                      Cidade *
                    </Label>
                    <Input
                      id="cidade"
                      placeholder="Sua cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(cidade)}
                  </div>
                  <div>
                    <Label htmlFor="estado" className="text-foreground">
                      Estado *
                    </Label>
                    <Input
                      id="estado"
                      placeholder="SP"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      required
                      className="mt-1.5 h-10 border-border/60"
                    />
                    {fieldStatus(estado)}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ============= RIGHT COLUMN — Order Summary ============= */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
                Resumo do Pedido
              </h2>

              {/* Cart items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="shrink-0 overflow-hidden rounded-lg bg-secondary/30">
                      <Image
                        src={item.product.image_url || "/images/dogbook-cover-closed.jpg"}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="size-16 object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-medium text-foreground">
                        {item.product.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary transition-colors"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-[20px] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                      R$ {(item.product.base_price * item.quantity).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Vale Presente */}
              <div className="mb-4">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Gift className="size-4 text-primary" />
                  Vale Presente
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="CODIGO DO VALE"
                    value={valeCode}
                    onChange={(e) => setValeCode(e.target.value)}
                    className="h-9 flex-1 border-border/60 uppercase text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs"
                    onClick={handleApplyVale}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Desconto ({(discount * 100).toFixed(0)}%)
                    </span>
                    <span className="font-medium">
                      -R$ {discountAmount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-3" />

              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base font-semibold text-foreground">
                  Total
                </span>
                <div className="text-right">
                  <p className="font-serif text-xl font-bold text-foreground">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou {maxInstallments}x de R${" "}
                    {installmentValue.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="mt-0.5 text-xs text-green-600 font-medium">
                    R$ {pixTotal.toFixed(2).replace(".", ",")} no PIX ({paymentCfg.pixDiscountPct}% desc.)
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                type="button"
                onClick={handleContinue}
                className="mt-5 w-full h-12 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm uppercase tracking-wide"
              >
                <Lock className="size-4" />
                Continuar para Pagamento
              </Button>

              {/* Stripe badge */}
              <div className="mt-3 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  Pagamento seguro via Stripe
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Aceito: Cartão de crédito e Boleto
                </p>
              </div>

              <Separator className="my-4" />

              {/* Terms */}
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Ao adquirir qualquer produto ou serviço da Patas, Amor &
                Memórias, você concorda integralmente com nossos{" "}
                <Link
                  href="/termos"
                  className="underline hover:text-foreground transition-colors"
                >
                  Termos e Condições
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
