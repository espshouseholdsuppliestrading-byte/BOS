"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, ShoppingCart, DollarSign, MapPin } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  territoryId: string | null
  territory: { id: string; name: string; type: string } | null
}

interface Agent {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentStatus: string
  client: { name: string }
  salesAgent: { name: string } | null
  createdAt: string
}

interface DashboardData {
  activeAgents: number
  totalOrders: number
  totalCommissions: number
  pendingPayouts: number
  recentOrders: Order[]
}

export default function TerritoryDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/marketing/me").then((r) => r.json()),
      fetch("/api/marketing/dashboard").then((r) => r.json()),
    ])
      .then(([profileData, dashboardData]) => {
        setProfile(profileData)
        setData(dashboardData)

        if (profileData?.territoryId) {
          fetch(`/api/marketing/agents?territoryId=${profileData.territoryId}`)
            .then((r) => r.json())
            .then(setAgents)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!profile) return <div className="p-6">Failed to load profile</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {profile.territory?.name || "No territory assigned"} • Territory Partner
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Agents"
          value={agents.filter((a) => a.status === "active").length}
          icon={Users}
          description="In my territory"
        />
        <StatsCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          icon={ShoppingCart}
          description="In my territory"
        />
        <StatsCard
          title="My Commissions"
          value={`₱${Number(data?.totalCommissions || 0).toLocaleString()}`}
          icon={DollarSign}
          description="Total earned"
        />
        <StatsCard
          title="Pending Payouts"
          value={`₱${Number(data?.pendingPayouts || 0).toLocaleString()}`}
          icon={DollarSign}
          description="Awaiting payout"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents in My Territory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No agents in your territory yet
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {agent.role === "SALES_AGENT" ? "Sales Agent" : "Reseller"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.status === "active" ? "default" : "destructive"}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders in My Territory</CardTitle>
        </CardHeader>
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
              {data?.recentOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>{order.client?.name}</TableCell>
                  <TableCell>{order.salesAgent?.name || "-"}</TableCell>
                  <TableCell>₱{Number(order.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No orders yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}