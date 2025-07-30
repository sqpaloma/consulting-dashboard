"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

interface SetorChartsProps {
  filters: FilterData;
  processedData?: ProcessedData;
}

// Dados baseados na imagem fornecida
const montagensData = {
  "Setor 1 - Bombas e Motores de Grande Porte": [
    { name: "Alexandre", value: 45, color: "#3B82F6" },
    { name: "Alexsandro", value: 32, color: "#1D4ED8" },
    { name: "Kaua", value: 28, color: "#1E40AF" },
    { name: "Marcelino", value: 22, color: "#1E40AF" },
    { name: "Roberto P", value: 18, color: "#1E40AF" },
  ],
  "Setor 2 - Bombas e Motores de Pequeno Porte": [
    { name: "Eduardo", value: 38, color: "#3B82F6" },
    { name: "Guilherme", value: 42, color: "#1D4ED8" },
    { name: "Gustavobel", value: 35, color: "#1E40AF" },
    { name: "Yuri", value: 28, color: "#1E40AF" },
  ],
  "Setor 3 - Bombas e Motores de Engrenagens": [
    { name: "Fabio F", value: 29, color: "#3B82F6" },
    { name: "Vagner", value: 31, color: "#1D4ED8" },
    { name: "Nivaldo", value: 26, color: "#1E40AF" },
  ],
  "Setor 4 - Comandos e Valvulas de Pequeno Porte": [
    { name: "Nicolas C", value: 33, color: "#3B82F6" },
    { name: "Alziro", value: 27, color: "#1D4ED8" },
    { name: "Henrique", value: 30, color: "#1E40AF" },
    { name: "G Simao", value: 25, color: "#1E40AF" },
    { name: "Ronald", value: 20, color: "#1E40AF" },
    { name: "Vinicius", value: 15, color: "#1E40AF" },
    { name: "Daniel G", value: 10, color: "#1E40AF" },
  ],
  "Setor 5 - Comando e Valvulas de Grande Porte": [
    { name: "L Miguel", value: 24, color: "#3B82F6" },
    { name: "Leandro", value: 28, color: "#1D4ED8" },
    { name: "Rodrigo N", value: 22, color: "#1E40AF" },
  ],
};

const desmontagensData = {
  "Setor 1 - Bombas e Motores de Grande Porte": [
    { name: "Alexandre", value: 38, color: "#10B981" },
    { name: "Alexsandro", value: 29, color: "#059669" },
    { name: "Kaua", value: 25, color: "#047857" },
    { name: "Marcelino", value: 22, color: "#047857" },
    { name: "Roberto P", value: 18, color: "#047857" },
  ],
  "Setor 2 - Bombas e Motores de Pequeno Porte": [
    { name: "Eduardo", value: 32, color: "#10B981" },
    { name: "Guilherme", value: 35, color: "#059669" },
    { name: "Gustavobel", value: 28, color: "#047857" },
    { name: "Yuri", value: 22, color: "#047857" },
  ],
  "Setor 3 - Bombas e Motores de Engrenagens": [
    { name: "Fabio F", value: 26, color: "#10B981" },
    { name: "Vagner", value: 28, color: "#059669" },
    { name: "Nivaldo", value: 24, color: "#047857" },
  ],
  "Setor 4 - Comandos e Valvulas de Pequeno Porte": [
    { name: "Nicolas C", value: 30, color: "#10B981" },
    { name: "Alziro", value: 25, color: "#059669" },
    { name: "Henrique", value: 27, color: "#047857" },
    { name: "G Simao", value: 22, color: "#047857" },
    { name: "Ronald", value: 18, color: "#047857" },
    { name: "Vinicius", value: 15, color: "#047857" },
    { name: "Daniel G", value: 10, color: "#047857" },
  ],
  "Setor 5 - Comando e Valvulas de Grande Porte": [
    { name: "L Miguel", value: 22, color: "#10B981" },
    { name: "Leandro", value: 25, color: "#059669" },
    { name: "Rodrigo N", value: 20, color: "#047857" },
  ],
};

