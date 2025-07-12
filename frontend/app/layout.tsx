import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ApiStats } from "@/components/debug/api-stats"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skill Swap - Exchange Skills, Build Community",
  description: "Connect with others to exchange skills and build meaningful relationships through skill swapping.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <ApiStats />
        </AuthProvider>
      </body>
    </html>
  )
}
