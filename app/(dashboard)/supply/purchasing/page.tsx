import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ShoppingCart, Clock, CheckCircle } from "lucide-react"

export default async function PurchasingPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const orders = [
    { id: "PO-001", supplier: "Global Materials Inc", amount: 350000, status: "received", date: "2024-01-10" },
    { id: "PO-002", supplier: "Packaging Solutions", amount: 120000, status: "pending", date: "2024-01-12" },
    { id: "PO-003", supplier: "Chemical Supplies Co", amount: 280000, status: "approved", date: "2024-01-14" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchasing</h1>
          <p className="text-muted-foreground">Manage purchase orders and suppliers</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />New Purchase Order</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₱1,200,000</div><p className="text-xs text-muted-foreground">This month</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">5</div><p className="text-xs text-muted-foreground">Awaiting delivery</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">28</div><p className="text-xs text-muted-foreground">This month</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Purchase Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead><TableHead>Supplier</TableHead><TableHead>Amount</TableHead>
                <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>₱{order.amount.toLocaleString()}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell><Badge variant={order.status === "received" ? "success" : order.status === "pending" ? "warning" : "secondary"}>{order.status}</Badge></TableCell>
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
