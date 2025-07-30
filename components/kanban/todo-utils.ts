// Função para extrair responsável e data da descrição
export const extractInfoFromDescription = (description: string) => {
  const responsibleMatch = description.match(/Responsável: (.+)/);
  const dateMatch = description.match(/Data Agendada: (.+)/);

  const responsible = responsibleMatch ? responsibleMatch[1] : null;
  const scheduledDate = dateMatch ? dateMatch[1] : null;
  const cleanDescription = description
    .replace(/Responsável: .+\n?/g, "")
    .replace(/Data Agendada: .+\n?/g, "")
    .trim();

  return { responsible, scheduledDate, cleanDescription };
};

// Função para construir descrição completa com responsável e data
export const buildFullDescription = (
  description: string,
  responsible: string,
  scheduledDate: string
) => {
  let fullDescription = description || "";
  if (responsible) {
    fullDescription += `\nResponsável: ${responsible}`;
  }
  if (scheduledDate) {
    fullDescription += `\nData Agendada: ${scheduledDate}`;
  }
  return fullDescription.trim();
};

// Função para filtrar tarefas por status
export const filterTodosByStatus = (todos: any[]) => {
  const pendingTodos =
    todos?.filter(
      (todo) =>
        !todo.completed &&
        (!todo.description || !todo.description.includes("[EM_PROCESSO]"))
    ) || [];

  const inProgressTodos =
    todos?.filter(
      (todo) =>
        !todo.completed &&
        todo.description &&
        todo.description.includes("[EM_PROCESSO]")
    ) || [];

  const completedTodos = todos?.filter((todo) => todo.completed) || [];

  return { pendingTodos, inProgressTodos, completedTodos };
};

// Função para determinar novo status baseado na coluna
export const getNewStatusFromColumn = (columnId: string) => {
  switch (columnId) {
    case "in-progress":
      return "in-progress";
    case "completed":
      return "completed";
    default:
      return "todo";
  }
};

// Função para atualizar descrição baseada no novo status
export const updateDescriptionForStatus = (
  currentDescription: string,
  newStatus: string
) => {
  const { responsible, scheduledDate, cleanDescription } =
    extractInfoFromDescription(currentDescription || "");

  let newDescription = cleanDescription || "";
  let isCompleted = false;

  if (newStatus === "completed") {
    isCompleted = true;
    newDescription = newDescription.replace("[EM_PROCESSO]", "").trim();
  } else if (newStatus === "in-progress") {
    if (!newDescription.includes("[EM_PROCESSO]")) {
      newDescription = newDescription
        ? `${newDescription} [EM_PROCESSO]`
        : "[EM_PROCESSO]";
    }
  } else if (newStatus === "todo") {
    newDescription = newDescription.replace("[EM_PROCESSO]", "").trim();
  }

  // Manter responsável e data se existirem
  if (responsible) {
    newDescription += `\nResponsável: ${responsible}`;
  }
  if (scheduledDate) {
    newDescription += `\nData Agendada: ${scheduledDate}`;
  }

  return { newDescription: newDescription.trim(), isCompleted };
};
