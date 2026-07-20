import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const territoryId = searchParams.get("territoryId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
    role: { in: ["SALES_AGENT", "RESELLER"] },
  }

  if (territoryId) where.territoryId = territoryId
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const agents = await prisma.user.findMany({
    where,
    include: {
      territory: true,
      company: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(agents)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, email, password, role, territoryId } = body

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!["SALES_AGENT", "RESELLER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role for marketing agent" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      companyId: session.user.companyId,
      territoryId: territoryId || null,
      status: "active",
    },
    include: {
      territory: true,
      company: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(user, { status: 201 })
}
