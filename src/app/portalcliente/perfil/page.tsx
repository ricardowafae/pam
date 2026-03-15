"use client";

import { useState, useMemo } from "react";
import {
  User,
  PawPrint,
  Plus,
  Trash2,
  Save,
  MapPin,
  Loader2,
  Search,
  Camera,
  Dog,
  Lock,
  Building2,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

/* ── Types ─────────────────────────────────────────── */
interface Pet {
  id: string;
  name: string;
  breed: string;
  birthday: string;
  gender: "Macho" | "Femea" | "";
  weight: string;
  color: string;
  observations: string;
}

interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

type PersonType = "PF" | "PJ";

/* ── Mock data ─────────────────────────────────────── */
const emptyAddress: Address = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

const initialAddress: Address = {
  cep: "05422-030",
  street: "Rua Claudio Soares",
  number: "72",
  complement: "Sala 3",
  neighborhood: "Pinheiros",
  city: "Sao Paulo",
  state: "SP",
};

const initialPets: Pet[] = [
  {
    id: "pet-1",
    name: "Luna",
    breed: "Golden Retriever",
    birthday: "2022-04-15",
    gender: "Femea",
    weight: "28",
    color: "Dourado",
    observations: "Muito brincalhona, adora agua",
  },
  {
    id: "pet-2",
    name: "Thor",
    breed: "Bulldog Frances",
    birthday: "2023-08-10",
    gender: "Macho",
    weight: "12",
    color: "Tigrado",
    observations: "",
  },
];

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

/* ── Mock: person type defined at registration (immutable) ── */
const mockPersonType: PersonType = "PF";

/* ── Component ─────────────────────────────────────── */
export default function PerfilPage() {
  /* Person type — read-only, defined at registration */
  const personType: PersonType = mockPersonType;

  /* Personal data */
  const [nome, setNome] = useState("Ana Silva");
  const [email, setEmail] = useState("ana.silva@email.com");
  const [telefone, setTelefone] = useState("(11) 99999-1234");
  const [cpf] = useState("123.456.789-00");

  /* PF-specific */
  const [dataNascimento, setDataNascimento] = useState("");

  /* PJ-specific */
  const [cnpj] = useState("12.345.678/0001-90");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [companyAddress, setCompanyAddress] = useState<Address>(emptyAddress);

  /* Delivery address */
  const [address, setAddress] = useState<Address>(initialAddress);

  /* Pets */
  const [pets, setPets] = useState<Pet[]>(initialPets);

  /* Save */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── CEP auto-fill (ViaCEP) ────────────────────── */
  const deliveryCepLookup = useCepLookup(
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

  const companyCepLookup = useCepLookup(
    useMemo(() => ({
      onSuccess: (data) => {
        setCompanyAddress((prev) => ({
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

  function updateAddr(
    setter: React.Dispatch<React.SetStateAction<Address>>,
    field: keyof Address,
    value: string
  ) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  /* ── Pet management ────────────────────────────── */
  function addPet() {
    if (pets.length >= 50) return;
    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      name: "",
      breed: "",
      birthday: "",
      gender: "",
      weight: "",
      color: "",
      observations: "",
    };
    setPets((prev) => [...prev, newPet]);
  }

  function removePet(id: string) {
    setPets((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePet(id: string, field: keyof Pet, value: string) {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  /* ── Save ───────────────────────────────────────── */
  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  }

  /* ── Render address fields ─────────────────────── */
  function renderAddressFields(
    addr: Address,
    setter: React.Dispatch<React.SetStateAction<Address>>,
    cepHook: ReturnType<typeof useCepLookup>,
    prefix: string
  ) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-cep`}>CEP *</Label>
            <div className="relative">
              <Input
                id={`${prefix}-cep`}
                value={addr.cep}
                onChange={(e) =>
                  updateAddr(setter, "cep", e.target.value)
                }
                onBlur={() => cepHook.fetchCep(addr.cep)}
                placeholder="00000-000"
                className="pr-9"
              />
              {cepHook.loading ? (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
              ) : (
                <button
                  onClick={() => cepHook.fetchCep(addr.cep)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Search className="size-4" />
                </button>
              )}
            </div>
            {cepHook.loading && (
              <p className="text-xs text-primary">Buscando endereco...</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${prefix}-street`}>Rua *</Label>
            <Input
              id={`${prefix}-street`}
              value={addr.street}
              onChange={(e) =>
                updateAddr(setter, "street", e.target.value)
              }
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-number`}>Numero *</Label>
            <Input
              id={`${prefix}-number`}
              value={addr.number}
              onChange={(e) =>
                updateAddr(setter, "number", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-complement`}>Complemento</Label>
            <Input
              id={`${prefix}-complement`}
              value={addr.complement}
              onChange={(e) =>
                updateAddr(setter, "complement", e.target.value)
              }
              placeholder="Apto, Sala, etc."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${prefix}-neighborhood`}>Bairro *</Label>
            <Input
              id={`${prefix}-neighborhood`}
              value={addr.neighborhood}
              onChange={(e) =>
                updateAddr(setter, "neighborhood", e.target.value)
              }
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${prefix}-city`}>Cidade *</Label>
            <Input
              id={`${prefix}-city`}
              value={addr.city}
              onChange={(e) =>
                updateAddr(setter, "city", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-state`}>Estado *</Label>
            <select
              id={`${prefix}-state`}
              value={addr.state}
              onChange={(e) =>
                updateAddr(setter, "state", e.target.value)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecione</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informacoes pessoais e dos seus pets.
        </p>
      </div>

      {/* ── Avatar / Photo ────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                AS
              </div>
              <button className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{nome}</p>
                <Badge
                  variant={personType === "PJ" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {personType === "PF" ? "Pessoa Fisica" : "Pessoa Juridica"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cliente desde Mar/2026
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Info Banner: PF/PJ are independent ────── */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">
            Cadastros PF e PJ sao independentes
          </p>
          <p className="text-muted-foreground">
            Caso deseje atuar como Pessoa Fisica e Pessoa Juridica
            simultaneamente, sera necessario criar um novo cadastro com login e
            senha distintos. Cada cadastro tera seus proprios pedidos, dogbooks,
            sessoes e informacoes.
          </p>
        </div>
      </div>

      {/* ── PF: Personal Data ────────────────────── */}
      {personType === "PF" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Suas informacoes de contato e identificacao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-1">
                  CPF <Lock className="size-3 text-muted-foreground" />
                </Label>
                <Input
                  id="cpf"
                  value={cpf}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  O CPF nao pode ser alterado.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PJ: Company Data ─────────────────────── */}
      {personType === "PJ" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Informacoes da pessoa juridica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="flex items-center gap-1">
                  CNPJ <Lock className="size-3 text-muted-foreground" />
                </Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  O CNPJ nao pode ser alterado.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razao Social *</Label>
                <Input
                  id="razaoSocial"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Nome fantasia da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pj-telefone">Telefone / WhatsApp *</Label>
                <Input
                  id="pj-telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-1234"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pj-email" className="flex items-center gap-1">
                E-mail <Lock className="size-3 text-muted-foreground" />
              </Label>
              <Input
                id="pj-email"
                type="email"
                value={email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail nao pode ser alterado.
              </p>
            </div>

            <Separator />

            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" />
              Endereco da Empresa
            </h4>
            {renderAddressFields(
              companyAddress,
              setCompanyAddress,
              companyCepLookup,
              "company"
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Delivery Address (both PF and PJ) ────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Endereco de Entrega
          </CardTitle>
          <CardDescription>
            Endereco para entrega dos seus Dogbooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderAddressFields(
            address,
            setAddress,
            deliveryCepLookup,
            "delivery"
          )}
        </CardContent>
      </Card>

      {/* ── Pets ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="size-4 text-primary" />
                Meus Pets
              </CardTitle>
              <CardDescription>
                Cadastre seus pets para associa-los aos Dogbooks e Sessoes
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {pets.length} pet{pets.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pets.map((pet, index) => (
            <div key={pet.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dog className="size-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {pet.name || `Pet ${index + 1}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removePet(pet.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Nome do pet *</Label>
                    <Input
                      value={pet.name}
                      onChange={(e) =>
                        updatePet(pet.id, "name", e.target.value)
                      }
                      placeholder="Ex: Luna"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Raca</Label>
                    <Input
                      value={pet.breed}
                      onChange={(e) =>
                        updatePet(pet.id, "breed", e.target.value)
                      }
                      placeholder="Ex: Golden Retriever"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aniversario</Label>
                    <Input
                      type="date"
                      value={pet.birthday}
                      onChange={(e) =>
                        updatePet(pet.id, "birthday", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Sexo</Label>
                    <select
                      value={pet.gender}
                      onChange={(e) =>
                        updatePet(pet.id, "gender", e.target.value)
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Selecione</option>
                      <option value="Macho">Macho</option>
                      <option value="Femea">Femea</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input
                      value={pet.weight}
                      onChange={(e) =>
                        updatePet(pet.id, "weight", e.target.value)
                      }
                      placeholder="Ex: 28"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor / Pelagem</Label>
                    <Input
                      value={pet.color}
                      onChange={(e) =>
                        updatePet(pet.id, "color", e.target.value)
                      }
                      placeholder="Ex: Dourado"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observacoes</Label>
                  <Textarea
                    value={pet.observations}
                    onChange={(e) =>
                      updatePet(pet.id, "observations", e.target.value)
                    }
                    placeholder="Comportamento, alergias, preferencias..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={addPet}
          >
            <Plus className="size-4" />
            Adicionar Pet
          </Button>
        </CardContent>
      </Card>

      {/* ── Save Button ───────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          className="gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="size-4" />
          {saving ? "Salvando..." : "Salvar Alteracoes"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Alteracoes salvas com sucesso!
          </span>
        )}
      </div>
    </div>
  );
}
