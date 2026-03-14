"use client";

import { useState, useCallback } from "react";

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface UseCepLookupOptions {
  onSuccess?: (data: CepData) => void;
  onError?: (message: string) => void;
}

/**
 * Hook to fetch address data from ViaCEP API.
 *
 * Usage:
 * ```ts
 * const { fetchCep, loading } = useCepLookup({
 *   onSuccess: (data) => {
 *     setEndereco(data.logradouro);
 *     setBairro(data.bairro);
 *     setCidade(data.localidade);
 *     setEstado(data.uf);
 *   },
 * });
 * ```
 */
export function useCepLookup(options?: UseCepLookupOptions) {
  const [loading, setLoading] = useState(false);

  const fetchCep = useCallback(
    async (rawCep: string) => {
      // Strip non-digit characters
      const cep = rawCep.replace(/\D/g, "");

      if (cep.length !== 8) return;

      setLoading(true);

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (!res.ok) {
          options?.onError?.("Erro ao buscar CEP. Tente novamente.");
          return;
        }

        const data: CepData = await res.json();

        if (data.erro) {
          options?.onError?.("CEP não encontrado.");
          return;
        }

        options?.onSuccess?.(data);
      } catch {
        options?.onError?.("Erro de conexão ao buscar CEP.");
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { fetchCep, loading };
}
