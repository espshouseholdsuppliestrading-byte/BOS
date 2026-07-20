"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.companyId) {
      fetch("/api/companies")
        .then((r) => r.json())
        .then((companies) => {
          const my = Array.isArray(companies)
            ? companies.find((c: any) => c.id === session.user.companyId)
            : null
          setCompanyName(my?.name || "ESPS Holdings")
        })
        .catch(() => setCompanyName("ESPS Holdings"))
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        userRole={session.user.role}
        companyName={companyName || "ESPS Holdings"}
      />
      <div className="pl-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
