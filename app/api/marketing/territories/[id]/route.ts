import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const territory = await prisma.territory.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      children: {
        include: {
          children: true,
        },
      },
      parent: true,
      users: true,
      commissionRules: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!territory) {
    return NextResponse.json(
      { error: "Territory not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(territory)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.territory.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
  })
  if (!existing) {
    return NextResponse.json(
      { error: "Territory not found" },
      { status: 404 }
    )
  }

  const body = await request.json()
  const { name, type, parentId } = body

  if (type && !["region", "city", "barangay"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be region, city, or barangay" },
      { status: 400 }
    )
  }

  if (parentId) {
    if (parentId === params.id) {
      return NextResponse.json(
        { error: "Territory cannot be its own parent" },
        { status: 400 }
      )
    }
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

  const data: Record<string, unknown> = {}
  if (name) data.name = name
  if (type) data.type = type
  if (parentId !== undefined) data.parentId = parentId || null

  const territory = await prisma.territory.update({
    where: { id: params.id },
    data,
    include: {
      children: true,
      parent: true,
      _count: {
        select: { users: true },
      },
    },
  })

  return NextResponse.json(territory)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await prisma.territory.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId,
    },
    include: {
      _count: {
        select: { users: true, children: true },
      },
    },
  })
  if (!existing) {
    return NextResponse.json(
      { error: "Territory not found" },
      { status: 404 }
    )
  }

  if (existing._count.users > 0) {
    return NextResponse.json(
      { error: "Cannot delete territory with linked users" },
      { status: 400 }
    )
  }

  if (existing._count.children > 0) {
    return NextResponse.json(
      { error: "Cannot delete territory with child territories" },
      { status: 400 }
    )
  }

  await prisma.territory.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
