// Test script to check analytics data saving
const testData = {
  analyticsData: [
    {
      engenheiro: "Test Engineer",
      ano: 2024,
      mes: 1,
      registros: 10,
      servicos: 5,
      pecas: 3,
      valorTotal: 1000,
      valorPecas: 300,
      valorServicos: 700,
      valorOrcamentos: 0,
      projetos: 2,
      quantidade: 8,
      cliente: "Test Client"
    }
  ],
  rawData: [
    {
      responsavel: "Test Engineer",
      cliente: "Test Client",
      ano: 2024,
      mes: 1,
      valor: 1000,
      descricao: "Test Description",
      orcamentoId: undefined,
      isOrcamento: false,
      isVendaNormal: true,
      isVendaServicos: false
    }
  ]
};

console.log("Test data prepared:", testData);
console.log("Analytics items:", testData.analyticsData.length);
console.log("Raw data items:", testData.rawData.length);