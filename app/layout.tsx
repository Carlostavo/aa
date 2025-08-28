import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Gestión de Residuos Sólidos",
  description: "Sistema de gestión de residuos sólidos con autenticación y edición en tiempo real",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.3/js/all.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-gray-50`}>{children}</body>
    </html>
  )
}
