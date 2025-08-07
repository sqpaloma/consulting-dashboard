"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
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

interface EfficiencyChartsProps {
  filters: FilterData;
  processedData?: ProcessedData;
}

// Dados de exemplo para eficiência
const efficiencyData = [
  {
    setor: "Setor 1 - Bombas e Motores de Grande Porte",
    eficiencia: 87,
    tempoMedio: 2.3,
    produtividade: 92,
  },
  {
    setor: "Setor 2 - Bombas e Motores de Pequeno Porte",
    eficiencia: 91,
    tempoMedio: 1.8,
    produtividade: 88,
  },
  {
    setor: "Setor 3 - Bombas e Motores de Engrenagens",
    eficiencia: 85,
    tempoMedio: 2.1,
    produtividade: 90,
  },
  {
    setor: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
    eficiencia: 94,
    tempoMedio: 1.5,
    produtividade: 95,
  },
  {
    setor: "Setor 5 - Comando e Valvulas de Grande Porte",
    eficiencia: 89,
    tempoMedio: 1.9,
    produtividade: 87,
  },
];

const weeklyEfficiency = [
  {
    semana: "Semana 1",
    setor1: 85,
    setor2: 88,
    setor3: 82,
    setor4: 90,
    setor5: 86,
  },
  {
    semana: "Semana 2",
    setor1: 87,
    setor2: 91,
    setor3: 85,
    setor4: 92,
    setor5: 88,
  },
  {
    semana: "Semana 3",
    setor1: 89,
    setor2: 93,
    setor3: 87,
    setor4: 94,
    setor5: 90,
  },
  {
    semana: "Semana 4",
    setor1: 91,
    setor2: 95,
    setor3: 89,
    setor4: 96,
    setor5: 92,
  },
];

const efficiencyDistribution = [
  { name: "Alta Eficiência (>90%)", value: 35, color: "#10B981" },
  { name: "Média Eficiência (70-90%)", value: 45, color: "#3B82F6" },
  { name: "Baixa Eficiência (<70%)", value: 20, color: "#EF4444" },
];

export function EfficiencyCharts({ filters }: EfficiencyChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Eficiência por Setor */}
      <Card>
        <CardHeader>
          <CardTitle>Eficiência por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={efficiencyData}
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
              <Bar dataKey="eficiencia" fill="#3B82F6" name="Eficiência (%)" />
              <Bar
                dataKey="produtividade"
                fill="#10B981"
                name="Produtividade (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução Semanal da Eficiência */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Semanal da Eficiência</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={weeklyEfficiency}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="setor1"
                stroke="#3B82F6"
                name="Setor 1"
              />
              <Line
                type="monotone"
                dataKey="setor2"
                stroke="#10B981"
                name="Setor 2"
              />
              <Line
                type="monotone"
                dataKey="setor3"
                stroke="#F59E0B"
                name="Setor 3"
              />
              <Line
                type="monotone"
                dataKey="setor4"
                stroke="#8B5CF6"
                name="Setor 4"
              />
              <Line
                type="monotone"
                dataKey="setor5"
                stroke="#EF4444"
                name="Setor 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Eficiência */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Eficiência</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={efficiencyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {efficiencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tempo Médio por Setor */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio por Setor (horas)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={efficiencyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="setor"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="tempoMedio"
                  fill="#F59E0B"
                  name="Tempo Médio (h)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
