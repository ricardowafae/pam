"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  AlertTriangle,
  Trash2,
  Lock,
  Loader2,
  Search,
  Save,
  DollarSign,
  Building2,
  UserCircle,
  Info,
} from "lucide-react";
import { useCepLookup } from "@/hooks/useCepLookup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const mockRole = "fotografo" as "fotografo" | "influenciador";

/* ── Simulates the person type defined at registration ── */
const mockPersonType = "PJ" as "PF" | "PJ";

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function DadosCadastraisPage() {
  const isPhotographer = mockRole === "fotografo";
  const personType = mockPersonType;

  const [address, setAddress] = useState<Address>({
    cep: "05422-030", street: "R. Claudio Soares", number: "72",
    complement: "Sala 5", neighborhood: "Pinheiros", city: "Sao Paulo", state: "SP",
  });
  const [pjAddress, setPjAddress] = useState<Address>({
    cep: "05422-030", street: "R. Claudio Soares", number: "72",
    complement: "Conj 10", neighborhood: "Pinheiros", city: "Sao Paulo", state: "SP",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const personalCep = useCepLookup(
    useMemo(() => ({
      onSuccess: (data) => {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          complement: data.complemento || prev.complement,
        }));
      },
    }), [])
  );

  const pjCep = useCepLookup(
    useMemo(() => ({
      onSuccess: (data) => {
        setPjAddress((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          complement: data.complemento || prev.complement,
        }));
      },
    }), [])
  );

  function updateAddress(field: keyof Address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function updatePjAddress(field: keyof Address, value: string) {
    setPjAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 1000);
  }

  function renderAddressFields(
    addr: Address,
    update: (field: keyof Address, value: string) => void,
    cepHook: ReturnType<typeof useCepLookup>,
    prefix: string
  ) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-cep`}>CEP *</Label>
            <div className="relative">
              <Input id={`${prefix}-cep`} value={addr.cep} onChange={(e) => update("cep", e.target.value)} onBlur={() => cepHook.fetchCep(addr.cep)} placeholder="00000-000" className="pr-9" />
              {cepHook.loading ? (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
              ) : (
                <button onClick={() => cepHook.fetchCep(addr.cep)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  <Search className="size-4" />
                </button>
              )}
            </div>
            {cepHook.loading && <p className="text-xs text-primary">Buscando endereco...</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${prefix}-rua`}>Rua *</Label>
            <Input id={`${prefix}-rua`} value={addr.street} onChange={(e) => update("street", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-numero`}>Numero *</Label>
            <Input id={`${prefix}-numero`} value={addr.number} onChange={(e) => update("number", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-comp`}>Complemento</Label>
            <Input id={`${prefix}-comp`} value={addr.complement} onChange={(e) => update("complement", e.target.value)} placeholder="Sala, Apto..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${prefix}-bairro`}>Bairro *</Label>
            <Input id={`${prefix}-bairro`} value={addr.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${prefix}-cidade`}>Cidade *</Label>
            <Input id={`${prefix}-cidade`} value={addr.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-estado`}>Estado *</Label>
            <select id={`${prefix}-estado`} value={addr.state} onChange={(e) => update("state", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="">Selecione</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Dados Cadastrais</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informacoes profissionais.</p>
      </div>

      {/* Person Type Indicator (read-only, defined at registration) */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {personType === "PF" ? (
                <UserCircle className="size-5 text-primary" />
              ) : (
                <Building2 className="size-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  Cadastro como {personType === "PF" ? "Pessoa Fisica" : "Pessoa Juridica"}
                </p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  personType === "PF" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                }`}>
                  {personType}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tipo de cadastro definido no momento do registro.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">
            Cadastros PF e PJ sao independentes
          </p>
          <p className="text-muted-foreground">
            Caso deseje atuar como Pessoa Fisica e Pessoa Juridica simultaneamente,
            sera necessario criar um novo cadastro com login e senha distintos.
            Cada cadastro tera suas proprias sessoes, comissoes e informacoes.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ── PESSOA FÍSICA ───────────────────────────── */}
      {/* ═══════════════════════════════════════════════ */}
      {personType === "PF" && (
        <>
          {/* PF: Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="size-4 text-primary" /> Dados Pessoais
              </CardTitle>
              <CardDescription>Suas informacoes de identificacao e contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pf-nome">Nome Completo *</Label>
                  <Input id="pf-nome" defaultValue="Juliano Lemos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-cpf" className="flex items-center gap-1">CPF <Lock className="size-3 text-muted-foreground" /></Label>
                  <Input id="pf-cpf" defaultValue="987.654.321-00" disabled className="bg-muted cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">O CPF nao pode ser alterado.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-nascimento">Data de Nascimento</Label>
                  <Input id="pf-nascimento" type="date" defaultValue="1985-06-15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-email" className="flex items-center gap-1">E-mail <Lock className="size-3 text-muted-foreground" /></Label>
                  <Input id="pf-email" type="email" defaultValue="juliano@fotopet.com.br" readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-telefone">Telefone</Label>
                  <Input id="pf-telefone" defaultValue="(11) 99876-5432" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-instagram">Instagram</Label>
                  <Input id="pf-instagram" defaultValue="@julianolemosfoto" />
                </div>
                {isPhotographer && (
                  <div className="space-y-2">
                    <Label htmlFor="pf-portfolio">Portfolio URL</Label>
                    <Input id="pf-portfolio" type="url" defaultValue="https://julianolemos.com.br" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PF: Address */}
          {isPhotographer && (
            <Card>
              <CardHeader>
                <CardTitle>Endereco</CardTitle>
                <CardDescription>Endereco do estudio ou local de atendimento</CardDescription>
              </CardHeader>
              <CardContent>
                {renderAddressFields(address, updateAddress, personalCep, "personal")}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ── PESSOA JURÍDICA ─────────────────────────── */}
      {/* ═══════════════════════════════════════════════ */}
      {personType === "PJ" && (
        <>
          {/* PJ: Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" /> Dados da Empresa
              </CardTitle>
              <CardDescription>Informacoes da pessoa juridica para faturamento e nota fiscal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pj-cnpj">CNPJ *</Label>
                  <Input id="pj-cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pj-razao">Razao Social *</Label>
                  <Input id="pj-razao" defaultValue={isPhotographer ? "Juliano Lemos Fotografia LTDA" : "Camila Digital LTDA"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pj-fantasia">Nome Fantasia</Label>
                  <Input id="pj-fantasia" defaultValue={isPhotographer ? "JL Fotografia Pet" : "Camila Pets"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pj-email" className="flex items-center gap-1">E-mail <Lock className="size-3 text-muted-foreground" /></Label>
                  <Input id="pj-email" type="email" defaultValue={isPhotographer ? "contato@jlfotopet.com.br" : "contato@camilapets.com"} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pj-telefone">Telefone</Label>
                  <Input id="pj-telefone" defaultValue="(11) 99876-5432" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pj-instagram">Instagram</Label>
                  <Input id="pj-instagram" defaultValue={isPhotographer ? "@julianolemosfoto" : "@camilapets"} />
                </div>
                {isPhotographer && (
                  <div className="space-y-2">
                    <Label htmlFor="pj-portfolio">Portfolio URL</Label>
                    <Input id="pj-portfolio" type="url" defaultValue="https://julianolemos.com.br" />
                  </div>
                )}
                {!isPhotographer && (
                  <div className="space-y-2">
                    <Label htmlFor="pj-slug">Slug</Label>
                    <Input id="pj-slug" defaultValue="camila-pets" readOnly className="bg-muted" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PJ: Company Address */}
          <Card>
            <CardHeader>
              <CardTitle>Endereco da Empresa</CardTitle>
              <CardDescription>Endereco completo da pessoa juridica</CardDescription>
            </CardHeader>
            <CardContent>
              {renderAddressFields(pjAddress, updatePjAddress, pjCep, "pj")}
            </CardContent>
          </Card>
        </>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ── COMMON SECTIONS (both PF and PJ) ────────── */}
      {/* ═══════════════════════════════════════════════ */}

      {/* Commissions - fixed R$ values */}
      {isPhotographer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="size-4 text-primary" /> Comissoes por Sessao Fotografica</CardTitle>
            <CardDescription className="flex items-center gap-1"><Lock className="size-3" /> Valores definidos pela equipe administrativa. Nao editaveis.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Sessao Pocket</Label>
                <Input value="R$ 119,70" disabled className="bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>Sessao Estudio</Label>
                <Input value="R$ 209,70" disabled className="bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>Sessao Completa</Label>
                <Input value="R$ 389,70" disabled className="bg-muted cursor-not-allowed" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Data */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Bancarios</CardTitle>
          <CardDescription>Informacoes para recebimento de comissoes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="banco">Banco</Label><Input id="banco" defaultValue="Nu Pagamentos" /></div>
            <div className="space-y-2"><Label htmlFor="agencia">Agencia</Label><Input id="agencia" defaultValue="0001" /></div>
            <div className="space-y-2"><Label htmlFor="conta">Conta</Label><Input id="conta" defaultValue="1234567-8" /></div>
            <div className="space-y-2"><Label htmlFor="pix">Chave PIX</Label><Input id="pix" defaultValue={isPhotographer ? "juliano@fotopet.com.br" : "camila@influencer.com"} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Work Hours */}
      {isPhotographer && (
        <Card>
          <CardHeader>
            <CardTitle>Horario de Trabalho</CardTitle>
            <CardDescription>Disponibilidade para agendamento de sessoes fotograficas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="h-inicio">Inicio</Label><Input id="h-inicio" type="time" defaultValue="09:00" /></div>
              <div className="space-y-2"><Label htmlFor="h-fim">Fim</Label><Input id="h-fim" type="time" defaultValue="18:00" /></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Bio / Sobre</CardTitle>
          <CardDescription>Uma breve descricao sobre voce e seu trabalho</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea defaultValue={isPhotographer
            ? "Fotografo especializado em pets com mais de 10 anos de experiencia. Apaixonado por capturar a personalidade unica de cada animal."
            : "Criadora de conteudo pet com mais de 50k seguidores. Apaixonada por ajudar tutores a eternizar momentos com seus pets."
          } rows={4} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 sm:flex-none gap-2" onClick={handleSave} disabled={saving}>
          <Save className="size-4" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium flex items-center">Alteracoes salvas com sucesso!</span>}
        <div className="flex-1" />
        <Button variant="outline" className="flex-1 sm:flex-none gap-2"><AlertTriangle className="size-4" /> Desativar Perfil</Button>
        <Button variant="destructive" className="flex-1 sm:flex-none gap-2"><Trash2 className="size-4" /> Deletar Perfil</Button>
      </div>
    </div>
  );
}
