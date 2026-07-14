import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const expense = await prisma.expense.findFirst({ where: { id: params.id, companyId: session.user.companyId } })
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(expense)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const expense = await prisma.expense.updateMany({ where: { id: params.id, companyId: session.user.companyId }, data: body })
  return NextResponse.json(expense)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.expense.deleteMany({ where: { id: params.id, companyId: session.user.companyId } })
  return NextResponse.json({ success: true })
}
