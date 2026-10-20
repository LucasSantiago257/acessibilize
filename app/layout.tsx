import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acessibilize · Uma cidade para todo mundo",
  description: "Mapa colaborativo de acessibilidade com locais e relatos da comunidade.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
