import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-provider";

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
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
