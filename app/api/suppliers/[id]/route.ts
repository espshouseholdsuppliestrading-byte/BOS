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

  const supplier = await prisma.supplier.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(supplier)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const supplier = await prisma.supplier.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.supplier.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supplier = await prisma.supplier.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  })

  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.supplier.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
