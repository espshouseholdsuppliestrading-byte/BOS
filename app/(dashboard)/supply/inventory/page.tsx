"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Upload, Download } from "lucide-react"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  category: string
  source: string
  unit: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  minimumStock: number
  maximumStock: number
  warehouseLocation?: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: { row: number; error: string }[] } | null>(null)
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    category: "raw_material",
    source: "local",
    unit: "",
    costPrice: "",
    sellingPrice: "",
    minimumStock: "",
    maximumStock: "",
    warehouseLocation: "",
  })

  const fetchProducts = async () => {
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

  const totalStockValue = products.reduce(
    (sum, p) => sum + p.costPrice * p.currentStock,
    0
  )

  const lowStockCount = products.filter((p) => p.currentStock <= p.minimumStock).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        name: form.name,
        description: form.description || null,
        category: form.category,
        source: form.source,
        unit: form.unit,
        costPrice: parseFloat(form.costPrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        minimumStock: parseInt(form.minimumStock) || 0,
        maximumStock: parseInt(form.maximumStock) || 0,
        warehouseLocation: form.warehouseLocation || null,
      }),
    })
    setDialogOpen(false)
    setForm({
      code: "",
      name: "",
      description: "",
      category: "raw_material",
      source: "local",
      unit: "",
      costPrice: "",
      sellingPrice: "",
      minimumStock: "",
      maximumStock: "",
      warehouseLocation: "",
    })
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    fetchProducts()
  }

  const handleDownloadTemplate = () => {
    const headers = "name,code,description,category,costPrice,sellingPrice,currentStock,minimumStock,unit,source"
    const exampleRow = "Sample Product,SP001,Description here,raw_material,10.50,15.00,100,20,kg,local"
    const csv = `${headers}\n${exampleRow}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResults(null)

    const text = await importFile.text()
    const lines = text.split("\n").filter((l) => l.trim())
    if (lines.length < 2) {
      setImportResults({ success: 0, failed: 0, errors: [{ row: 0, error: "CSV file is empty or has no data rows" }] })
      setImporting(false)
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const products = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || "" })
      return {
        name: row.name || "",
        code: row.code || "",
        description: row.description || "",
        category: row.category || "raw_material",
        costPrice: parseFloat(row.costPrice) || 0,
        sellingPrice: parseFloat(row.sellingPrice) || 0,
        currentStock: parseInt(row.currentStock) || 0,
        minimumStock: parseInt(row.minimumStock) || 0,
        unit: row.unit || "",
        source: row.source || "local",
      }
    })

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })
      const data = await res.json()
      setImportResults(data)
      if (data.success > 0) fetchProducts()
    } catch {
      setImportResults({ success: 0, failed: 0, errors: [{ row: 0, error: "Failed to import products" }] })
    } finally {
      setImporting(false)
    }
  }

  const getStatus = (product: Product) => {
    if (product.currentStock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (product.currentStock <= product.minimumStock) return { label: "Low Stock", variant: "outline" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Raw materials and packaging stock</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={(open) => { setImportDialogOpen(open); if (!open) { setImportFile(null); setImportResults(null) } }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Products
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Products from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="importFile">Select CSV File</Label>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={handleImport} disabled={!importFile || importing} className="w-full">
                  {importing ? "Importing..." : "Import"}
                </Button>
                {importResults && (
                  <div className="space-y-2 rounded-md border p-4">
                    <p className="text-sm"><span className="font-medium text-green-600">{importResults.success}</span> products imported successfully</p>
                    <p className="text-sm"><span className="font-medium text-red-600">{importResults.failed}</span> products failed</p>
                    {importResults.errors.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {importResults.errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-500">Row {err.row}: {err.error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_material">Raw Material</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select
                    value={form.source}
                    onValueChange={(value) => setForm({ ...form, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="imported">Imported</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouseLocation">Location</Label>
                  <Input
                    id="warehouseLocation"
                    value={form.warehouseLocation}
                    onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Min Stock</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    value={form.minimumStock}
                    onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumStock">Max Stock</Label>
                  <Input
                    id="maximumStock"
                    type="number"
                    value={form.maximumStock}
                    onChange={(e) => setForm({ ...form, maximumStock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{totalStockValue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const status = getStatus(product)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="capitalize">{product.category.replace("_", " ")}</TableCell>
                      <TableCell>
                        {product.currentStock.toLocaleString()} {product.unit}
                      </TableCell>
                      <TableCell>₱{Number(product.costPrice).toLocaleString()}</TableCell>
                      <TableCell>₱{Number(product.sellingPrice).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
