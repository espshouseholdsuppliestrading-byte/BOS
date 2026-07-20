"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, DollarSign, MapPin, Wallet } from "lucide-react"

interface Territory {
  id: string
  name: string
  type: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  territory: Territory | null
  company: { name: string }
}

interface OrderItem {
  id: string
  quantity: number
  sellingPrice: number
  product: { name: string }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  client: { name: string }
  items: OrderItem[]
}

interface Commission {
  id: string
  amount: number
  type: string
  status: string
  createdAt: string
  order: { orderNumber: string }
}

interface Payout {
  id: string
  totalAmount: number
  status: string
  weekStarting: string
  weekEnding: string
}

interface MeData {
  user: User
  agentOrders: Order[]
  distributorOrders: Order[]
  commissions: Commission[]
  payouts: Payout[]
}

export default function AgentDashboard() {
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

  const { user, agentOrders, commissions, payouts } = data
  const totalAgentOrders = agentOrders.length
  const pendingCommissions = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount), 0)
  const totalPayoutsReceived = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.totalAmount), 0)

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
        <StatsCard title="My Orders" value={totalAgentOrders} icon={ShoppingCart} description="Total orders placed" />
        <StatsCard title="Pending Commissions" value={`₱${pendingCommissions.toLocaleString()}`} icon={DollarSign} description="Awaiting payment" />
        <StatsCard title="Total Earned" value={`₱${totalCommissions.toLocaleString()}`} icon={Wallet} description="All-time commissions" />
        <StatsCard title="Territory" value={user.territory?.name || "Unassigned"} icon={MapPin} description={user.territory?.type || ""} />
      </div>

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
              {agentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>{order.client.name}</TableCell>
                  <TableCell>₱{Number(order.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge></TableCell>
                  <TableCell><Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>{order.paymentStatus}</Badge></TableCell>
                </TableRow>
              ))}
              {agentOrders.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No orders yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Commission Summary</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.order.orderNumber}</TableCell>
                  <TableCell className="capitalize">{c.type}</TableCell>
                  <TableCell>₱{Number(c.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={c.status === "paid" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {commissions.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No commissions yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
