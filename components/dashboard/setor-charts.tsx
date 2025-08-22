"use client";

import React, { useMemo } from "react";
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
  LineChart,
  Line,
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

// Definição dos setores
const setores = [
  {
    id: "setor1",
    nome: "Setor 1",
    nomeCompleto: "Setor 1 - Bombas e Motores de Grande Porte",
    executantes: ["Alexandre", "Alexsandro", "Kaua", "Marcelino", "Roberto P"],
  },
  {
    id: "setor2",
    nome: "Setor 2",
    nomeCompleto: "Setor 2 - Bombas e Motores de Pequeno Porte",
    executantes: ["Eduardo", "Guilherme", "Gustavobel", "Yuri"],
  },
  {
    id: "setor3",
    nome: "Setor 3",
    nomeCompleto: "Setor 3 - Bombas e Motores de Engrenagens",
    executantes: ["Fabio F", "Vagner", "Nivaldo"],
  },
  {
    id: "setor4",
    nome: "Setor 4",
    nomeCompleto: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
    executantes: [
      "Nicolas C",
      "Alziro",
      "Henrique",
      "G Simao",
      "Ronald",
      "Vinicius",
      "Daniel G",
    ],
  },
  {
    id: "setor5",
    nome: "Setor 5",
    nomeCompleto: "Setor 5 - Comando e Valvulas de Grande Porte",
    executantes: ["L Miguel", "Leandro", "Rodrigo N", "Luismiguel"],
  },
  {
    id: "avulsos",
    nome: "Avulsos",
    nomeCompleto: "Avulsos",
    executantes: [],
  },
];

