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

  const order = await prisma.salesOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      items: { include: { product: true } },
      client: true,
      salesAgent: { select: { id: true, name: true, email: true } },
      distributor: { select: { id: true, name: true, email: true } },
      territory: true,
      commissions: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json(order)
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
  const { status, paymentStatus, items } = body

  const existing = await prisma.salesOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (status) data.status = status
  if (paymentStatus) data.paymentStatus = paymentStatus

  if (items) {
    await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: params.id } })

    const totalAmount = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice,
      0
    )
    data.totalAmount = totalAmount
    data.items = {
      create: items.map((item: { productId: string; quantity: number; unitPrice: number; costPrice?: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        sellingPrice: item.unitPrice,
        costPrice: item.costPrice || 0,
        total: item.quantity * item.unitPrice,
      })),
    }
  }

  const order = await prisma.salesOrder.update({
    where: { id: params.id },
    data,
    include: {
      items: { include: { product: true } },
      client: true,
      salesAgent: { select: { id: true, name: true, email: true } },
      distributor: { select: { id: true, name: true, email: true } },
      territory: true,
    },
  })

  return NextResponse.json(order)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.salesOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Only pending orders can be deleted" }, { status: 400 })
  }

  await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: params.id } })
  await prisma.salesOrder.delete({ where: { id: params.id } })

  return NextResponse.json({ message: "Order deleted" })
}
