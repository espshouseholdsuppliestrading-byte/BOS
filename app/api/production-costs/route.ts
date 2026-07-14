import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("productId")

  const where: Record<string, string> = { companyId: session.user.companyId }
  if (productId) where.productId = productId

  const costs = await prisma.productionCost.findMany({
    where,
    include: { product: true },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(costs)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const cost = await prisma.productionCost.create({
    data: { ...body, companyId: session.user.companyId },
    include: { product: true },
  })
  return NextResponse.json(cost)
}
