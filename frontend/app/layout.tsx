import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import IssueMatchAI from "@/components/issue-match-ai"
import FloatingNavbar from "@/components/floating-navbar"
import PageWrapper from "@/components/page-wrapper"
import CursorGlow from "@/components/cursor-glow"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "Open Source Contribution Matchmaker",
  description: "Find the perfect open source issues to contribute to based on your skills and interests",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CursorGlow />
            <FloatingNavbar />
            <PageWrapper>
              {children}
            </PageWrapper>
            <Footer />
            <IssueMatchAI />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}