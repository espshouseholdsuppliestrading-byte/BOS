"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Factory, TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  code: string
  category: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  minimumStock: number
  status: string
}

interface ProductionCost {
  id: string
  productId: string
  product: { name: string }
  type: string
  amount: number
  quantity: number | null
  date: string
}

interface SalesOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  items: { costPrice: number; sellingPrice: number; quantity: number; total: number }[]
  createdAt: string
}

interface Expense {
  id: string
  category: string
  amount: number
  description: string | null
  date: string
}

export default function ManufacturingCEODashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [productionCosts, setProductionCosts] = useState<ProductionCost[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/production-costs").then((r) => r.json()),
      fetch("/api/sales-orders").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
    ]).then(([p, pc, so, ex]) => {
      setProducts(Array.isArray(p) ? p : [])
      setProductionCosts(Array.isArray(pc) ? pc : [])
      setSalesOrders(Array.isArray(so) ? so : [])
      setExpenses(Array.isArray(ex) ? ex : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalRevenue = salesOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const totalProductionCost = productionCosts.reduce((sum, pc) => sum + Number(pc.amount), 0)
  const totalCOGS = salesOrders.reduce((sum, o) => {
    return sum + o.items.reduce((s, i) => s + Number(i.costPrice) * i.quantity, 0)
  }, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const grossProfit = totalRevenue - totalCOGS
  const netProfit = grossProfit - totalExpenses
  const inventoryValue = products.reduce((sum, p) => sum + Number(p.costPrice) * p.currentStock, 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CEO Dashboard</h1>
        <p className="text-muted-foreground">ESPS Manufacturing Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={TrendingUp} description="From sales orders" />
        <StatsCard title="Production Cost" value={`₱${totalProductionCost.toLocaleString()}`} icon={Factory} description="Raw materials + labor" />
        <StatsCard title="Gross Profit" value={`₱${grossProfit.toLocaleString()}`} icon={DollarSign} description="Revenue minus COGS" />
        <StatsCard title="Net Profit" value={`₱${netProfit.toLocaleString()}`} icon={DollarSign} description="After expenses" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COGS</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalCOGS.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cost of goods sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Operating expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">At cost price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Total products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Product Inventory</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">No products found.</TableCell></TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.currentStock}</TableCell>
                      <TableCell>₱{Number(product.costPrice).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.currentStock > product.minimumStock ? "default" : "destructive"}>
                          {product.currentStock > product.minimumStock ? "In Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Sales Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order#</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No sales orders found.</TableCell></TableRow>
                ) : (
                  salesOrders.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>₱{Number(order.totalAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
