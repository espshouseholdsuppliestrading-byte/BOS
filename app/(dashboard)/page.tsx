import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role
  const companyId = session.user.companyId

  if (role === "SUPER_ADMIN") {
    redirect("/holdings")
  }

  if (["RESELLER", "DISTRIBUTOR", "TERRITORY_PARTNER"].includes(role)) {
    redirect("/marketing")
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  })

  if (company?.name?.includes("Marketing")) {
    redirect("/marketing")
  } else if (company?.name?.includes("Manufacturing")) {
    redirect("/manufacturing/ceo")
  } else if (company?.name?.includes("Supply")) {
    redirect("/supply/ceo")
  } else {
    redirect("/holdings")
  }
}