const testesData = {
  "Setor 1 - Bombas e Motores de Grande Porte": [
    { name: "Aprovados", value: 85, color: "#10B981" },
    { name: "Reprovados", value: 15, color: "#F59E0B" },
  ],
  "Setor 2 - Bombas e Motores de Pequeno Porte": [
    { name: "Aprovados", value: 92, color: "#10B981" },
    { name: "Reprovados", value: 8, color: "#F59E0B" },
  ],
  "Setor 3 - Bombas e Motores de Engrenagens": [
    { name: "Aprovados", value: 88, color: "#10B981" },
    { name: "Reprovados", value: 12, color: "#F59E0B" },
  ],
  "Setor 4 - Comandos e Valvulas de Pequeno Porte": [
    { name: "Aprovados", value: 95, color: "#10B981" },
    { name: "Reprovados", value: 5, color: "#F59E0B" },
  ],
  "Setor 5 - Comando e Valvulas de Grande Porte": [
    { name: "Aprovados", value: 90, color: "#10B981" },
    { name: "Reprovados", value: 10, color: "#F59E0B" },
  ],
};

const setores = [
  {
    nome: "Setor 1 - Bombas e Motores de Grande Porte",
    executantes: [
      "Alexandre",
      "Alexsandro",
      "Kaua",
      "Marcelino",
      "Roberto P",
      "ALEXANDRE",
      "ALEXSANDRO",
      "KAUA",
      "MARCELINO",
    ],
  },
  {
    nome: "Setor 2 - Bombas e Motores de Pequeno Porte",
    executantes: [
      "Eduardo",
      "Guilherme",
      "Gustavobel",
      "Yuri",
      "EDUARDO",
      "GUILHERME",
      "GUSTAVOBEL",
    ],
  },
  {
    nome: "Setor 3 - Bombas e Motores de Engrenagens",
    executantes: [
      "Fabio F",
      "Vagner",
      "Nivaldo",
      "FABIO F",
      "VAGNER",
      "NIVALDO",
    ],
  },
  {
    nome: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
    executantes: [
      "Nicolas C",
      "Alziro",
      "Henrique",
      "G Simao",
      "RONALD",
      "VINICIUS",
      "Daniel G",
      "NICOLAS C",
      "ALZIRO",
      "HENRIQUE",
      "G SIMAO",
      "DANIEL G",
    ],
  },
  {
    nome: "Setor 5 - Comando e Valvulas de Grande Porte",
    executantes: [
      "L Miguel",
      "Leandro",
      "Rodrigo N",
      "L MIGUEL",
      "LEANDRO",
      "RODRIGO N",
    ],
  },
];

