import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rule = await prisma.commissionRule.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      product: true,
      territory: true,
    },
  })

  if (!rule) {
    return NextResponse.json(
      { error: "Commission rule not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(rule)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.commissionRule.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
  })
  if (!existing) {
    return NextResponse.json(
      { error: "Commission rule not found" },
      { status: 404 }
    )
  }

  const body = await request.json()
  const {
    productId,
    userRole,
    type,
    amount,
    overrideUp,
    overridePercent,
    territoryId,
    status,
  } = body

  if (type && !["fixed", "percentage"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be fixed or percentage" },
      { status: 400 }
    )
  }

  if (type === "percentage" && amount !== undefined && (amount < 0 || amount > 100)) {
    return NextResponse.json(
      { error: "Percentage must be between 0 and 100" },
      { status: 400 }
    )
  }

  const data: Record<string, unknown> = {}
  if (productId) data.productId = productId
  if (userRole) data.userRole = userRole
  if (type) data.type = type
  if (amount !== undefined) data.amount = amount
  if (overrideUp !== undefined) data.overrideUp = overrideUp || null
  if (overridePercent !== undefined) data.overridePercent = overridePercent || null
  if (territoryId !== undefined) data.territoryId = territoryId || null
  if (status) data.status = status

  const rule = await prisma.commissionRule.update({
    where: { id: params.id },
    data,
    include: {
      product: true,
      territory: true,
    },
  })

  return NextResponse.json(rule)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.commissionRule.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
  })
  if (!existing) {
    return NextResponse.json(
      { error: "Commission rule not found" },
      { status: 404 }
    )
  }

  await prisma.commissionRule.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
