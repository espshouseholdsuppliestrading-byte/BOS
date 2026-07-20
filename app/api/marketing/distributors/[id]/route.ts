import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const distributor = await prisma.user.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
      role: "DISTRIBUTOR",
    },
    include: {
      territory: true,
      company: { select: { id: true, name: true } },
      distributorInventory: {
        include: { product: true },
      },
      salesOrders: {
        where: { distributorId: params.id },
        take: 20,
        orderBy: { createdAt: "desc" },
      },
      commissions: true,
    },
  })

  if (!distributor) {
    return NextResponse.json({ error: "Distributor not found" }, { status: 404 })
  }

  return NextResponse.json(distributor)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, email, role, status, password, territoryId } = body

  const existing = await prisma.user.findFirst({
    where: { id: params.id, companyId: session.user.companyId, role: "DISTRIBUTOR" },
  })
  if (!existing) {
    return NextResponse.json({ error: "Distributor not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (name) data.name = name
  if (email) data.email = email
  if (role) data.role = role
  if (status) data.status = status
  if (territoryId !== undefined) data.territoryId = territoryId || null
  if (password) data.password = await bcrypt.hash(password, 12)

  const distributor = await prisma.user.update({
    where: { id: params.id },
    data,
    include: {
      territory: true,
      company: { select: { id: true, name: true } },
      distributorInventory: {
        include: { product: true },
      },
    },
  })

  return NextResponse.json(distributor)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.user.findFirst({
    where: { id: params.id, companyId: session.user.companyId, role: "DISTRIBUTOR" },
  })
  if (!existing) {
    return NextResponse.json({ error: "Distributor not found" }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { status: "inactive" },
  })

  return NextResponse.json({ success: true })
}
