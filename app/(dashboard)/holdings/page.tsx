import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, Package } from "lucide-react"

export default async function HoldingsDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ESPS Holdings</h1>
        <p className="text-muted-foreground">Mother Company Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Companies" value="3" icon={Building2} description="Active operating companies" />
        <StatsCard title="Total Users" value="25" icon={Users} description="Across all companies" />
        <StatsCard title="Total Revenue" value="₱2,500,000" icon={TrendingUp} description="Current month" />
        <StatsCard title="Total Products" value="150" icon={Package} description="Raw materials + finished goods" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>ESPS Supply Corporation</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ESPS Manufacturing</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ESPS Sales & Marketing</span>
                <span className="text-yellow-600 font-medium">Planned</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-medium">New user registered</p>
                <p className="text-muted-foreground">John Doe - ESPS Supply Corp</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Purchase order received</p>
                <p className="text-muted-foreground">PO-2024-001 - ₱150,000</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Sales target achieved</p>
                <p className="text-muted-foreground">ESPS Manufacturing - 100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
