// Função para mapear nomes para engenheiros responsáveis
export function mapEngineerResponsible(nome: string): string {
  const nomeUpper = nome.toUpperCase().trim();

  // Mapeamento para PALOMA
  const palomaTeam = [
    "GUSTAVOBEL",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
  ];

  // Mapeamento para LUCAS
  const lucasTeam = [
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "KAUA",
    "MARCELINO",
    "LEANDRO",
    "RODRIGO N",
  ];

  const marceloTeam = [
    "ALZIRO",
    "G SIMAO",
    "HENRIQUE",
    "NICOLAS C",
    "RONALD",
    "VINICIUS",
    "DANIEL G",
  ];

  // Mapeamento para nomes que devem permanecer como estão (responsáveis principais)
  const principalResponsaveis = [
    "SOBRINHO",
    "PALOMA",
    "LUCAS",
    "MARCELO",
    "GIOVANNI",

    "SANDRO",
    "RONAN",
    "RICARDO",
    "VENDAS1",
    "MAMEDE",
    "GIOVANA",
    "RAFAEL MASSA",
    "LENILTON",
    "CARLINHOS",
    "CLAUDIO",
    "ANDERSON",
    "CARVALHO",
    "RONAN NONATO",
    "JEFFERSON",
    "EDISON",
    "MARCELO M",
    "RAQUEL",
  ];

  const carlinhosTeam = ["SHEINE"];

  if (palomaTeam.includes(nomeUpper)) {
    return "PALOMA";
  }

  if (lucasTeam.includes(nomeUpper)) {
    return "LUCAS";
  }

  if (marceloTeam.includes(nomeUpper)) {
    return "MARCELO";
  }

  if (carlinhosTeam.includes(nomeUpper)) {
    return "CARLINHOS";
  }

  // Se é um responsável principal, mantém o nome original
  if (principalResponsaveis.includes(nomeUpper)) {
    return nome;
  }

  // Retorna o nome original se não há mapeamento
  return nome;
}

// Função para verificar se um nome está no mapeamento
export function isEngineerMapped(nome: string): boolean {
  const nomeUpper = nome.toUpperCase().trim();
  const palomaTeam = [
    "GUSTAVOBEL",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
  ];
  const lucasTeam = [
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "KAUA",
    "MARCELINO",
    "LEANDRO",
    "RODRIGO N",
  ];

  const marceloTeam = [
    "ALZIRO",
    "G SIMAO",
    "HENRIQUE",
    "NICOLAS C",
    "RONALD",
    "VINICIUS",
    "DANIEL G",
  ];

  const carlinhosTeam = ["SHEINE"];

  const principalResponsaveis = [
    "SOBRINHO",
    "PALOMA",
    "LUCAS",
    "MARCELO",
    "GIOVANNI",

    "SANDRO",
    "RONAN",
    "RICARDO",
    "VENDAS1",
    "MAMEDE",
    "GIOVANA",
    "RAFAEL MASSA",
    "LENILTON",
    "CARLINHOS",
    "CLAUDIO",
    "ANDERSON",
    "CARVALHO",
    "RONAN NONATO",
    "JEFFERSON",
    "EDISON",
    "MARCELO M",
    "RAQUEL",
  ];

  return (
    palomaTeam.includes(nomeUpper) ||
    lucasTeam.includes(nomeUpper) ||
    marceloTeam.includes(nomeUpper) ||
    carlinhosTeam.includes(nomeUpper) ||
    principalResponsaveis.includes(nomeUpper)
  );
}

// Função para obter todos os nomes que são mapeados
export function getAllMappedNames(): string[] {
  return [
    // Equipe PALOMA
    "GUSTAVOBEL",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
    // Equipe LUCAS
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "KAUA",
    "MARCELINO",
    "LEANDRO",
    "RODRIGO N",
    // Equipe MARCELO
    "ALZIRO",
    "G SIMAO",
    "HENRIQUE",
    "NICOLAS C",
    "RONALD",
    "VINICIUS",
    "DANIEL G",
    // Responsáveis principais
    "SOBRINHO",
    "PALOMA",
    "LUCAS",
    "MARCELO",
    "GIOVANNI",
    "SANDRO",
    "RONAN",
    "RICARDO",
    "VENDAS1",
    "MAMEDE",
    "GIOVANA",
    "RAFAEL MASSA",
    "LENILTON",
    "CARLINHOS",
    "CLAUDIO",
    "ANDERSON",
    "CARVALHO",
    "RONAN NONATO",
    "JEFFERSON",
    "EDISON",
    "MARCELO M",
    "RAQUEL",
    // Equipe CARLINHOS
    "SHEINE",
  ];
}
