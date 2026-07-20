"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function RootPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }

    const role = session.user.role

    if (role === "SUPER_ADMIN") {
      router.push("/holdings")
    } else if (["RESELLER", "DISTRIBUTOR", "TERRITORY_PARTNER"].includes(role)) {
      router.push("/marketing")
    } else {
      router.push("/holdings")
    }
  }, [session, status, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  )
}
