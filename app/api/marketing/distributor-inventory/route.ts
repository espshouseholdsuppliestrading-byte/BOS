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
  const userId = searchParams.get("userId")
  const productId = searchParams.get("productId")
  const lowStock = searchParams.get("lowStock")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  }

  if (userId) where.userId = userId
  if (productId) where.productId = productId
  if (lowStock === "true") {
    where.quantity = { lt: 10 }
  }

  const inventory = await prisma.distributorInventory.findMany({
    where,
    include: {
      user: true,
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
  const { userId, productId, quantity } = body

  if (!userId || !productId || quantity === undefined) {
    return NextResponse.json({ error: "userId, productId, and quantity are required" }, { status: 400 })
  }

  const existing = await prisma.distributorInventory.findFirst({
    where: {
      companyId: session.user.companyId,
      userId,
      productId,
    },
  })

  let inventory

  if (existing) {
    inventory = await prisma.distributorInventory.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        lastRestocked: new Date(),
      },
      include: {
        user: true,
        product: true,
      },
    })
  } else {
    inventory = await prisma.distributorInventory.create({
      data: {
        companyId: session.user.companyId,
        userId,
        productId,
        quantity,
        lastRestocked: new Date(),
      },
      include: {
        user: true,
        product: true,
      },
    })
  }

  return NextResponse.json(inventory, { status: 201 })
}
