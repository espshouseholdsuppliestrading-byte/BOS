"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface InventoryEntry {
  id: string
  quantity: number
  available: number
  reserved: number
  costPrice: number
  lastRestocked: string | null
  distributor: { id: string; name: string; email: string }
  product: { id: string; name: string; code: string; sellingPrice: number }
}

interface Distributor {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  name: string
  code: string
  costPrice: number
}

export default function DistributorInventoryPage() {
  const [inventory, setInventory] = useState<InventoryEntry[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterDistributor, setFilterDistributor] = useState("all")
  const [filterLowStock, setFilterLowStock] = useState(false)

  const [form, setForm] = useState({
    distributorId: "",
    productId: "",
    quantity: "",
    costPrice: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let url = "/api/marketing/distributor-inventory"
    const params = new URLSearchParams()
    if (filterDistributor !== "all") params.set("distributorId", filterDistributor)
    if (filterLowStock) params.set("lowStock", "true")
    if (params.toString()) url += "?" + params.toString()

    fetch(url)
      .then((r) => r.json())
      .then((data) => setInventory(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [filterDistributor, filterLowStock])

  const loadData = async () => {
    try {
      const [inv, dist, prod] = await Promise.all([
        fetch("/api/marketing/distributor-inventory").then((r) => r.json()),
        fetch("/api/marketing/distributors").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
      ])
      setInventory(Array.isArray(inv) ? inv : [])
      setDistributors(Array.isArray(dist) ? dist : [])
      setProducts(Array.isArray(prod) ? prod : [])
    } catch {}
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.distributorId || !form.productId || !form.quantity) return

    await fetch("/api/marketing/distributor-inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distributorId: form.distributorId,
        productId: form.productId,
        quantity: parseInt(form.quantity),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
      }),
    })

    setDialogOpen(false)
    setForm({ distributorId: "", productId: "", quantity: "", costPrice: "" })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inventory entry?")) return
    await fetch(`/api/marketing/distributor-inventory/${id}`, { method: "DELETE" })
    loadData()
  }

  const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0)
  const lowStockCount = inventory.filter((i) => i.quantity < 10).length

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Distributor Inventory</h1>
        <Button onClick={() => setDialogOpen(true)}>Add Stock</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Items</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalQuantity}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Low Stock (&lt;10)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{lowStockCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Entries</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{inventory.length}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={filterDistributor} onValueChange={setFilterDistributor}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Distributors" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Distributors</SelectItem>
            {distributors.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant={filterLowStock ? "default" : "outline"} onClick={() => setFilterLowStock(!filterLowStock)}>
          Low Stock Only
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distributor</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.distributor.name}</TableCell>
                  <TableCell>{entry.product.name}</TableCell>
                  <TableCell>
                    <Badge variant={entry.quantity < 10 ? "destructive" : "default"}>{entry.quantity}</Badge>
                  </TableCell>
                  <TableCell>{entry.available}</TableCell>
                  <TableCell>{entry.reserved}</TableCell>
                  <TableCell>₱{Number(entry.costPrice).toLocaleString()}</TableCell>
                  <TableCell>{entry.lastRestocked ? new Date(entry.lastRestocked).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No inventory entries</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Distributor</Label>
              <Select value={form.distributorId} onValueChange={(v) => setForm({ ...form, distributorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select distributor" /></SelectTrigger>
                <SelectContent>
                  {distributors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <Label>Cost Price (optional)</Label>
              <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            <Button onClick={handleSubmit} className="w-full">Add Stock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
