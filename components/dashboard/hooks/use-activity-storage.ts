import { useState, useEffect } from "react";

export function useActivityStorage() {
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(
    new Set()
  );

  // Carrega atividades concluídas do localStorage
  useEffect(() => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0]; // YYYY-MM-DD

    // Limpa atividades concluídas de dias anteriores
    const cleanupOldCompletedActivities = () => {
      try {
        const keys = Object.keys(localStorage);
        const completedKeys = keys.filter((key) =>
          key.startsWith("completedActivities_")
        );

        completedKeys.forEach((key) => {
          const dateKey = key.replace("completedActivities_", "");
          if (dateKey !== todayKey) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error("Erro ao limpar atividades antigas:", error);
      }
    };

    cleanupOldCompletedActivities();

    try {
      const stored = localStorage.getItem(`completedActivities_${todayKey}`);
      if (stored) {
        const completedIds = JSON.parse(stored);
        setCompletedActivities(new Set(completedIds));
      }
    } catch (error) {
      console.error("Erro ao carregar atividades concluídas:", error);
    }
  }, []);

  // Função para marcar uma atividade como concluída
  const completeActivity = (activityId: string) => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0];

    setCompletedActivities((prev) => {
      const newSet = new Set([...prev, activityId]);

      // Salva no localStorage
      try {
        localStorage.setItem(
          `completedActivities_${todayKey}`,
          JSON.stringify([...newSet])
        );
      } catch (error) {
        console.error("Erro ao salvar atividade concluída:", error);
      }

      return newSet;
    });
  };

  // Função para desmarcar uma atividade como concluída
  const uncompleteActivity = (activityId: string) => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0];

    setCompletedActivities((prev) => {
      const newSet = new Set(prev);
      newSet.delete(activityId);

      // Salva no localStorage
      try {
        localStorage.setItem(
          `completedActivities_${todayKey}`,
          JSON.stringify([...newSet])
        );
      } catch (error) {
        console.error("Erro ao salvar atividade desmarcada:", error);
      }

      return newSet;
    });
  };

  return {
    completedActivities,
    completeActivity,
    uncompleteActivity,
    setCompletedActivities,
  };
}
