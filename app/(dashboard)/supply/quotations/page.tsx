import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function QuotationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const quotations = [
    { id: "Q-001", client: "ABC Manufacturing", amount: 250000, status: "sent", validUntil: "2024-01-30" },
    { id: "Q-002", client: "XYZ Industries", amount: 180000, status: "accepted", validUntil: "2024-01-25" },
    { id: "Q-003", client: "DEF Corp", amount: 320000, status: "draft", validUntil: "2024-02-01" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Quotations</h1><p className="text-muted-foreground">Price quotes for clients</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />New Quotation</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Quote #</TableHead><TableHead>Client</TableHead><TableHead>Amount</TableHead><TableHead>Valid Until</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {quotations.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.id}</TableCell><TableCell>{quote.client}</TableCell><TableCell>₱{quote.amount.toLocaleString()}</TableCell><TableCell>{quote.validUntil}</TableCell>
                  <TableCell><Badge variant={quote.status === "accepted" ? "success" : quote.status === "sent" ? "default" : "secondary"}>{quote.status}</Badge></TableCell>
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
