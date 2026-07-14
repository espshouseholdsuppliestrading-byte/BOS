import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const clients = [
    { id: "C001", name: "ABC Manufacturing", type: "Raw Material Client", phone: "+63 917 123 4567", status: "Active" },
    { id: "C002", name: "XYZ Industries", type: "Dealer", phone: "+63 918 234 5678", status: "Active" },
    { id: "C003", name: "DEF Corp", type: "Distributor", phone: "+63 919 345 6789", status: "Active" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Clients</h1><p className="text-muted-foreground">Customer database and CRM</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Client</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell><TableCell>{client.name}</TableCell><TableCell>{client.type}</TableCell><TableCell>{client.phone}</TableCell>
                  <TableCell><Badge variant="success">{client.status}</Badge></TableCell>
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
