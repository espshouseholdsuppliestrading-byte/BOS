"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Plus, Upload, Download } from "lucide-react"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  category: string
  unit: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  minimumStock: number
}

function getStatus(stock: number, minStock: number) {
  if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
  if (stock <= minStock) return { label: "Low Stock", variant: "warning" as const }
  return { label: "In Stock", variant: "success" as const }
}

export default function ManufacturingInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    category: "raw_material",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    minimumStock: "",
    unit: "",
  })
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: { row: number; error: string }[] } | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch("/api/products")
    if (res.ok) {
      const data = await res.json()
      setProducts(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        category: form.category,
        source: "manufacturing",
        unit: form.unit,
        costPrice: parseFloat(form.costPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        currentStock: parseInt(form.currentStock) || 0,
        minimumStock: parseInt(form.minimumStock) || 0,
        maximumStock: 0,
        status: "active",
      }),
    })
    setForm({ name: "", code: "", description: "", category: "raw_material", costPrice: "", sellingPrice: "", currentStock: "", minimumStock: "", unit: "" })
    setOpen(false)
    setSubmitting(false)
    fetchProducts()
  }

  const handleDownloadTemplate = () => {
    const headers = ["name", "code", "description", "category", "costPrice", "sellingPrice", "currentStock", "minimumStock", "unit", "source"]
    const csv = headers.join(",") + "\nSample Product,SAMPLE001,Description here,raw_material,100,150,50,10,kg,manufacturing\n"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "product_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResults(null)

    const text = await importFile.text()
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      setImportResults({ success: 0, failed: 0, errors: [{ row: 0, error: "File must contain a header row and at least one data row" }] })
      setImporting(false)
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || "" })
      return row
    })

    const res = await fetch("/api/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: rows }),
    })

    const data = await res.json()
    setImportResults({
      success: data.success ?? 0,
      failed: data.failed ?? 0,
      errors: data.errors ?? [],
    })
    setImporting(false)
    fetchProducts()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Raw materials and finished goods stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setImportDialogOpen(true); setImportResults(null); setImportFile(null) }}>
            <Upload className="mr-2 h-4 w-4" />Import Products
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_material">Raw Material</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="diy">DIY</SelectItem>
                    <SelectItem value="refill">Refill</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input id="costPrice" type="number" step="0.01" required value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input id="sellingPrice" type="number" step="0.01" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input id="currentStock" type="number" required value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Minimum Stock</Label>
                  <Input id="minimumStock" type="number" required value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" required placeholder="e.g. kg, pieces, liters" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Products</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />Download Template
              </Button>
              <div className="space-y-2">
                <Label htmlFor="import-file">Select CSV File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button className="w-full" disabled={!importFile || importing} onClick={handleImport}>
                {importing ? "Importing..." : "Import"}
              </Button>
              {importResults && (
                <div className="rounded-md border p-4 space-y-2 text-sm">
                  <p className="font-medium">Import Results</p>
                  <p className="text-green-600">{importResults.success} products imported successfully</p>
                  {importResults.failed > 0 && (
                    <>
                      <p className="text-red-600">{importResults.failed} products failed</p>
                      <ul className="list-disc list-inside text-red-600 space-y-1">
                        {importResults.errors.map((err, i) => (
                          <li key={i}>Row {err.row}: {err.error}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Products</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">No products found. Add one to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const status = getStatus(p.currentStock, p.minimumStock)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.code}</TableCell>
                      <TableCell className="capitalize">{p.category.replace(/_/g, " ")}</TableCell>
                      <TableCell>{p.currentStock.toLocaleString()} {p.unit}</TableCell>
                      <TableCell>{p.minimumStock.toLocaleString()}</TableCell>
                      <TableCell>₱{Number(p.costPrice).toLocaleString()}</TableCell>
                      <TableCell>₱{Number(p.sellingPrice).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
