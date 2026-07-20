import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      territory: true,
      company: { select: { name: true } },
      distributorInventory: {
        include: { product: true },
      },
    },
  })

  // Get orders where user is the sales agent
  const agentOrders = await prisma.salesOrder.findMany({
    where: { salesAgentId: session.user.id },
    include: {
      items: { include: { product: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  // Get orders where user is the distributor
  const distributorOrders = await prisma.salesOrder.findMany({
    where: { distributorId: session.user.id },
    include: {
      items: { include: { product: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  // Get commissions
  const commissions = await prisma.commission.findMany({
    where: { userId: session.user.id },
    include: { order: { select: { orderNumber: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  // Get payouts
  const payouts = await prisma.payout.findMany({
    where: { userId: session.user.id },
    orderBy: { calculatedAt: "desc" },
    take: 10,
  })

  return NextResponse.json({
    user,
    agentOrders,
    distributorOrders,
    commissions,
    payouts,
  })
}
