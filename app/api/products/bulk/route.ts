import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { products } = body

  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "No products provided" }, { status: 400 })
  }

  if (products.length > 500) {
    return NextResponse.json({ error: "Maximum 500 products per import" }, { status: 400 })
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as { row: number; error: string }[],
  }

  for (let i = 0; i < products.length; i++) {
    const row = products[i]
    try {
      if (!row.name || !row.code) {
        results.failed++
        results.errors.push({ row: i + 1, error: "Missing name or code" })
        continue
      }

      const existing = await prisma.product.findFirst({
        where: { code: row.code, companyId: session.user.companyId },
      })

      if (existing) {
        results.failed++
        results.errors.push({ row: i + 1, error: `Code ${row.code} already exists` })
        continue
      }

      await prisma.product.create({
        data: {
          name: row.name,
          code: row.code,
          description: row.description || null,
          category: row.category || "general",
          costPrice: parseFloat(row.costPrice) || 0,
          sellingPrice: parseFloat(row.sellingPrice) || 0,
          currentStock: parseInt(row.currentStock) || 0,
          minimumStock: parseInt(row.minimumStock) || 0,
          unit: row.unit || "pcs",
          source: row.source || "procured",
          status: "active",
          companyId: session.user.companyId,
        },
      })

      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return NextResponse.json(results)
}
