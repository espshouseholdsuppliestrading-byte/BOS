"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, DollarSign, Package, Wallet } from "lucide-react"

interface Territory {
  id: string
  name: string
  type: string
}

interface DistributorInventoryItem {
  id: string
  quantity: number
  available: number
  reserved: number
  costPrice: number
  product: { name: string; code: string }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  territory: Territory | null
  company: { name: string }
  distributorInventory: DistributorInventoryItem[]
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  client: { name: string }
}

interface Commission {
  id: string
  amount: number
  type: string
  status: string
  createdAt: string
  order: { orderNumber: string }
}

interface MeData {
  user: User
  agentOrders: Order[]
  distributorOrders: Order[]
  commissions: Commission[]
}

export default function DistributorDashboard() {
  const [data, setData] = useState<MeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/marketing/me")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!data) return <div className="p-6">Failed to load dashboard</div>

  const { user, distributorOrders, commissions } = data
  const inventory = data.user.distributorInventory
  const totalInventoryItems = inventory?.length || 0
  const totalDistributorOrders = distributorOrders.length
  const pendingCommissions = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">
          {user.territory ? `${user.territory.name} — ` : ""}
          {user.company.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="My Orders" value={totalDistributorOrders} icon={ShoppingCart} description="Orders as distributor" />
        <StatsCard title="Inventory Items" value={totalInventoryItems} icon={Package} description="Products in stock" />
        <StatsCard title="Pending Commissions" value={`₱${pendingCommissions.toLocaleString()}`} icon={DollarSign} description="Awaiting payment" />
        <StatsCard title="Total Earned" value={`₱${totalEarned.toLocaleString()}`} icon={Wallet} description="All-time commissions" />
      </div>

      <Card>
        <CardHeader><CardTitle>My Inventory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Cost Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.product.code}</TableCell>
                  <TableCell>{item.available}</TableCell>
                  <TableCell>{item.reserved}</TableCell>
                  <TableCell>₱{Number(item.costPrice).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {(!inventory || inventory.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No inventory items</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributorOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>{order.client.name}</TableCell>
                  <TableCell>₱{Number(order.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge></TableCell>
                  <TableCell><Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>{order.paymentStatus}</Badge></TableCell>
                </TableRow>
              ))}
              {distributorOrders.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No orders yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
