import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export interface DashboardData {
  _id?: string;
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  devolucoes: number;
  movimentacoes: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardItem {
  _id?: string;
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  dataRegistro?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardUpload {
  _id?: string;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
}

// Hook para carregar dados do dashboard
export function useDashboardData() {
  return useQuery(api.dashboard.loadDashboardData);
}

// Hook para obter histórico de uploads
export function useDashboardUploadHistory() {
  return useQuery(api.dashboard.getDashboardUploadHistory);
}

// Hook para obter responsáveis únicos
export function useUniqueResponsaveis() {
  return useQuery(api.dashboard.getUniqueResponsaveis);
}

// Hook para obter itens por categoria
export function useDashboardItemsByCategory(category: string) {
  return useQuery(api.dashboard.getDashboardItemsByCategory, { category });
}

// Hook para obter itens por responsável
export function useDashboardItemsByResponsavel(responsavel: string) {
  return useQuery(api.dashboard.getDashboardItemsByResponsavel, {
    responsavel,
  });
}

// NOVO: Hook para obter clientes únicos
export function useUniqueClientes() {
  return useQuery(api.dashboard.getUniqueClientes);
}

// NOVO: Hook para obter itens por cliente (busca parcial)
export function useDashboardItemsByCliente(cliente: string) {
  return useQuery(api.dashboard.getDashboardItemsByCliente, { cliente });
}

// Hook para salvar dados do dashboard
export function useSaveDashboardData() {
  return useMutation(api.dashboard.saveDashboardData);
}

// Hook para limpar dados do dashboard
export function useClearDashboardData() {
  return useMutation(api.dashboard.clearAllDashboardData);
}

// Função para salvar dados do dashboard (para compatibilidade com código existente)
export async function saveDashboardData(
  dashboardData: Omit<DashboardData, "_id" | "createdAt" | "updatedAt">,
  items: Omit<DashboardItem, "_id" | "createdAt" | "updatedAt">[],
  fileName: string,
  uploadedBy?: string
) {
  // Esta função será usada através do hook useSaveDashboardData
  // Mantemos aqui apenas para compatibilidade de tipo
  return { success: true, uploadId: null };
}

// Função para carregar dados do dashboard (para compatibilidade com código existente)
export async function loadDashboardData(): Promise<{
  dashboardData: DashboardData | null;
  items: DashboardItem[];
}> {
  // Esta função será usada através do hook useDashboardData
  // Mantemos aqui apenas para compatibilidade de tipo
  return { dashboardData: null, items: [] };
}

// Função para obter histórico de uploads do dashboard (para compatibilidade)
export async function getDashboardUploadHistory(): Promise<DashboardUpload[]> {
  return [];
}

// Função para limpar todos os dados do dashboard (para compatibilidade)
export async function clearAllDashboardData() {
  return { success: true };
}

// Função para obter itens por categoria (para compatibilidade)
export async function getDashboardItemsByCategory(
  category: string
): Promise<DashboardItem[]> {
  return [];
}

// Função para obter responsáveis únicos (para compatibilidade)
export async function getUniqueResponsaveis(): Promise<string[]> {
  return [];
}

// Função para obter itens por responsável (para compatibilidade)
export async function getDashboardItemsByResponsavel(
  responsavel: string
): Promise<DashboardItem[]> {
  return [];
}
