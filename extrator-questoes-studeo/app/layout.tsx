import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Certifique-se de que este caminho está correto

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SynapseFlow",
  description: "Automatize a extração e resolução de questões de provas online com IA.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Força o tema escuro por padrão
          enableSystem={false} // Desabilita a detecção do tema do sistema
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
