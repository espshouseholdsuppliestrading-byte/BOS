import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const inventory = await prisma.inventory.findMany({
    where: { companyId: session.user.companyId },
    include: { product: true },
  })
  return NextResponse.json(inventory)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const body = await request.json()
  const movement = await prisma.inventoryMovement.create({
    data: { ...body, companyId: session.user.companyId },
  })
  await prisma.inventory.upsert({
    where: {
      productId_warehouse_companyId: {
        productId: body.productId,
        warehouse: body.warehouse || "Main",
        companyId: session.user.companyId,
      },
    },
    update: {
      quantity: {
        increment: body.type === "purchase_in" ? body.quantity : -body.quantity,
      },
    },
    create: {
      productId: body.productId,
      warehouse: body.warehouse || "Main",
      quantity: body.type === "purchase_in" ? body.quantity : -body.quantity,
      companyId: session.user.companyId,
    },
  })
  return NextResponse.json(movement)
}
