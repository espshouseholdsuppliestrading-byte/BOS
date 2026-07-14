import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create companies
  const holdings = await prisma.company.create({
    data: {
      name: "ESPS Holdings",
      slug: "esps-holdings",
      type: "holding",
      address: "Manila, Philippines",
      phone: "+63 917 123 4567",
      email: "info@espsholdings.com",
    },
  })

  const supply = await prisma.company.create({
    data: {
      name: "ESPS Supply Corporation",
      slug: "esps-supply",
      type: "supply",
      address: "Manila, Philippines",
      phone: "+63 917 234 5678",
      email: "supply@esps.com",
      parentId: holdings.id,
    },
  })

  const manufacturing = await prisma.company.create({
    data: {
      name: "ESPS Manufacturing",
      slug: "esps-manufacturing",
      type: "manufacturing",
      address: "Laguna, Philippines",
      phone: "+63 917 345 6789",
      email: "manufacturing@esps.com",
      parentId: holdings.id,
    },
  })

  console.log("Companies created:", { holdings: holdings.id, supply: supply.id, manufacturing: manufacturing.id })

  // Create users
  const password = await bcrypt.hash("password123", 10)

  const admin = await prisma.user.create({
    data: {
      email: "admin@espsholdings.com",
      name: "Admin User",
      password,
      role: "admin",
      companyId: holdings.id,
    },
  })

  const supplyCEO = await prisma.user.create({
    data: {
      email: "ceo@espssupply.com",
      name: "Supply CEO",
      password,
      role: "ceo",
      companyId: supply.id,
    },
  })

  const mfgCEO = await prisma.user.create({
    data: {
      email: "ceo@espsmfg.com",
      name: "Manufacturing CEO",
      password,
      role: "ceo",
      companyId: manufacturing.id,
    },
  })

  console.log("Users created:", { admin: admin.id, supplyCEO: supplyCEO.id, mfgCEO: mfgCEO.id })

  // Create clients for Supply
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Metro Manila Distributors",
        email: "metro@example.com",
        phone: "+63 917 111 2222",
        address: "Makati City",
        contactPerson: "Juan Dela Cruz",
        companyId: supply.id,
      },
    }),
    prisma.client.create({
      data: {
        name: " provincial Traders",
        email: "prov@example.com",
        phone: "+63 917 333 4444",
        address: "Cebu City",
        contactPerson: "Maria Santos",
        companyId: supply.id,
      },
    }),
  ])

  console.log("Clients created:", clients.length)

  // Create suppliers for Supply
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "Chem Solutions Inc.",
        email: "chem@solutions.com",
        phone: "+63 917 555 6666",
        address: "Batangas",
        contactPerson: "Pedro Reyes",
        companyId: supply.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: "PackRight Philippines",
        email: "info@packright.ph",
        phone: "+63 917 777 8888",
        address: "Laguna",
        contactPerson: "Anna Cruz",
        companyId: supply.id,
      },
    }),
  ])

  console.log("Suppliers created:", suppliers.length)

  // Create products for Supply
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "PVC Resin S-65",
        sku: "SPL-PVC-001",
        description: "Polyvinyl chloride resin for chemical processing",
        unit: "kg",
        price: 85,
        cost: 65,
        companyId: supply.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Packaging Film Roll",
        sku: "SPL-PKG-001",
        description: "HDPE packaging film for product wrapping",
        unit: "roll",
        price: 450,
        cost: 320,
        companyId: supply.id,
      },
    }),
  ])

  console.log("Products created:", products.length)

  // Create products for Manufacturing
  const mfgProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: "DIY Kit - Basic",
        sku: "MFG-DIY-001",
        description: "Basic DIY cleaning kit with instructions",
        unit: "pieces",
        price: 3000,
        cost: 1500,
        companyId: manufacturing.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Refill Pack - 1L",
        sku: "MFG-REF-001",
        description: "1-liter refill pack of cleaning solution",
        unit: "pieces",
        price: 800,
        cost: 400,
        companyId: manufacturing.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Finished Product A",
        sku: "MFG-FIN-001",
        description: "Premium finished cleaning product",
        unit: "pieces",
        price: 8000,
        cost: 4000,
        companyId: manufacturing.id,
      },
    }),
  ])

  console.log("Manufacturing products created:", mfgProducts.length)

  // Create inventory for Supply products
  await Promise.all([
    prisma.inventory.create({
      data: {
        productId: products[0].id,
        warehouse: "Main Warehouse",
        quantity: 5000,
        minStock: 1000,
        maxStock: 10000,
        companyId: supply.id,
      },
    }),
    prisma.inventory.create({
      data: {
        productId: products[1].id,
        warehouse: "Main Warehouse",
        quantity: 300,
        minStock: 100,
        maxStock: 500,
        companyId: supply.id,
      },
    }),
  ])

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
