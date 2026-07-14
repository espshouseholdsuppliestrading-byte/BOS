import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const suppliers = [
    { id: "S001", name: "Global Materials Inc", contact: "John Smith", phone: "+1 555 123 4567", status: "Active" },
    { id: "S002", name: "Packaging Solutions", contact: "Jane Doe", phone: "+1 555 234 5678", status: "Active" },
    { id: "S003", name: "Chemical Supplies Co", contact: "Mike Johnson", phone: "+1 555 345 6789", status: "Active" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Suppliers</h1><p className="text-muted-foreground">Supplier database and management</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Supplier</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.id}</TableCell><TableCell>{supplier.name}</TableCell><TableCell>{supplier.contact}</TableCell><TableCell>{supplier.phone}</TableCell>
                  <TableCell><Badge variant="success">{supplier.status}</Badge></TableCell>
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