export function SetorCharts({ filters, processedData }: SetorChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Função para processar dados reais da planilha
  const processRealData = () => {
    if (!processedData) return { montagensData, desmontagensData, testesData };

    console.log("Dados processados recebidos:", processedData);

    // Processar dados de montagens
    const montagensPorSetor: any = {};
    processedData.montagens.forEach((item) => {
      console.log("Processando montagem:", item);
      const setor = getSetorByExecutante(item.executante);
      console.log(`Executante: ${item.executante} -> Setor: ${setor.nome}`);

      if (!montagensPorSetor[setor.nome]) {
        montagensPorSetor[setor.nome] = {};
      }
      if (!montagensPorSetor[setor.nome][item.executante]) {
        montagensPorSetor[setor.nome][item.executante] = 0;
      }
      montagensPorSetor[setor.nome][item.executante]++;
    });

    // Processar dados de desmontagens
    const desmontagensPorSetor: any = {};
    processedData.desmontagens.forEach((item) => {
      console.log("Processando desmontagem:", item);
      const setor = getSetorByExecutante(item.executante);
      console.log(`Executante: ${item.executante} -> Setor: ${setor.nome}`);

      if (!desmontagensPorSetor[setor.nome]) {
        desmontagensPorSetor[setor.nome] = {};
      }
      if (!desmontagensPorSetor[setor.nome][item.executante]) {
        desmontagensPorSetor[setor.nome][item.executante] = 0;
      }
      desmontagensPorSetor[setor.nome][item.executante]++;
    });

    // Processar dados de testes
    const testesPorSetor: any = {};
    processedData.testes.forEach((item) => {
      console.log("Processando teste:", item);
      const setor = getSetorByExecutante(item.executante);
      console.log(`Executante: ${item.executante} -> Setor: ${setor.nome}`);

      if (!testesPorSetor[setor.nome]) {
        testesPorSetor[setor.nome] = { aprovados: 0, reprovados: 0 };
      }
      if (item.tipo === "teste_aprovado") {
        testesPorSetor[setor.nome].aprovados++;
      } else if (item.tipo === "teste_reprovado") {
        testesPorSetor[setor.nome].reprovados++;
      }
    });

    // Converter para formato dos gráficos
    const realMontagensData: any = {};
    const realDesmontagensData: any = {};
    const realTestesData: any = {};

    setores.forEach((setor) => {
      // Montagens
      if (montagensPorSetor[setor.nome]) {
        realMontagensData[setor.nome] = Object.entries(
          montagensPorSetor[setor.nome]
        ).map(([executante, count]: [string, any]) => ({
          name: getDisplayName(executante),
          value: count,
          color: getRandomColor(),
        }));
      } else {
        realMontagensData[setor.nome] = [];
      }

      // Desmontagens
      if (desmontagensPorSetor[setor.nome]) {
        realDesmontagensData[setor.nome] = Object.entries(
          desmontagensPorSetor[setor.nome]
        ).map(([executante, count]: [string, any]) => ({
          name: getDisplayName(executante),
          value: count,
          color: getRandomColor(),
        }));
      } else {
        realDesmontagensData[setor.nome] = [];
      }

      // Testes
      if (testesPorSetor[setor.nome]) {
        realTestesData[setor.nome] = [
          {
            name: "Aprovados",
            value: testesPorSetor[setor.nome].aprovados,
            color: "#10B981",
          },
          {
            name: "Reprovados",
            value: testesPorSetor[setor.nome].reprovados,
            color: "#F59E0B",
          },
        ];
      } else {
        realTestesData[setor.nome] = [];
      }
    });

    console.log("Resultados finais:", {
      montagensPorSetor,
      desmontagensPorSetor,
      testesPorSetor,
      realMontagensData,
      realDesmontagensData,
      realTestesData,
    });

    return { realMontagensData, realDesmontagensData, realTestesData };
  };

  const getSetorByExecutante = (executante: string) => {
    // Normalizar o nome do executante para comparação
    const executanteNormalizado = executante?.toUpperCase().trim();

    for (const setor of setores) {
      // Verificar se o executante está na lista do setor (case insensitive)
      const encontrado = setor.executantes.some(
        (nome) => nome.toUpperCase().trim() === executanteNormalizado
      );
      if (encontrado) {
        return setor;
      }
    }

    // Se não encontrar, tentar mapear por similaridade
    for (const setor of setores) {
      const encontrado = setor.executantes.some(
        (nome) =>
          executanteNormalizado?.includes(nome.toUpperCase().trim()) ||
          nome
            .toUpperCase()
            .trim()
            .includes(executanteNormalizado || "")
      );
      if (encontrado) {
        return setor;
      }
    }

    console.log(`Executante não encontrado: ${executante}`);
    return setores[0]; // Default
  };

  const getRandomColor = () => {
    const colors = [
      "#3B82F6",
      "#1D4ED8",
      "#1E40AF",
      "#10B981",
      "#059669",
      "#047857",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Função para manter nome completo (não abreviar)
  const getDisplayName = (name: string) => {
    return name || "";
  };

  const { realMontagensData, realDesmontagensData, realTestesData } =
    processRealData();

  // Processar dados de exemplo com nomes completos
  const processExampleData = (data: any) => {
    const processed: any = {};
    Object.keys(data).forEach((setor) => {
      processed[setor] = data[setor].map((item: any) => ({
        ...item,
        name: getDisplayName(item.name),
      }));
    });
    return processed;
  };

  const montagensDataProcessed = processExampleData(montagensData);
  const desmontagensDataProcessed = processExampleData(desmontagensData);

  return (
    <div className="space-y-6">
      {/* Montagens*/}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">Montagens</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {setores.map((setor) => (
            <Card key={setor.nome} className="min-h-[350px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {setor.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={
                        realMontagensData[setor.nome] ||
                        montagensDataProcessed[setor.nome] ||
                        []
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(
                        realMontagensData[setor.nome] ||
                        montagensDataProcessed[setor.nome] ||
                        []
                      ).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desmontagens */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">Desmontagens</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {setores.map((setor) => (
            <Card key={setor.nome} className="min-h-[350px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {setor.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={
                        realDesmontagensData[setor.nome] ||
                        desmontagensDataProcessed[setor.nome] ||
                        []
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(
                        realDesmontagensData[setor.nome] ||
                        desmontagensDataProcessed[setor.nome] ||
                        []
                      ).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testes Aprovados e Reprovados */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">
          Testes Aprovados e Reprovados
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {setores.map((setor) => (
            <Card key={setor.nome} className="min-h-[350px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {setor.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={
                      realTestesData[setor.nome] ||
                      testesData[setor.nome as keyof typeof testesData] ||
                      []
                    }
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 8 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8">
                      {(
                        realTestesData[setor.nome] ||
                        testesData[setor.nome as keyof typeof testesData] ||
                        []
                      ).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
