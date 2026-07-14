import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const quotations = await prisma.quotation.findMany({
    where: { companyId: session.user.companyId },
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(quotations)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const body = await request.json()
  const quotation = await prisma.quotation.create({
    data: { ...body, salesAgentId: session.user.id, companyId: session.user.companyId },
  })
  return NextResponse.json(quotation)
}
