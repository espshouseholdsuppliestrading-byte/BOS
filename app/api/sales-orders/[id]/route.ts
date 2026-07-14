import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const order = await prisma.salesOrder.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: { client: true, items: { include: { product: true } } },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const { items, ...data } = body
  const order = await prisma.salesOrder.updateMany({
    where: { id: params.id, companyId: session.user.companyId },
    data,
  })
  return NextResponse.json(order)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: params.id } })
  await prisma.salesOrder.deleteMany({ where: { id: params.id, companyId: session.user.companyId } })
  return NextResponse.json({ success: true })
}
