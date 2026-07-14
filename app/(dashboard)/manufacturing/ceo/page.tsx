import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Factory, TrendingUp, Package, DollarSign } from "lucide-react"

export default async function ManufacturingCEODashboard() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const products = [
    { name: "DIY Kit - Basic", type: "DIY", stock: 500, status: "In Stock" },
    { name: "Refill Pack - 1L", type: "Refill", stock: 1200, status: "In Stock" },
    { name: "Finished Product A", type: "Finished", stock: 300, status: "Low Stock" },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">CEO Dashboard</h1><p className="text-muted-foreground">ESPS Manufacturing Overview</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Production" value="1,200 units" icon={Factory} description="This month" />
        <StatsCard title="Revenue" value="₱1,800,000" icon={TrendingUp} description="From product sales" />
        <StatsCard title="Production Cost" value="₱900,000" icon={DollarSign} description="Raw materials + labor" />
        <StatsCard title="Finished Goods" value="₱2,500,000" icon={Package} description="Inventory value" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Production by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span>DIY Products</span><span className="font-medium">450 units</span></div>
              <div className="flex items-center justify-between"><span>Refill Products</span><span className="font-medium">600 units</span></div>
              <div className="flex items-center justify-between"><span>Finished Products</span><span className="font-medium">150 units</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Product Inventory</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Type</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell><TableCell>{product.type}</TableCell><TableCell>{product.stock}</TableCell>
                    <TableCell><Badge variant={product.status === "In Stock" ? "success" : "warning"}>{product.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
