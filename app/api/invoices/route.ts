import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const invoices = await prisma.invoice.findMany({
    where: { companyId: session.user.companyId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const body = await request.json()
  const invoice = await prisma.invoice.create({
    data: { ...body, companyId: session.user.companyId },
  })
  return NextResponse.json(invoice)
}
