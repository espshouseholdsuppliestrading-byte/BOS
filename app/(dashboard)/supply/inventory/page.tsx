import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, AlertTriangle } from "lucide-react"

export default async function InventoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) { redirect("/login") }

  const products = [
    { id: "1", code: "RM-001", name: "Plastic Pellets", category: "Raw Material", stock: 15000, minStock: 5000, maxStock: 25000, unit: "kg", location: "Warehouse A" },
    { id: "2", code: "RM-002", name: "Steel Sheets", category: "Raw Material", stock: 8000, minStock: 3000, maxStock: 15000, unit: "sheets", location: "Warehouse B" },
    { id: "3", code: "PK-001", name: "Packaging Boxes", category: "Packaging", stock: 20000, minStock: 10000, maxStock: 50000, unit: "pieces", location: "Warehouse A" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Raw materials and packaging stock</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Product</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Products</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">150</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Stock Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₱5,000,000</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">3</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
                <TableHead>Stock</TableHead><TableHead>Min/Max</TableHead><TableHead>Location</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock.toLocaleString()} {product.unit}</TableCell>
                  <TableCell>{product.minStock.toLocaleString()} / {product.maxStock.toLocaleString()}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell><Badge variant={product.stock < product.minStock ? "warning" : "success"}>
                    {product.stock < product.minStock ? "Low Stock" : "In Stock"}
                  </Badge></TableCell>
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
