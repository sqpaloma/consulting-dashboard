import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Novak & Gouveia",
  description:
    "Gerenciador da consutoria, visualise o seu processo com o nosso dashboard",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ConvexClientProvider>
          <AuthLayout>{children}</AuthLayout>
          <Toaster richColors position="bottom-right" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
