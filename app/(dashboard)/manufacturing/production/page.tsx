"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Factory, Package, DollarSign } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import Link from "next/link"

interface Product {
  id: string
  name: string
  code: string
  currentStock: number
}

interface ProductionCost {
  id: string
  productId: string
  product: { name: string; code: string }
  type: string
  category: string | null
  amount: number
  quantity: number | null
  unit: string | null
  description: string | null
  date: string
}

export default function ProductionPage() {
  const [productionCosts, setProductionCosts] = useState<ProductionCost[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/production-costs").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([pc, p]) => {
      setProductionCosts(Array.isArray(pc) ? pc : [])
      setProducts(Array.isArray(p) ? p : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalProductionCost = productionCosts.reduce((sum, pc) => sum + Number(pc.amount), 0)
  const totalQuantityProduced = productionCosts.reduce((sum, pc) => sum + (pc.quantity || 0), 0)
  const uniqueProducts = new Set(productionCosts.map((pc) => pc.productId)).size

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production</h1>
          <p className="text-muted-foreground">Production costs and manufacturing metrics</p>
        </div>
        <Link href="/manufacturing/costing">
          <Button><Plus className="mr-2 h-4 w-4" />Record Production</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Production Cost" value={`₱${totalProductionCost.toLocaleString()}`} icon={DollarSign} description="All recorded costs" />
        <StatsCard title="Units Produced" value={totalQuantityProduced.toLocaleString()} icon={Factory} description="Total quantity produced" />
        <StatsCard title="Products Manufactured" value={uniqueProducts.toString()} icon={Package} description="Unique products" />
      </div>

      <Card>
        <CardHeader><CardTitle>Production Cost Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionCosts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No production records found. Click &quot;Record Production&quot; to add one.</TableCell></TableRow>
              ) : (
                productionCosts.map((pc) => (
                  <TableRow key={pc.id}>
                    <TableCell className="font-medium">{pc.product?.name || "Unknown"}</TableCell>
                    <TableCell>{pc.type}</TableCell>
                    <TableCell>{pc.category || "-"}</TableCell>
                    <TableCell>{pc.quantity ? `${pc.quantity} ${pc.unit || ""}` : "-"}</TableCell>
                    <TableCell>₱{Number(pc.amount).toLocaleString()}</TableCell>
                    <TableCell>{new Date(pc.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
