import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, DollarSign } from "lucide-react"

export default async function ManufacturingSalesPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const sales = [
    { product: "DIY Kit - Basic", type: "DIY", sold: 150, revenue: 450000 },
    { product: "Refill Pack - 1L", type: "Refill", sold: 400, revenue: 320000 },
    { product: "Finished Product A", type: "Finished", sold: 80, revenue: 640000 },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Sales</h1><p className="text-muted-foreground">Product sales by category</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="DIY Products" value="₱450,000" icon={Package} description="150 units sold" />
        <StatsCard title="Refill Products" value="₱320,000" icon={Package} description="400 units sold" />
        <StatsCard title="Finished Products" value="₱640,000" icon={DollarSign} description="80 units sold" />
      </div>
      <Card>
        <CardHeader><CardTitle>Sales by Product Type</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Type</TableHead><TableHead>Units Sold</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {sales.map((item) => (
                <TableRow key={item.product}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                  <TableCell>{item.sold}</TableCell>
                  <TableCell>₱{item.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
