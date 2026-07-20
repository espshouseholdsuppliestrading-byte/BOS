import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const companyId = session.user.companyId

  const [
    totalAgents,
    activeAgents,
    totalDistributors,
    activeDistributors,
    totalTerritories,
    totalProducts,
    totalOrders,
    pendingPayouts,
    approvedPayouts,
    totalCommissions,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({
      where: { companyId, role: { in: ["SALES_AGENT", "RESELLER"] } },
    }),
    prisma.user.count({
      where: { companyId, role: { in: ["SALES_AGENT", "RESELLER"] }, status: "active" },
    }),
    prisma.user.count({
      where: { companyId, role: "DISTRIBUTOR" },
    }),
    prisma.user.count({
      where: { companyId, role: "DISTRIBUTOR", status: "active" },
    }),
    prisma.territory.count({ where: { companyId } }),
    prisma.product.count({ where: { companyId } }),
    prisma.salesOrder.count({ where: { companyId } }),
    prisma.payout.count({ where: { companyId, status: "pending" } }),
    prisma.payout.count({ where: { companyId, status: "approved" } }),
    prisma.commission.aggregate({
      where: { companyId, status: "pending" },
      _sum: { amount: true },
    }),
    prisma.salesOrder.findMany({
      where: { companyId },
      include: {
        customer: { select: { name: true } },
        salesAgent: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  return NextResponse.json({
    agents: { total: totalAgents, active: activeAgents },
    distributors: { total: totalDistributors, active: activeDistributors },
    territories: totalTerritories,
    products: totalProducts,
    orders: totalOrders,
    payouts: { pending: pendingPayouts, approved: approvedPayouts },
    commissions: { pending: totalCommissions._sum.amount || 0 },
    recentOrders,
  })
}
