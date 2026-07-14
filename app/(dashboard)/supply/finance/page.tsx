import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react"

export default async function FinancePage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const invoices = [
    { id: "INV-001", client: "ABC Manufacturing", amount: 150000, status: "paid", dueDate: "2024-01-20" },
    { id: "INV-002", client: "XYZ Industries", amount: 85000, status: "pending", dueDate: "2024-01-25" },
    { id: "INV-003", client: "DEF Corp", amount: 220000, status: "overdue", dueDate: "2024-01-10" },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Finance</h1><p className="text-muted-foreground">Financial overview and reports</p></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Revenue" value="₱2,500,000" icon={TrendingUp} description="This month" />
        <StatsCard title="Expenses" value="₱1,200,000" icon={TrendingDown} description="This month" />
        <StatsCard title="Net Profit" value="₱1,300,000" icon={DollarSign} description="52% margin" />
        <StatsCard title="Outstanding" value="₱305,000" icon={CreditCard} description="Pending payments" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cash Flow Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span>Inflow (Sales)</span><span className="text-green-600 font-medium">₱2,500,000</span></div>
              <div className="flex items-center justify-between"><span>Outflow (Purchases)</span><span className="text-red-600 font-medium">-₱1,200,000</span></div>
              <div className="border-t pt-4"><div className="flex items-center justify-between font-semibold"><span>Net Cash Flow</span><span className="text-green-600">₱1,300,000</span></div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Client</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>₱{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "destructive" : "warning"}>{invoice.status}</Badge></TableCell>
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
