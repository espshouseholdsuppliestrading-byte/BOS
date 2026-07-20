import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      businessType: true,
      parentId: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          products: true,
          salesOrders: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(companies)
}
