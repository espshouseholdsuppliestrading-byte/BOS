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
  const order = await prisma.purchaseOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: { supplier: true, items: { include: { product: true } } },
  })
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
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
  const existing = await prisma.purchaseOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const order = await prisma.purchaseOrder.update({
    where: { id: params.id },
    data: {
      status: body.status ?? existing.status,
      expectedDate: body.expectedDate ?? existing.expectedDate,
      receivedDate: body.receivedDate ?? existing.receivedDate,
    },
    include: { supplier: true, items: true },
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
  const existing = await prisma.purchaseOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  await prisma.purchaseOrderItem.deleteMany({
    where: { purchaseOrderId: params.id },
  })
  await prisma.purchaseOrder.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
