import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react"

export default async function ManufacturingFinancePage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Finance</h1><p className="text-muted-foreground">Production costs and revenue</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Revenue" value="₱1,800,000" icon={TrendingUp} description="Product sales" />
        <StatsCard title="Production Cost" value="₱900,000" icon={TrendingDown} description="Materials + labor" />
        <StatsCard title="Gross Profit" value="₱900,000" icon={DollarSign} description="50% margin" />
        <StatsCard title="Cost per Unit" value="₱500" icon={Calculator} description="Average" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span>Raw Materials</span><span className="font-medium">₱600,000</span></div>
              <div className="flex items-center justify-between"><span>Labor</span><span className="font-medium">₱200,000</span></div>
              <div className="flex items-center justify-between"><span>Overhead</span><span className="font-medium">₱100,000</span></div>
              <div className="border-t pt-4"><div className="flex items-center justify-between font-semibold"><span>Total Production Cost</span><span>₱900,000</span></div></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span>DIY Products</span><span className="font-medium">₱450,000</span></div>
              <div className="flex items-center justify-between"><span>Refill Products</span><span className="font-medium">₱320,000</span></div>
              <div className="flex items-center justify-between"><span>Finished Products</span><span className="font-medium">₱640,000</span></div>
              <div className="border-t pt-4"><div className="flex items-center justify-between font-semibold"><span>Total Revenue</span><span>₱1,410,000</span></div></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
