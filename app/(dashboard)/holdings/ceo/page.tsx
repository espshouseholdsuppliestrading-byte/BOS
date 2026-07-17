"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Building2, Users, Package, DollarSign } from "lucide-react"

interface Company {
  id: string
  code: string
  name: string
  industry: string
  status: string
  _count: { users: number; products: number; salesOrders: number }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  company: { name: string; id: string }
}

export default function CeoDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([companiesData, usersData]) => {
      setCompanies(companiesData)
      setUsers(usersData)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CEO Dashboard</h1>
          <p className="text-muted-foreground">Overview of all companies</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalUsers = users.length
  const totalProducts = companies.reduce((sum, c) => sum + c._count.products, 0)
  const totalSalesOrders = companies.reduce((sum, c) => sum + c._count.salesOrders, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CEO Dashboard</h1>
        <p className="text-muted-foreground">Overview of all companies</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Companies"
          value={companies.length}
          icon={Building2}
          description="Active operating companies"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description="Across all companies"
        />
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          description="Raw materials + finished goods"
        />
        <StatsCard
          title="Total Sales Orders"
          value={totalSalesOrders}
          icon={DollarSign}
          description="All companies combined"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      {company.name}
                    </TableCell>
                    <TableCell>{company._count.users}</TableCell>
                    <TableCell>{company._count.products}</TableCell>
                    <TableCell>{company._count.salesOrders}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          company.status === "active" ? "success" : "secondary"
                        }
                      >
                        {company.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {companies.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(-5).reverse().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.company?.name ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
