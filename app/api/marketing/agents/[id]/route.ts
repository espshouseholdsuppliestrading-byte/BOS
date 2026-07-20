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

  const agent = await prisma.user.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      territory: true,
      company: { select: { id: true, name: true } },
      commissions: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      distributorInventory: true,
    },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json(agent)
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
    where: { id: params.id, companyId: session.user.companyId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (name) data.name = name
  if (email) data.email = email
  if (role) data.role = role
  if (status) data.status = status
  if (territoryId !== undefined) data.territoryId = territoryId || null
  if (password) data.password = await bcrypt.hash(password, 12)

  const agent = await prisma.user.update({
    where: { id: params.id },
    data,
    include: {
      territory: true,
      company: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(agent)
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
    where: { id: params.id, companyId: session.user.companyId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { status: "inactive" },
  })

  return NextResponse.json({ success: true })
}
