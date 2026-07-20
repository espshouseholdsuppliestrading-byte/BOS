import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@espsholdings.com" } })
  const marketing = await prisma.user.findUnique({ where: { email: "admin@espsmarketing.com" } })

  if (admin) {
    const match = await bcrypt.compare("password123", admin.password)
    console.log("Holdings admin password match:", match)
  } else {
    console.log("Holdings admin NOT FOUND")
  }

  if (marketing) {
    const match = await bcrypt.compare("password123", marketing.password)
    console.log("Marketing admin password match:", match)
  } else {
    console.log("Marketing admin NOT FOUND")
  }
}

main().finally(() => prisma.$disconnect())
