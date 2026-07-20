import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { calculateCommissions } from "@/lib/commission"

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
      client: true,
      salesAgent: { select: { id: true, name: true, email: true } },
      distributor: { select: { id: true, name: true, email: true } },
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
  const { clientId, salesAgentId, distributorId, territoryId, items, paymentStatus } = body

  if (!clientId || !items || items.length === 0) {
    return NextResponse.json({ error: "clientId and items are required" }, { status: 400 })
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
      clientId,
      salesAgentId: salesAgentId || session.user.id,
      distributorId: distributorId || null,
      territoryId: territoryId || null,
      totalAmount,
      paymentStatus: paymentStatus || "unpaid",
      items: {
        create: items.map((item: { productId: string; quantity: number; unitPrice: number; costPrice?: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellingPrice: item.unitPrice,
          costPrice: item.costPrice || 0,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  })

  // Calculate commissions for this order
  await calculateCommissions(order.id, session.user.companyId).catch(console.error)

  return NextResponse.json(order, { status: 201 })
}
