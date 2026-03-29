import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "MakeUpMoney — Precificação para Maquiadoras",
  description: "Descubra o custo real de cada atendimento, precifique corretamente e acompanhe suas metas financeiras.",
  keywords: ["maquiadora", "precificação", "custos", "financeiro", "beleza"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-[#0A0A0A] text-[#F5F5F5] antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#141414",
              border: "1px solid #2A2A2A",
              color: "#F5F5F5",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
