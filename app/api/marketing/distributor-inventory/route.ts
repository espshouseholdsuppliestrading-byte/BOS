import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const distributorId = searchParams.get("distributorId")
  const productId = searchParams.get("productId")
  const lowStock = searchParams.get("lowStock")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  }

  if (distributorId) where.distributorId = distributorId
  if (productId) where.productId = productId
  if (lowStock === "true") {
    where.quantity = { lt: 10 }
  }

  const inventory = await prisma.distributorInventory.findMany({
    where,
    include: {
      distributor: { select: { id: true, name: true, email: true } },
      product: true,
    },
  })

  return NextResponse.json(inventory)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { distributorId, productId, quantity, costPrice } = body

  if (!distributorId || !productId || quantity === undefined) {
    return NextResponse.json({ error: "distributorId, productId, and quantity are required" }, { status: 400 })
  }

  const existing = await prisma.distributorInventory.findFirst({
    where: {
      companyId: session.user.companyId,
      distributorId,
      productId,
    },
  })

  let inventory

  if (existing) {
    inventory = await prisma.distributorInventory.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        available: existing.available + quantity,
        lastRestocked: new Date(),
      },
      include: {
        distributor: { select: { id: true, name: true, email: true } },
        product: true,
      },
    })
  } else {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    inventory = await prisma.distributorInventory.create({
      data: {
        companyId: session.user.companyId,
        distributorId,
        productId,
        quantity,
        available: quantity,
        costPrice: costPrice || product?.costPrice || 0,
        lastRestocked: new Date(),
      },
      include: {
        distributor: { select: { id: true, name: true, email: true } },
        product: true,
      },
    })
  }

  return NextResponse.json(inventory, { status: 201 })
}
