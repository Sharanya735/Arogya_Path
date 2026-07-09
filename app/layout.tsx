import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Outfit } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Arogya Path - Ambulance Tracking System",
  description: "Real-time ambulance tracking and dispatch management system for healthcare providers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
