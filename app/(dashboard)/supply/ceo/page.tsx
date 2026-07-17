"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, AlertTriangle, Receipt } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface SalesOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  items: { costPrice: number; quantity: number; total: number }[]
}

interface Product {
  id: string
  name: string
  code: string
  category: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  minimumStock: number
}

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  createdAt: string
}

interface PurchaseOrder {
  id: string
  status: string
}

const formatCurrency = (value: number) => `₱${value.toLocaleString()}`

export default function SupplyCEODashboard() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/sales-orders").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/purchase-orders").then((r) => r.json()),
    ]).then(([so, p, ex, po]) => {
      setSalesOrders(Array.isArray(so) ? so : [])
      setProducts(Array.isArray(p) ? p : [])
      setExpenses(Array.isArray(ex) ? ex : [])
      setPurchaseOrders(Array.isArray(po) ? po : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalRevenue = salesOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = totalRevenue - totalExpenses
  const inventoryValue = products.reduce((sum, p) => sum + Number(p.costPrice) * p.currentStock, 0)
  const lowStockItems = products.filter((p) => p.currentStock <= p.minimumStock).length
  const pendingPOs = purchaseOrders.filter((po) => ["pending", "approved"].includes(po.status)).length

  const monthlyData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    return months.slice(0, now.getMonth() + 1).map((month, i) => {
      const monthOrders = salesOrders.filter((o) => {
        const d = new Date(o.createdAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === i
      })
      return {
        month,
        revenue: monthOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
        expenses: expenses.filter((e) => {
          const d = new Date(e.date)
          return d.getFullYear() === now.getFullYear() && d.getMonth() === i
        }).reduce((s, e) => s + Number(e.amount), 0),
      }
    })
  })()

  const topProducts = [...products]
    .sort((a, b) => (Number(b.sellingPrice) * b.currentStock) - (Number(a.sellingPrice) * a.currentStock))
    .slice(0, 5)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading CEO Dashboard...</p></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CEO Dashboard</h1>
        <p className="text-muted-foreground">ESPS Supply Corporation Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{salesOrders.length} sales orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} expense entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(netProfit)}</div>
            <p className="text-xs text-muted-foreground">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}% margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
            <p className="text-xs text-muted-foreground">{products.length} products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Below minimum stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPOs}</div>
            <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesOrders.length}</div>
            <p className="text-xs text-muted-foreground">All time sales orders</p>
          </CardContent>
        </Card>
      </div>

      {monthlyData.some((m) => m.revenue > 0) && (
        <Card>
          <CardHeader><CardTitle>Monthly Sales</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Sales Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            {salesOrders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No sales orders yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                      <TableCell><Badge variant={order.status === "delivered" ? "success" : "secondary"}>{order.status}</Badge></TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No products yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Sell Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.currentStock}</TableCell>
                      <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                      <TableCell>
                        <Badge variant={product.currentStock > product.minimumStock ? "success" : "destructive"}>
                          {product.currentStock > product.minimumStock ? "In Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
