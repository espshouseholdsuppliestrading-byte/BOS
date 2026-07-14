import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react"

export default async function SupplyCEODashboard() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const salesData = [
    { name: "Mon", sales: 4000 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 5000 },
    { name: "Thu", sales: 4500 },
    { name: "Fri", sales: 6000 },
    { name: "Sat", sales: 3500 },
    { name: "Sun", sales: 2000 },
  ]

  const topMaterials = [
    { name: "Plastic Pellets", stock: 15000, status: "Good" },
    { name: "Steel Sheets", stock: 8000, status: "Good" },
    { name: "Chemical Solvent", stock: 2500, status: "Low" },
    { name: "Packaging Boxes", stock: 20000, status: "Good" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CEO Dashboard</h1>
        <p className="text-muted-foreground">ESPS Supply Corporation Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Daily Sales" value="₱125,000" icon={TrendingUp} description="Today's revenue" />
        <StatsCard title="Monthly Sales" value="₱2,500,000" icon={DollarSign} description="This month" />
        <StatsCard title="Inventory Value" value="₱5,000,000" icon={Package} description="Total stock value" />
        <StatsCard title="Pending Orders" value="12" icon={ShoppingCart} description="Awaiting fulfillment" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Gross Profit" value="₱750,000" icon={TrendingUp} description="30% margin" />
        <StatsCard title="Net Profit" value="₱500,000" icon={DollarSign} description="20% margin" />
        <StatsCard title="Cash Collection" value="₱1,800,000" icon={DollarSign} description="Collected this month" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Weekly Sales" data={salesData} dataKey="sales" xAxisKey="name" />

        <Card>
          <CardHeader>
            <CardTitle>Top Raw Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMaterials.map((material) => (
                <div key={material.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-muted-foreground">{material.stock.toLocaleString()} units</p>
                  </div>
                  <span className={material.status === "Good" ? "text-green-600" : "text-yellow-600"}>
                    {material.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Customers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ABC Manufacturing</p>
                  <p className="text-sm text-muted-foreground">₱500,000 total purchases</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">XYZ Industries</p>
                  <p className="text-sm text-muted-foreground">₱350,000 total purchases</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Slow Moving Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chemical Solvent A</p>
                  <p className="text-sm text-muted-foreground">Last sold 45 days ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Specialty Resin</p>
                  <p className="text-sm text-muted-foreground">Last sold 30 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
