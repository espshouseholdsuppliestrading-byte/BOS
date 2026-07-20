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
  const productId = searchParams.get("productId")
  const userRole = searchParams.get("userRole")
  const territoryId = searchParams.get("territoryId")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  }

  if (productId) where.productId = productId
  if (userRole) where.userRole = userRole
  if (territoryId) where.territoryId = territoryId
  if (status) where.status = status

  const rules = await prisma.commissionRule.findMany({
    where,
    include: {
      product: true,
      territory: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(rules)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const {
    productId,
    userRole,
    type,
    amount,
    overrideUp,
    overridePercent,
    territoryId,
  } = body

  if (!productId || !userRole || !type || amount === undefined) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: productId, userRole, type, amount",
      },
      { status: 400 }
    )
  }

  if (!["fixed", "percentage"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be fixed or percentage" },
      { status: 400 }
    )
  }

  if (type === "percentage" && (amount < 0 || amount > 100)) {
    return NextResponse.json(
      { error: "Percentage must be between 0 and 100" },
      { status: 400 }
    )
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      companyId: session.user.companyId,
    },
  })
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    )
  }

  if (territoryId) {
    const territory = await prisma.territory.findFirst({
      where: {
        id: territoryId,
        companyId: session.user.companyId,
      },
    })
    if (!territory) {
      return NextResponse.json(
        { error: "Territory not found" },
        { status: 404 }
      )
    }
  }

  const rule = await prisma.commissionRule.create({
    data: {
      productId,
      userRole,
      type,
      amount,
      overrideUp: overrideUp || null,
      overridePercent: overridePercent || null,
      territoryId: territoryId || null,
      companyId: session.user.companyId,
      status: "active",
    },
    include: {
      product: true,
      territory: true,
    },
  })

  return NextResponse.json(rule, { status: 201 })
}
