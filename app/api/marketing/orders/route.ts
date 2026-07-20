import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const paymentStatus = searchParams.get("paymentStatus")
  const salesAgentId = searchParams.get("salesAgentId")
  const distributorId = searchParams.get("distributorId")
  const territoryId = searchParams.get("territoryId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  }

  if (status) where.status = status
  if (paymentStatus) where.paymentStatus = paymentStatus
  if (salesAgentId) where.salesAgentId = salesAgentId
  if (distributorId) where.distributorId = distributorId
  if (territoryId) where.territoryId = territoryId

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom)
    if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo)
  }

  const orders = await prisma.salesOrder.findMany({
    where,
    include: {
      items: {
        include: { product: true },
      },
      customer: true,
      salesAgent: true,
      distributor: true,
      territory: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { customerId, salesAgentId, distributorId, territoryId, items, paymentStatus } = body

  if (!customerId || !items || items.length === 0) {
    return NextResponse.json({ error: "customerId and items are required" }, { status: 400 })
  }

  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

  const existingCount = await prisma.salesOrder.count({
    where: {
      companyId: session.user.companyId,
      orderNumber: { startsWith: `MKT-${dateStr}` },
    },
  })

  const sequence = String(existingCount + 1).padStart(3, "0")
  const orderNumber = `MKT-${dateStr}-${sequence}`

  const totalAmount = items.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice,
    0
  )

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber,
      companyId: session.user.companyId,
      customerId,
      salesAgentId: salesAgentId || null,
      distributorId: distributorId || null,
      territoryId: territoryId || null,
      totalAmount,
      paymentStatus: paymentStatus || "unpaid",
      items: {
        create: items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          commissionAmount: 0,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
