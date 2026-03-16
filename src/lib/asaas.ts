/* ═══════════════════════════════════════════════════════════════════════════
   Asaas Payment Gateway — Server-Side Client
   ═══════════════════════════════════════════════════════════════════════════ */

function getBaseUrl(): string {
  const env = process.env.ASAAS_ENVIRONMENT || "sandbox";
  return env === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";
}

interface AsaasErrorResponse {
  errors?: Array<{ code: string; description: string }>;
}

export class AsaasError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Array<{ code: string; description: string }>
  ) {
    super(message);
    this.name = "AsaasError";
  }
}

async function asaasFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error("ASAAS_API_KEY not configured");

  const url = `${getBaseUrl()}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const errorData = data as AsaasErrorResponse;
    const msg =
      errorData.errors?.[0]?.description || `Asaas API error ${res.status}`;
    throw new AsaasError(msg, res.status, errorData.errors);
  }

  return data as T;
}

/* ── Customer ── */

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
}

export interface CreateCustomerParams {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
}

export async function createAsaasCustomer(
  params: CreateCustomerParams
): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      notificationDisabled: params.notificationDisabled ?? true,
    }),
  });
}

export async function findAsaasCustomerByCpfCnpj(
  cpfCnpj: string
): Promise<AsaasCustomer | null> {
  const data = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${cpfCnpj}`
  );
  return data.data?.[0] || null;
}

/* ── Payment ── */

export interface AsaasCreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface AsaasCreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone?: string;
  mobilePhone?: string;
}

export interface CreatePaymentParams {
  customer: string; // Asaas customer ID
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX";
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
  // Credit card specific
  creditCard?: AsaasCreditCard;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  remoteIp?: string;
  // Installments
  installmentCount?: number;
  installmentValue?: number;
  // Discount
  discount?: {
    value: number;
    dueDateLimitDays?: number;
    type: "FIXED" | "PERCENTAGE";
  };
  // Callback
  callback?: {
    successUrl: string;
    autoRedirect?: boolean;
  };
}

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  externalReference?: string;
  description?: string;
  creditCardToken?: string;
  installmentCount?: number;
  installmentValue?: number;
}

export async function createAsaasPayment(
  params: CreatePaymentParams
): Promise<AsaasPayment> {
  // For installments, don't send `value`, use installmentCount + installmentValue
  const body: Record<string, unknown> = { ...params };

  if (params.installmentCount && params.installmentCount > 1) {
    body.installmentValue = params.installmentValue;
    body.installmentCount = params.installmentCount;
    delete body.value; // Asaas requires either value OR installmentCount+installmentValue
  }

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ── PIX QR Code ── */

export interface AsaasPixQrCode {
  encodedImage: string; // base64 QR code image
  payload: string; // copy-paste PIX code
  expirationDate: string;
}

export async function getPixQrCode(
  paymentId: string
): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

/* ── Payment Status ── */

export async function getPaymentStatus(
  paymentId: string
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
}
