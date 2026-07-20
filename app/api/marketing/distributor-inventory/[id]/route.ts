import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const inventory = await prisma.distributorInventory.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      distributor: { select: { id: true, name: true, email: true } },
      product: true,
    },
  })

  if (!inventory) {
    return NextResponse.json({ error: "Inventory entry not found" }, { status: 404 })
  }

  return NextResponse.json(inventory)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.distributorInventory.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Inventory entry not found" }, { status: 404 })
  }

  const body = await request.json()
  const { quantity, available, reserved } = body

  const data: Record<string, unknown> = {}
  if (quantity !== undefined) data.quantity = quantity
  if (available !== undefined) data.available = available
  if (reserved !== undefined) data.reserved = reserved

  const inventory = await prisma.distributorInventory.update({
    where: { id: params.id },
    data,
    include: {
      distributor: { select: { id: true, name: true, email: true } },
      product: true,
    },
  })

  return NextResponse.json(inventory)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.distributorInventory.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Inventory entry not found" }, { status: 404 })
  }

  await prisma.distributorInventory.delete({ where: { id: params.id } })

  return NextResponse.json({ message: "Inventory entry deleted" })
}
