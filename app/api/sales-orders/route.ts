import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const orders = await prisma.salesOrder.findMany({
    where: { companyId: session.user.companyId },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const body = await request.json()
  const { items, ...rest } = body
  const order = await prisma.salesOrder.create({
    data: {
      ...rest,
      salesAgentId: session.user.id,
      companyId: session.user.companyId,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          discount: item.discount || 0,
          total: item.total,
          costPrice: item.costPrice || 0,
        })),
      },
    },
    include: { items: true },
  })
  return NextResponse.json(order)
}
