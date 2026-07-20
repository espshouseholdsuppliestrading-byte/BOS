import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@espsholdings.com" },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare("password123", user.password)

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      passwordMatch,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
