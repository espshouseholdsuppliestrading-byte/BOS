import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const quotation = await prisma.quotation.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: { client: true, items: { include: { product: true } } },
  })
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(quotation)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()

  const existing = await prisma.quotation.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { items, ...data } = body

  const quotation = await prisma.$transaction(async (tx) => {
    if (items && Array.isArray(items)) {
      await tx.quotationItem.deleteMany({ where: { quotationId: params.id } })
      await tx.quotationItem.createMany({
        data: items.map((item: any) => ({
          quotationId: params.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      })
    }
    return tx.quotation.update({
      where: { id: params.id },
      data,
      include: { client: true, items: { include: { product: true } } },
    })
  })

  return NextResponse.json(quotation)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.$transaction(async (tx) => {
    await tx.quotationItem.deleteMany({ where: { quotationId: params.id } })
    await tx.quotation.deleteMany({ where: { id: params.id, companyId: session.user.companyId } })
  })

  return NextResponse.json({ success: true })
}
