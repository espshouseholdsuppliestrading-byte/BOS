"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Building2, Users, Package, TrendingUp } from "lucide-react"

interface Company {
  id: string
  code: string
  name: string
  industry: string | null
  address: string | null
  phone: string | null
  email: string | null
  status: string
  createdAt: string
  _count: {
    users: number
    products: number
    salesOrders: number
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage ESPS Holdings and operating companies</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Company</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-xs text-muted-foreground">Total Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {companies.reduce((sum, c) => sum + c._count.users, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {companies.reduce((sum, c) => sum + c._count.products, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {companies.reduce((sum, c) => sum + c._count.salesOrders, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Sales Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Sales Orders</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No companies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.code}</TableCell>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry ?? "—"}</TableCell>
                      <TableCell>{company.address ?? "—"}</TableCell>
                      <TableCell className="text-center">{company._count.users}</TableCell>
                      <TableCell className="text-center">{company._count.products}</TableCell>
                      <TableCell className="text-center">{company._count.salesOrders}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === "ACTIVE" ? "success" : "secondary"}>
                          {company.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
