"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface FilterData {
  executante: string;
  setor: string;
  orcamento: string;
}

interface ProcessedData {
  montagens: any[];
  desmontagens: any[];
  testes: any[];
  apontamentos: any[];
}

interface ApontamentosChartsProps {
  filters: FilterData;
  processedData?: ProcessedData;
}

// Dados de exemplo para apontamentos
const apontamentosPorSetor = [
  {
    setor: "Setor 1 - Bombas e Motores de Grande Porte",
    horasTrabalhadas: 168,
    horasProdutivas: 145,
    horasImprodutivas: 23,
  },
  {
    setor: "Setor 2 - Bombas e Motores de Pequeno Porte",
    horasTrabalhadas: 168,
    horasProdutivas: 152,
    horasImprodutivas: 16,
  },
  {
    setor: "Setor 3 - Bombas e Motores de Engrenagens",
    horasTrabalhadas: 168,
    horasProdutivas: 140,
    horasImprodutivas: 28,
  },
  {
    setor: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
    horasTrabalhadas: 168,
    horasProdutivas: 158,
    horasImprodutivas: 10,
  },
  {
    setor: "Setor 5 - Comando e Valvulas de Grande Porte",
    horasTrabalhadas: 168,
    horasProdutivas: 148,
    horasImprodutivas: 20,
  },
];

const apontamentosDiarios = [
  {
    dia: "Segunda",
    setor1: 8.5,
    setor2: 8.2,
    setor3: 7.8,
    setor4: 8.8,
    setor5: 8.0,
  },
  {
    dia: "Terça",
    setor1: 8.3,
    setor2: 8.5,
    setor3: 8.1,
    setor4: 8.9,
    setor5: 8.2,
  },
  {
    dia: "Quarta",
    setor1: 8.7,
    setor2: 8.8,
    setor3: 7.9,
    setor4: 8.7,
    setor5: 8.1,
  },
  {
    dia: "Quinta",
    setor1: 8.4,
    setor2: 8.6,
    setor3: 8.3,
    setor4: 8.9,
    setor5: 8.3,
  },
  {
    dia: "Sexta",
    setor1: 8.1,
    setor2: 8.3,
    setor3: 7.7,
    setor4: 8.5,
    setor5: 7.9,
  },
];

const tiposApontamento = [
  { name: "Produção", value: 65, color: "#10B981" },
  { name: "Manutenção", value: 15, color: "#3B82F6" },
  { name: "Setup", value: 10, color: "#F59E0B" },
  { name: "Paradas", value: 8, color: "#EF4444" },
  { name: "Outros", value: 2, color: "#8B5CF6" },
];

const apontamentosPorExecutante = [
  { executante: "Alexandre", horas: 42, eficiencia: 92 },
  { executante: "João", horas: 38, eficiencia: 88 },
  { executante: "Maria", horas: 40, eficiencia: 90 },
  { executante: "Roberto", horas: 36, eficiencia: 95 },
  { executante: "Paulo", horas: 39, eficiencia: 87 },
];

export function ApontamentosCharts({ filters }: ApontamentosChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Apontamentos por Setor */}
      <Card>
        <CardHeader>
          <CardTitle>Apontamentos por Setor (Horas Semanais)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={apontamentosPorSetor}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="setor"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="horasProdutivas"
                fill="#10B981"
                name="Horas Produtivas"
                stackId="a"
              />
              <Bar
                dataKey="horasImprodutivas"
                fill="#EF4444"
                name="Horas Improdutivas"
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Apontamentos Diários */}
      <Card>
        <CardHeader>
          <CardTitle>Apontamentos Diários (Horas)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={apontamentosDiarios}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="setor1"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                name="Setor 1"
              />
              <Area
                type="monotone"
                dataKey="setor2"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                name="Setor 2"
              />
              <Area
                type="monotone"
                dataKey="setor3"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                name="Setor 3"
              />
              <Area
                type="monotone"
                dataKey="setor4"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                name="Setor 4"
              />
              <Area
                type="monotone"
                dataKey="setor5"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                name="Setor 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Tipos de Apontamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tipos de Apontamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tiposApontamento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tiposApontamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Apontamentos por Executante */}
        <Card>
          <CardHeader>
            <CardTitle>Apontamentos por Executante</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={apontamentosPorExecutante}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="executante" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="horas"
                  fill="#F59E0B"
                  name="Horas"
                />
                <Bar
                  yAxisId="right"
                  dataKey="eficiencia"
                  fill="#10B981"
                  name="Eficiência (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Evolução dos Apontamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos Apontamentos (Últimas 4 Semanas)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { semana: "Semana 1", produtivas: 140, improdutivas: 28 },
                { semana: "Semana 2", produtivas: 145, improdutivas: 23 },
                { semana: "Semana 3", produtivas: 150, improdutivas: 18 },
                { semana: "Semana 4", produtivas: 155, improdutivas: 13 },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="produtivas"
                stroke="#10B981"
                name="Horas Produtivas"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="improdutivas"
                stroke="#EF4444"
                name="Horas Improdutivas"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
