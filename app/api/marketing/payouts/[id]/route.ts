import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const STATUS_ORDER = ["pending", "approved", "released", "paid"] as const

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payout = await prisma.payout.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
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

  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 })
  }

  return NextResponse.json(payout)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.payout.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 })
  }

  const body = await request.json()
  const { status: newStatus } = body

  if (!newStatus) {
    return NextResponse.json({ error: "status is required" }, { status: 400 })
  }

  const currentIdx = STATUS_ORDER.indexOf(existing.status as typeof STATUS_ORDER[number])
  const newIdx = STATUS_ORDER.indexOf(newStatus as typeof STATUS_ORDER[number])

  if (newIdx === -1) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  if (newIdx !== currentIdx + 1) {
    return NextResponse.json(
      { error: `Cannot transition from "${existing.status}" to "${newStatus}". Allowed next status: "${STATUS_ORDER[currentIdx + 1] || "none"}"` },
      { status: 400 }
    )
  }

  const data: Record<string, unknown> = { status: newStatus }
  if (newStatus === "approved") data.approvedAt = new Date()
  if (newStatus === "approved") data.approvedById = session.user.id
  if (newStatus === "released") data.releasedAt = new Date()
  if (newStatus === "paid") data.paidAt = new Date()

  const payout = await prisma.payout.update({
    where: { id: params.id },
    data,
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

  return NextResponse.json(payout)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.payout.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 })
  }

  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Only pending payouts can be deleted" }, { status: 400 })
  }

  await prisma.commission.updateMany({
    where: { payoutId: params.id },
    data: { payoutId: null },
  })

  await prisma.payoutItem.deleteMany({ where: { payoutId: params.id } })
  await prisma.payout.delete({ where: { id: params.id } })

  return NextResponse.json({ message: "Payout deleted" })
}
