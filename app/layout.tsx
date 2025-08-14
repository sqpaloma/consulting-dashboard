import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationsProvider } from "@/hooks/use-notifications-center";
import { Suspense } from "react";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <NotificationsProvider>
              <AuthLayout>{children}</AuthLayout>
              <Suspense>
                {/* FloatingChat removido temporariamente para investigar erro de runtime */}
              </Suspense>
              <Toaster richColors position="bottom-right" />
            </NotificationsProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
