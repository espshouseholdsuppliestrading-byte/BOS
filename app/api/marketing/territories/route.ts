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
  const type = searchParams.get("type")
  const parentId = searchParams.get("parentId")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  }

  if (type) where.type = type
  if (parentId) where.parentId = parentId

  const territories = await prisma.territory.findMany({
    where,
    include: {
      children: {
        include: {
          children: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(territories)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, type, parentId } = body

  if (!name || !type) {
    return NextResponse.json(
      { error: "Missing required fields: name and type" },
      { status: 400 }
    )
  }

  if (!["region", "city", "barangay"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be region, city, or barangay" },
      { status: 400 }
    )
  }

  if (parentId) {
    const parent = await prisma.territory.findFirst({
      where: {
        id: parentId,
        companyId: session.user.companyId,
      },
    })
    if (!parent) {
      return NextResponse.json(
        { error: "Parent territory not found" },
        { status: 404 }
      )
    }
  }

  const territory = await prisma.territory.create({
    data: {
      name,
      type,
      parentId: parentId || null,
      companyId: session.user.companyId,
    },
    include: {
      children: true,
      _count: {
        select: { users: true },
      },
    },
  })

  return NextResponse.json(territory, { status: 201 })
}