// Cores para os gráficos
const COLORS = [
  "#3B82F6",
  "#1D4ED8",
  "#1E40AF",
  "#2563EB",
  "#1E3A8A",
  "#1E293B",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-blue-600">{`Quantidade: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function SetorCharts({ filters, processedData }: SetorChartsProps) {
  // Função para processar dados reais da planilha
  const processRealData = (data: any[], type: string) => {
    if (!data || data.length === 0) return {};

    const result: { [key: string]: any[] } = {};

    // Agrupar por setor
    setores.forEach((setor) => {
      const setorData: { [key: string]: number } = {};

      data.forEach((item) => {
        if (item.executante && item.tipo === type) {
          const executante = item.executante.trim();

          // Verificar se o executante pertence ao setor
          const pertenceAoSetor = setor.executantes.some(
            (exec) =>
              exec.toLowerCase().includes(executante.toLowerCase()) ||
              executante.toLowerCase().includes(exec.toLowerCase())
          );

          if (pertenceAoSetor) {
            setorData[executante] = (setorData[executante] || 0) + 1;
          }
        }
      });

      // Converter para formato do gráfico
      result[setor.nome] = Object.entries(setorData).map(
        ([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length],
        })
      );
    });

    return result;
  };

  // Processar dados consolidados por setor
  const processConsolidatedData = (data: any[], type: string) => {
    const setorCounts: { [key: string]: number } = {};

    data.forEach((item) => {
      if (item.executante && item.tipo === type) {
        const executante = item.executante.trim();

        // Encontrar o setor do executante
        const setor = setores.find((s) =>
          s.executantes.some(
            (exec) =>
              exec.toLowerCase().includes(executante.toLowerCase()) ||
              executante.toLowerCase().includes(exec.toLowerCase())
          )
        );

        if (setor) {
          setorCounts[setor.nomeCompleto] =
            (setorCounts[setor.nomeCompleto] || 0) + 1;
        }
      }
    });

    return Object.entries(setorCounts)
      .map(([nomeCompleto, value]) => {
        const setor = setores.find((s) => s.nomeCompleto === nomeCompleto);
        return {
          name: setor ? setor.nome : nomeCompleto,
          value,
          color:
            COLORS[
              setores.findIndex((s) => s.nomeCompleto === nomeCompleto) %
                COLORS.length
            ],
          ordem: setor ? parseInt(setor.id.replace("setor", "")) : 999,
        };
      })
      .sort((a, b) => a.ordem - b.ordem);
  };

  // Processar dados mensais para executante específico
  const processMonthlyData = (executanteName: string) => {
    if (!processedData) return [];

    const monthlyData: {
      [key: string]: {
        montagens: number;
        desmontagens: number;
        testes: number;
      };
    } = {};

    [
      ...processedData.montagens,
      ...processedData.desmontagens,
      ...processedData.testes,
    ].forEach((item) => {
      if (
        item.executante &&
        item.executante.trim().toLowerCase() === executanteName.toLowerCase()
      ) {
        const date = new Date(item.data);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { montagens: 0, desmontagens: 0, testes: 0 };
        }

        if (item.tipo === "montagem") monthlyData[monthKey].montagens++;
        else if (item.tipo === "desmontagem")
          monthlyData[monthKey].desmontagens++;
        else if (item.tipo.includes("teste")) monthlyData[monthKey].testes++;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        ...data,
      }));
  };

  const realMontagensData = useMemo(
    () =>
      processedData ? processRealData(processedData.montagens, "montagem") : {},
    [processedData]
  );

  const realDesmontagensData = useMemo(
    () =>
      processedData
        ? processRealData(processedData.desmontagens, "desmontagem")
        : {},
    [processedData]
  );

  const realTestesData = useMemo(
    () =>
      processedData
        ? processRealData(
            processedData.testes.filter((t) => t.tipo.includes("teste")),
            "teste"
          )
        : {},
    [processedData]
  );

  const consolidatedMontagens = useMemo(
    () =>
      processedData
        ? processConsolidatedData(processedData.montagens, "montagem")
        : [],
    [processedData]
  );

  const consolidatedDesmontagens = useMemo(
    () =>
      processedData
        ? processConsolidatedData(processedData.desmontagens, "desmontagem")
        : [],
    [processedData]
  );

  const consolidatedTestes = useMemo(() => {
    if (!processedData) return [];

    const setorCounts: {
      [key: string]: { aprovados: number; reprovados: number };
    } = {};

    processedData.testes.forEach((item) => {
      if (item.executante) {
        const executante = item.executante.trim();
        const setor = setores.find((s) =>
          s.executantes.some(
            (exec) =>
              exec.toLowerCase().includes(executante.toLowerCase()) ||
              executante.toLowerCase().includes(exec.toLowerCase())
          )
        );

        if (setor) {
          if (!setorCounts[setor.nomeCompleto]) {
            setorCounts[setor.nomeCompleto] = { aprovados: 0, reprovados: 0 };
          }

          if (item.tipo === "teste_aprovado") {
            setorCounts[setor.nomeCompleto].aprovados++;
          } else if (item.tipo === "teste_reprovado") {
            setorCounts[setor.nomeCompleto].reprovados++;
          }
        }
      }
    });

    return Object.entries(setorCounts)
      .map(([nomeCompleto, data]) => {
        const setor = setores.find((s) => s.nomeCompleto === nomeCompleto);
        return {
          name: setor ? setor.nome : nomeCompleto,
          aprovados: data.aprovados,
          reprovados: data.reprovados,
          ordem: setor ? parseInt(setor.id.replace("setor", "")) : 999,
        };
      })
      .sort((a, b) => a.ordem - b.ordem);
  }, [processedData]);

  // Determinar qual visualização mostrar baseado nos filtros
  const renderVisualization = () => {
    // Caso 1: Executante específico selecionado
    if (filters.executante) {
      const monthlyData = processMonthlyData(filters.executante);

      return (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
              DADOS MENSAIS - {filters.executante.toUpperCase()}
            </h2>
          </div>

          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Produção Mensal - {filters.executante}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="montagens"
                    stroke="#3B82F6"
                    name="Montagens"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="desmontagens"
                    stroke="#10B981"
                    name="Desmontagens"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="testes"
                    stroke="#F59E0B"
                    name="Testes"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Caso 2: Setor específico selecionado (mas não executante)
    if (filters.setor && filters.setor !== "todos") {
      const setorSelecionado = setores.find((s) => s.id === filters.setor);
      if (!setorSelecionado) return null;

      return (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
              {setorSelecionado.nome.toUpperCase()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {setorSelecionado.nomeCompleto}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Montagens */}
            <Card className="min-h-[350px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Montagens</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={realMontagensData[setorSelecionado.nome] || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(realMontagensData[setorSelecionado.nome] || []).map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`montagem-${setorSelecionado.nome}-${index}`}
                            fill={entry.color}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Desmontagens */}
            <Card className="min-h-[350px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Desmontagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={realDesmontagensData[setorSelecionado.nome] || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(realDesmontagensData[setorSelecionado.nome] || []).map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`desmontagem-${setorSelecionado.nome}-${index}`}
                            fill={entry.color}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Testes */}
            <Card className="min-h-[350px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={realTestesData[setorSelecionado.nome] || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(realTestesData[setorSelecionado.nome] || []).map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`teste-${setorSelecionado.nome}-${index}`}
                            fill={entry.color}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Caso 3: Filtro "Todos" - mostrar os 6 gráficos dos setores
    if (filters.setor === "todos") {
      return (
        <div className="space-y-10">
          {/* Seção de Montagens */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
                MONTAGENS
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {setores
                .slice()
                .sort((a, b) => {
                  const aNum = parseInt(a.id.replace("setor", "")) || 999;
                  const bNum = parseInt(b.id.replace("setor", "")) || 999;
                  return aNum - bNum;
                })
                .map((setor) => (
                  <Card
                    key={`montagem-pie-card-${setor.nome}`}
                    className="min-h-[350px]"
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {setor.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={realMontagensData[setor.nome] || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(realMontagensData[setor.nome] || []).map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`montagem-pie-${setor.nome}-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
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

          {/* Seção de Desmontagens */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                DESMONTAGENS
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {setores
                .slice()
                .sort((a, b) => {
                  const aNum = parseInt(a.id.replace("setor", "")) || 999;
                  const bNum = parseInt(b.id.replace("setor", "")) || 999;
                  return aNum - bNum;
                })
                .map((setor) => (
                  <Card
                    key={`desmontagem-pie-card-${setor.nome}`}
                    className="min-h-[350px]"
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {setor.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={realDesmontagensData[setor.nome] || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(realDesmontagensData[setor.nome] || []).map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`desmontagem-pie-${setor.nome}-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
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

          {/* Seção de Testes */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2">
                TESTES APROVADOS E REPROVADOS
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {setores
                .slice()
                .sort((a, b) => {
                  const aNum = parseInt(a.id.replace("setor", "")) || 999;
                  const bNum = parseInt(b.id.replace("setor", "")) || 999;
                  return aNum - bNum;
                })
                .map((setor) => (
                  <Card
                    key={`teste-bar-card-${setor.nome}`}
                    className="min-h-[350px]"
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {setor.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={realTestesData[setor.nome] || []}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill="#8884d8">
                            {(realTestesData[setor.nome] || []).map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`teste-bar-${setor.nome}-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
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

    // Caso 4: Sem filtros - gráficos consolidados por setor
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2">
            VISÃO CONSOLIDADA POR SETORES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Montagens Consolidadas */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Montagens por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={consolidatedMontagens}>
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Quantidade",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6">
                    {consolidatedMontagens.map((entry: any, index: number) => (
                      <Cell
                        key={`consolidated-montagem-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Desmontagens Consolidadas */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Desmontagens por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={consolidatedDesmontagens}>
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Quantidade",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981">
                    {consolidatedDesmontagens.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`consolidated-desmontagem-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Testes Consolidados */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Testes por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={consolidatedTestes}>
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Quantidade",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="aprovados" fill="#10B981" name="Aprovados" />
                  <Bar dataKey="reprovados" fill="#F59E0B" name="Reprovados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return renderVisualization();
}
