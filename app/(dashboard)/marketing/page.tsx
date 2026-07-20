"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, ShoppingCart, DollarSign, Package } from "lucide-react"

interface DashboardData {
  agents: { total: number; active: number }
  distributors: { total: number; active: number }
  territories: number
  products: number
  orders: number
  payouts: { pending: number; approved: number }
  commissions: { pending: number }
  recentOrders: Array<{
    id: string; orderNumber: string; totalAmount: number; status: string; paymentStatus: string
    client: { name: string }; salesAgent: { name: string } | null; createdAt: string
  }>
}

export default function MarketingDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/marketing/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!data) return <div className="p-6">Failed to load dashboard</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">ESPS Sales & Marketing Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Agents" value={data.agents.total} icon={Users} description={`${data.agents.active} active`} />
        <StatsCard title="Distributors" value={data.distributors.total} icon={Users} description={`${data.distributors.active} active`} />
        <StatsCard title="Territories" value={data.territories} icon={MapPin} description="Covered areas" />
        <StatsCard title="Products" value={data.products} icon={Package} description="In catalog" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Orders" value={data.orders} icon={ShoppingCart} description="All time" />
        <StatsCard title="Pending Payouts" value={data.payouts.pending} icon={DollarSign} description="Awaiting approval" />
        <StatsCard title="Approved Payouts" value={data.payouts.approved} icon={DollarSign} description="Ready to release" />
        <StatsCard title="Pending Commissions" value={`₱${Number(data.commissions.pending).toLocaleString()}`} icon={DollarSign} description="To be paid" />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>{order.client?.name}</TableCell>
                  <TableCell>{order.salesAgent?.name || "-"}</TableCell>
                  <TableCell>₱{Number(order.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge></TableCell>
                  <TableCell><Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>{order.paymentStatus}</Badge></TableCell>
                </TableRow>
              ))}
              {data.recentOrders.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No orders yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
