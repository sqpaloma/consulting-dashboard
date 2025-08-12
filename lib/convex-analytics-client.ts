import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export interface AnalyticsData {
  _id?: string;
  engenheiro: string;
  ano: number;
  mes: number;
  registros: number;
  servicos: number;
  pecas: number;
  valorTotal: number;
  valorPecas: number;
  valorServicos: number;
  valorOrcamentos: number;
  projetos: number;
  quantidade: number;
  cliente?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface RawDataRow {
  responsavel: string;
  cliente: string;
  ano: number;
  mes: number;
  valor: number;
  descricao: string;
  orcamentoId: string | undefined;
  isOrcamento: boolean;
  isVendaNormal: boolean;
  isVendaServicos: boolean;
}

export interface AnalyticsUpload {
  _id: string;
  fileName: string;
  uploadedBy: string;
  uploadDate: string;
  totalRecords: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

// Hook para carregar dados de analytics
export function useAnalyticsData() {
  return useQuery(api.analytics.loadAnalyticsData);
}

// Hook para obter histórico de uploads
export function useUploadHistory() {
  return useQuery(api.analytics.getUploadHistory);
}

// Hook para salvar dados de analytics
export function useSaveAnalyticsData() {
  return useMutation(api.analytics.saveAnalyticsData);
}

// Hooks para salvamento em lotes
export function useInitializeAnalyticsUpload() {
  return useMutation(api.analytics.initializeAnalyticsUpload);
}

export function useSaveAnalyticsDataBatch() {
  return useMutation(api.analytics.saveAnalyticsDataBatch);
}

export function useSaveAnalyticsRawDataBatch() {
  return useMutation(api.analytics.saveAnalyticsRawDataBatch);
}

export function useFinalizeAnalyticsUpload() {
  return useMutation(api.analytics.finalizeAnalyticsUpload);
}

// Hook para limpar dados de analytics
export function useClearAnalyticsData() {
  return useMutation(api.analytics.clearAllAnalyticsData);
}

// Hook para resumo por cliente (agregado no servidor)
export function useClientSummary(params?: {
  year?: number;
  month?: number;
  engineer?: string;
  limit?: number;
}) {
  return useQuery(api.analytics.getClientSummary, params as any);
}

// Função para salvar dados da planilha (para compatibilidade com código existente)
export async function saveAnalyticsData(
  data: Omit<AnalyticsData, "_id" | "createdAt" | "updatedAt">[],
  rawData: RawDataRow[],
  fileName: string,
  uploadedBy?: string
) {
  // Esta função será usada através do hook useSaveAnalyticsData
  // Mantemos aqui apenas para compatibilidade de tipo
  return { success: true, uploadId: null };
}

// Função para carregar dados salvos (para compatibilidade com código existente)
export async function loadAnalyticsData(): Promise<{
  data: AnalyticsData[];
  rawData: RawDataRow[];
}> {
  // Esta função será usada através do hook useAnalyticsData
  // Mantemos aqui apenas para compatibilidade de tipo
  return { data: [], rawData: [] };
}

// Função para obter histórico de uploads (para compatibilidade)
export async function getUploadHistory(): Promise<AnalyticsUpload[]> {
  return [];
}

// Função para limpar todos os dados (para compatibilidade)
export async function clearAllAnalyticsData() {
  return { success: true };
}
