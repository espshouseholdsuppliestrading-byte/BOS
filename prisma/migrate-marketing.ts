import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Adding ESPS Sales & Marketing...")

  const holdings = await prisma.company.findFirst({
    where: { name: "ESPS Holdings" },
  })

  if (!holdings) {
    console.error("Holdings company not found. Run seed first.")
    return
  }

  const existing = await prisma.company.findFirst({
    where: { name: "ESPS Sales & Marketing" },
  })

  if (existing) {
    console.log("ESPS Sales & Marketing already exists. Skipping.")
    return
  }

  const marketing = await prisma.company.create({
    data: {
      code: "MKT-001",
      name: "ESPS Sales & Marketing",
      businessType: "sales_and_marketing",
      parentId: holdings.id,
    },
  })

  console.log("Marketing company created")

  const password = await bcrypt.hash("password123", 10)

  await prisma.user.create({
    data: {
      email: "admin@espsmarketing.com",
      name: "Marketing Admin",
      password,
      role: "COMPANY_ADMIN",
      companyId: marketing.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "agent@espsmarketing.com",
      name: "Sample Agent",
      password,
      role: "SALES_AGENT",
      companyId: marketing.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "distributor@espsmarketing.com",
      name: "Sample Distributor",
      password,
      role: "DISTRIBUTOR",
      companyId: marketing.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "territory@espsmarketing.com",
      name: "Sample Territory Partner",
      password,
      role: "TERRITORY_PARTNER",
      companyId: marketing.id,
    },
  })

  console.log("Marketing users created")

  const diyKit = await prisma.product.create({
    data: {
      code: "MKT-DIY-001",
      name: "50L Dishwashing Liquid DIY Kit",
      description: "Complete DIY kit for making 50L of dishwashing liquid",
      category: "diy",
      source: "manufactured",
      unit: "kit",
      costPrice: 500,
      sellingPrice: 1000,
      currentStock: 200,
      minimumStock: 50,
      maximumStock: 500,
      companyId: marketing.id,
    },
  })

  await prisma.product.create({
    data: {
      code: "MKT-REF-001",
      name: "1L Refill Pack",
      description: "1-liter refill pack of dishwashing liquid",
      category: "refill",
      source: "manufactured",
      unit: "piece",
      costPrice: 80,
      sellingPrice: 150,
      currentStock: 500,
      minimumStock: 100,
      maximumStock: 2000,
      companyId: marketing.id,
    },
  })

  await prisma.product.create({
    data: {
      code: "MKT-HC-001",
      name: "Home Care Floor Cleaner",
      description: "Multi-purpose floor cleaning solution",
      category: "finished",
      source: "manufactured",
      unit: "bottle",
      costPrice: 120,
      sellingPrice: 250,
      currentStock: 300,
      minimumStock: 50,
      maximumStock: 1000,
      companyId: marketing.id,
    },
  })

  await prisma.product.create({
    data: {
      code: "MKT-LC-001",
      name: "Laundry Detergent Powder",
      description: "Heavy-duty laundry detergent",
      category: "finished",
      source: "manufactured",
      unit: "pack",
      costPrice: 200,
      sellingPrice: 400,
      currentStock: 250,
      minimumStock: 50,
      maximumStock: 800,
      companyId: marketing.id,
    },
  })

  console.log("Marketing products created")

  const cityTerritory = await prisma.territory.create({
    data: {
      name: "Manila City",
      type: "city",
      companyId: marketing.id,
    },
  })

  await prisma.territory.create({
    data: {
      name: "Barangay 1 - Ermita",
      type: "barangay",
      parentId: cityTerritory.id,
      companyId: marketing.id,
    },
  })

  await prisma.territory.create({
    data: {
      name: "Barangay 2 - Intramuros",
      type: "barangay",
      parentId: cityTerritory.id,
      companyId: marketing.id,
    },
  })

  console.log("Territories created")

  const agent = await prisma.user.findFirst({
    where: { email: "agent@espsmarketing.com" },
  })

  if (agent) {
    await prisma.commissionRule.create({
      data: {
        companyId: marketing.id,
        productId: diyKit.id,
        userRole: "SALES_AGENT",
        type: "fixed",
        amount: 50,
        overrideUp: false,
        status: "active",
      },
    })

    await prisma.commissionRule.create({
      data: {
        companyId: marketing.id,
        productId: diyKit.id,
        userRole: "DISTRIBUTOR",
        type: "fixed",
        amount: 100,
        overrideUp: true,
        overridePercent: 15,
        status: "active",
      },
    })

    await prisma.commissionRule.create({
      data: {
        companyId: marketing.id,
        productId: diyKit.id,
        userRole: "TERRITORY_PARTNER",
        type: "fixed",
        amount: 15,
        overrideUp: true,
        overridePercent: 10,
        status: "active",
      },
    })
  }

  console.log("Commission rules created")
  console.log("Migration completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
