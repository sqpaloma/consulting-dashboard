import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// ===== INTERFACES DEVOLUÇÕES =====

export interface DevolucaoData {
  _id?: string;
  total: number;
  pendentes: number;
  concluidas: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DevolucaoItem {
  _id?: string;
  os: string;
  cliente?: string;
  produto?: string;
  motivo?: string;
  status: string;
  dataDevolucao?: string;
  dataResolucao?: string;
  responsavel?: string;
  valor?: number;
  observacoes?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface DevolucaoUpload {
  _id?: string;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
}

// ===== INTERFACES MOVIMENTAÇÕES =====

export interface MovimentacaoData {
  _id?: string;
  total: number;
  entrada: number;
  saida: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface MovimentacaoItem {
  _id?: string;
  os: string;
  tipo: string; // 'entrada' ou 'saida'
  produto?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  dataMovimentacao?: string;
  origem?: string;
  destino?: string;
  responsavel?: string;
  observacoes?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface MovimentacaoUpload {
  _id?: string;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
}

// ===== HOOKS DEVOLUÇÕES =====

// Hook para carregar dados de devoluções
export function useDevolucaoData() {
  return useQuery(api.returnsMovements.loadDevolucaoData);
}

// Hook para obter histórico de uploads de devoluções
export function useDevolucaoUploadHistory() {
  return useQuery(api.returnsMovements.getDevolucaoUploadHistory);
}

// Hook para salvar dados de devoluções
export function useSaveDevolucaoData() {
  return useMutation(api.returnsMovements.saveDevolucaoData);
}

// Hook para limpar dados de devoluções
export function useClearDevolucaoData() {
  return useMutation(api.returnsMovements.clearAllDevolucaoData);
}

// ===== HOOKS MOVIMENTAÇÕES =====

// Hook para carregar dados de movimentações
export function useMovimentacaoData() {
  return useQuery(api.returnsMovements.loadMovimentacaoData);
}

// Hook para obter histórico de uploads de movimentações
export function useMovimentacaoUploadHistory() {
  return useQuery(api.returnsMovements.getMovimentacaoUploadHistory);
}

// Hook para salvar dados de movimentações
export function useSaveMovimentacaoData() {
  return useMutation(api.returnsMovements.saveMovimentacaoData);
}

// Hook para limpar dados de movimentações
export function useClearMovimentacaoData() {
  return useMutation(api.returnsMovements.clearAllMovimentacaoData);
}

// ===== FUNÇÕES DEVOLUÇÕES (para compatibilidade) =====

export async function saveDevolucaoData(
  devolucaoData: Omit<DevolucaoData, '_id' | 'createdAt' | 'updatedAt'>,
  items: Omit<DevolucaoItem, '_id' | 'createdAt' | 'updatedAt'>[],
  fileName: string,
  uploadedBy?: string
) {
  // Esta função será usada através do hook useSaveDevolucaoData
  return { success: true, uploadId: null };
}

export async function loadDevolucaoData(): Promise<{
  devolucaoData: DevolucaoData | null;
  items: DevolucaoItem[];
}> {
  return { devolucaoData: null, items: [] };
}

export async function getDevolucaoUploadHistory(): Promise<DevolucaoUpload[]> {
  return [];
}

// ===== FUNÇÕES MOVIMENTAÇÕES (para compatibilidade) =====

export async function saveMovimentacaoData(
  movimentacaoData: Omit<MovimentacaoData, '_id' | 'createdAt' | 'updatedAt'>,
  items: Omit<MovimentacaoItem, '_id' | 'createdAt' | 'updatedAt'>[],
  fileName: string,
  uploadedBy?: string
) {
  // Esta função será usada através do hook useSaveMovimentacaoData
  return { success: true, uploadId: null };
}

export async function loadMovimentacaoData(): Promise<{
  movimentacaoData: MovimentacaoData | null;
  items: MovimentacaoItem[];
}> {
  return { movimentacaoData: null, items: [] };
}

export async function getMovimentacaoUploadHistory(): Promise<MovimentacaoUpload[]> {
  return [];
}

// ===== FUNÇÕES AUXILIARES (para compatibilidade) =====

export async function clearAllDevolucaoData() {
  return { success: true };
}

export async function clearAllMovimentacaoData() {
  return { success: true };
}