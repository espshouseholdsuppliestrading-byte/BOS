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
  const agentId = searchParams.get("agentId")
  const period = searchParams.get("period")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  }

  if (status) where.status = status
  if (agentId) where.userId = agentId
  if (period) where.period = period

  const payouts = await prisma.payout.findMany({
    where,
    include: {
      items: {
        include: {
          commission: true,
        },
      },
      user: { select: { id: true, name: true, email: true } },
      commissions: true,
    },
    orderBy: { calculatedAt: "desc" },
  })

  return NextResponse.json(payouts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { period, agentId } = body

  if (!period || !agentId) {
    return NextResponse.json({ error: "period and agentId are required" }, { status: 400 })
  }

  const commissions = await prisma.commission.findMany({
    where: {
      companyId: session.user.companyId,
      userId: agentId,
      payoutId: null,
      status: "pending",
    },
  })

  if (commissions.length === 0) {
    return NextResponse.json({ error: "No unpaid commissions found for this agent and period" }, { status: 400 })
  }

  const totalAmount = commissions.reduce(
    (sum: number, c: any) => sum + Number(c.amount),
    0
  )

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const payout = await prisma.payout.create({
    data: {
      period,
      companyId: session.user.companyId,
      userId: agentId,
      weekStarting: weekStart,
      weekEnding: weekEnd,
      totalAmount,
      calculatedAt: new Date(),
      items: {
        create: commissions.map((c: any) => ({
          commissionId: c.id,
          amount: c.amount,
          type: c.type,
          description: `Commission for order`,
        })),
      },
      commissions: {
        connect: commissions.map((c: any) => ({ id: c.id })),
      },
    },
    include: {
      items: {
        include: {
          commission: true,
        },
      },
      user: { select: { id: true, name: true, email: true } },
      commissions: true,
    },
  })

  return NextResponse.json(payout, { status: 201 })
}
