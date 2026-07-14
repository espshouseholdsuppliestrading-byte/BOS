import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const quotations = await prisma.quotation.findMany({
    where: { companyId: session.user.companyId },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(quotations)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const { items, ...quotationData } = body

  const count = await prisma.quotation.count({
    where: { companyId: session.user.companyId },
  })
  const quoteNumber = `QT-${String(count + 1).padStart(5, "0")}`

  const quotation = await prisma.$transaction(async (tx) => {
    const q = await tx.quotation.create({
      data: {
        ...quotationData,
        quoteNumber,
        salesAgentId: session.user.id,
        companyId: session.user.companyId,
      },
    })

    if (items && items.length > 0) {
      await tx.quotationItem.createMany({
        data: items.map((item: any) => ({
          quotationId: q.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      })
    }

    return tx.quotation.findUnique({
      where: { id: q.id },
      include: { client: true, items: true },
    })
  })

  return NextResponse.json(quotation)
}
