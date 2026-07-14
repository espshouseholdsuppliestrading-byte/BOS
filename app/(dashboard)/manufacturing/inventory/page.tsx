import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, AlertTriangle } from "lucide-react"

export default async function ManufacturingInventoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const rawMaterials = [
    { name: "Plastic Pellets", stock: 5000, unit: "kg", status: "Good" },
    { name: "Chemical Solvent", stock: 800, unit: "liters", status: "Low" },
  ]
  const finishedGoods = [
    { name: "DIY Kit - Basic", stock: 500, unit: "pieces", status: "Good" },
    { name: "Refill Pack - 1L", stock: 1200, unit: "pieces", status: "Good" },
    { name: "Finished Product A", stock: 300, unit: "pieces", status: "Low" },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Inventory</h1><p className="text-muted-foreground">Raw materials and finished goods stock</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Raw Materials</CardTitle><Package className="h-5 w-5 text-muted-foreground" /></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {rawMaterials.map((m) => (
                  <TableRow key={m.name}><TableCell className="font-medium">{m.name}</TableCell><TableCell>{m.stock.toLocaleString()} {m.unit}</TableCell>
                    <TableCell><Badge variant={m.status === "Good" ? "success" : "warning"}>{m.status}</Badge></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Finished Goods</CardTitle><AlertTriangle className="h-5 w-5 text-muted-foreground" /></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {finishedGoods.map((p) => (
                  <TableRow key={p.name}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.stock.toLocaleString()} {p.unit}</TableCell>
                    <TableCell><Badge variant={p.status === "Good" ? "success" : "warning"}>{p.status}</Badge></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
