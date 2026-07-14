import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const holdings = await prisma.company.create({
    data: {
      code: "HOLD-001",
      name: "ESPS Holdings",
      businessType: "holding",
    },
  })

  const supply = await prisma.company.create({
    data: {
      code: "SUP-001",
      name: "ESPS Supply Corporation",
      businessType: "supply",
      parentId: holdings.id,
    },
  })

  const manufacturing = await prisma.company.create({
    data: {
      code: "MFG-001",
      name: "ESPS Manufacturing",
      businessType: "manufacturing",
      parentId: holdings.id,
    },
  })

  console.log("Companies created")

  const password = await bcrypt.hash("password123", 10)

  const admin = await prisma.user.create({
    data: {
      email: "admin@espsholdings.com",
      name: "Admin User",
      password,
      role: "SUPER_ADMIN",
      companyId: holdings.id,
    },
  })

  const supplyAdmin = await prisma.user.create({
    data: {
      email: "admin@espssupply.com",
      name: "Supply Admin",
      password,
      role: "COMPANY_ADMIN",
      companyId: supply.id,
    },
  })

  const supplySales = await prisma.user.create({
    data: {
      email: "sales@espssupply.com",
      name: "Sales Agent",
      password,
      role: "SALES_AGENT",
      companyId: supply.id,
    },
  })

  const mfgAdmin = await prisma.user.create({
    data: {
      email: "admin@espsmfg.com",
      name: "Manufacturing Admin",
      password,
      role: "COMPANY_ADMIN",
      companyId: manufacturing.id,
    },
  })

  console.log("Users created")

  const client1 = await prisma.client.create({
    data: {
      code: "CLI-001",
      name: "Metro Manila Distributors",
      email: "metro@example.com",
      phone: "+63 917 111 2222",
      address: "Makati City",
      type: "distributor",
      companyId: supply.id,
    },
  })

  const client2 = await prisma.client.create({
    data: {
      code: "CLI-002",
      name: "Provincial Traders",
      email: "prov@example.com",
      phone: "+63 917 333 4444",
      address: "Cebu City",
      type: "retailer",
      companyId: supply.id,
    },
  })

  console.log("Clients created")

  const supplier1 = await prisma.supplier.create({
    data: {
      code: "SUP-S01",
      name: "Chem Solutions Inc.",
      email: "chem@solutions.com",
      phone: "+63 917 555 6666",
      address: "Batangas",
      companyId: supply.id,
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      code: "SUP-S02",
      name: "PackRight Philippines",
      email: "info@packright.ph",
      phone: "+63 917 777 8888",
      address: "Laguna",
      companyId: supply.id,
    },
  })

  console.log("Suppliers created")

  const product1 = await prisma.product.create({
    data: {
      code: "SPL-PVC-001",
      name: "PVC Resin S-65",
      description: "Polyvinyl chloride resin for chemical processing",
      category: "raw_material",
      source: "local",
      unit: "kg",
      costPrice: 65,
      sellingPrice: 85,
      currentStock: 5000,
      minimumStock: 1000,
      maximumStock: 10000,
      companyId: supply.id,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      code: "SPL-PKG-001",
      name: "Packaging Film Roll",
      description: "HDPE packaging film for product wrapping",
      category: "packaging",
      source: "local",
      unit: "roll",
      costPrice: 320,
      sellingPrice: 450,
      currentStock: 300,
      minimumStock: 100,
      maximumStock: 500,
      companyId: supply.id,
    },
  })

  console.log("Supply products created")

  const mfgProduct1 = await prisma.product.create({
    data: {
      code: "MFG-DIY-001",
      name: "DIY Kit - Basic",
      description: "Basic DIY cleaning kit with instructions",
      category: "diy",
      source: "manufactured",
      unit: "pieces",
      costPrice: 1500,
      sellingPrice: 3000,
      currentStock: 500,
      minimumStock: 100,
      maximumStock: 1000,
      companyId: manufacturing.id,
    },
  })

  const mfgProduct2 = await prisma.product.create({
    data: {
      code: "MFG-REF-001",
      name: "Refill Pack - 1L",
      description: "1-liter refill pack of cleaning solution",
      category: "refill",
      source: "manufactured",
      unit: "pieces",
      costPrice: 400,
      sellingPrice: 800,
      currentStock: 1200,
      minimumStock: 200,
      maximumStock: 3000,
      companyId: manufacturing.id,
    },
  })

  const mfgProduct3 = await prisma.product.create({
    data: {
      code: "MFG-FIN-001",
      name: "Finished Product A",
      description: "Premium finished cleaning product",
      category: "finished",
      source: "manufactured",
      unit: "pieces",
      costPrice: 4000,
      sellingPrice: 8000,
      currentStock: 300,
      minimumStock: 50,
      maximumStock: 500,
      companyId: manufacturing.id,
    },
  })

  console.log("Manufacturing products created")

  await prisma.inventory.create({
    data: {
      productId: product1.id,
      warehouse: "Main Warehouse",
      quantity: 5000,
      companyId: supply.id,
    },
  })

  await prisma.inventory.create({
    data: {
      productId: product2.id,
      warehouse: "Main Warehouse",
      quantity: 300,
      companyId: supply.id,
    },
  })

  console.log("Inventory created")
  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
