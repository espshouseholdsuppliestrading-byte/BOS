import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default async function ProductionPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const orders = [
    { id: "MO-001", product: "DIY Kit - Basic", quantity: 200, status: "in_progress", startDate: "2024-01-14" },
    { id: "MO-002", product: "Refill Pack - 1L", quantity: 500, status: "completed", startDate: "2024-01-12" },
    { id: "MO-003", product: "Finished Product A", quantity: 100, status: "pending", startDate: "2024-01-15" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Production</h1><p className="text-muted-foreground">Manufacturing orders and production tracking</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />New Production Order</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">In Progress</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">3</div><p className="text-xs text-muted-foreground">Active orders</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">25</div><p className="text-xs text-muted-foreground">This month</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">5</div><p className="text-xs text-muted-foreground">Awaiting materials</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Manufacturing Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Product</TableHead><TableHead>Quantity</TableHead><TableHead>Start Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell><TableCell>{order.product}</TableCell><TableCell>{order.quantity} units</TableCell><TableCell>{order.startDate}</TableCell>
                  <TableCell><Badge variant={order.status === "completed" ? "success" : order.status === "in_progress" ? "default" : "secondary"}>{order.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
