import { ChatPage } from "@/components/chat-page";
import { AdminProtection } from "@/components/admin-protection";

export default function Chat() {
  return (
    <AdminProtection
      allowedRoles={[
        "consultor",
        "qualidade_pcp",
        "gerente",
        "diretor",
        "admin",
      ]}
    >
      <ChatPage />
    </AdminProtection>
  );
}
