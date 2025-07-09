import { mutation } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export const seedInitialUser = mutation({
  handler: async (ctx) => {
    // Check if users already exist
    const existingUsers = await ctx.db.query("users").collect();

    if (existingUsers.length > 0) {
      console.log("Users already exist, skipping seed");
      return { success: false, message: "Users already exist" };
    }

    // Create Paloma user
    const hashedPassword = await hashPassword("123456");
    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      name: "Paloma",
      email: "paloma@novakgouveia.com",
      position: "Gerente",
      department: "Administrativo",
      hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // Create default settings for Paloma
    await ctx.db.insert("userSettings", {
      userId: userId,
      emailNotifications: true,
      pushNotifications: true,
      calendarReminders: true,
      projectUpdates: true,
      weeklyReports: false,
      profileVisibility: "public",
      dataSharing: false,
      analyticsTracking: true,
      theme: "dark",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      autoSave: true,
      backupFrequency: "daily",
      sessionTimeout: "30min",
      updatedAt: now,
    });

    console.log("Initial user Paloma created successfully");
    return {
      success: true,
      message: "Initial user created",
      userId,
    };
  },
});

export const seedSampleData = mutation({
  handler: async (ctx) => {
    // Check if data already exists
    const existingEvents = await ctx.db.query("events").collect();
    const existingTodos = await ctx.db.query("todos").collect();

    if (existingEvents.length > 0 || existingTodos.length > 0) {
      console.log("Sample data already exists, skipping seed");
      return { success: false, message: "Sample data already exists" };
    }

    const now = Date.now();

    // Create sample events
    await ctx.db.insert("events", {
      title: "Reunião com Cliente A",
      description: "Discussão sobre projeto estrutural",
      date: "2025-01-15",
      time: "14:00",
      duration: "2h",
      location: "Escritório",
      participants: ["Paloma", "Cliente A"],
      color: "bg-blue-500",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("events", {
      title: "Análise Técnica Projeto B",
      description: "Revisão dos cálculos estruturais",
      date: "2025-01-16",
      time: "09:00",
      duration: "3h",
      location: "Laboratório",
      participants: ["Paloma"],
      color: "bg-green-500",
      createdAt: now,
      updatedAt: now,
    });

    // Create sample todos
    await ctx.db.insert("todos", {
      title: "Revisar relatório estrutural",
      description: "Revisar cálculos e recomendações",
      completed: false,
      priority: "high",
      dueDate: "2025-01-20",
      category: "Engenharia",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("todos", {
      title: "Preparar apresentação para cliente",
      description: "Slides com resultados da análise",
      completed: false,
      priority: "medium",
      dueDate: "2025-01-22",
      category: "Comercial",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("todos", {
      title: "Atualizar documentação do projeto",
      description: "Incluir últimas alterações",
      completed: true,
      priority: "low",
      category: "Documentação",
      createdAt: now,
      updatedAt: now,
    });

    console.log("Sample data created successfully");
    return {
      success: true,
      message: "Sample data created",
    };
  },
});
