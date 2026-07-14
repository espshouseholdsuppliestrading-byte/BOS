"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  Package,
  Factory,
  TrendingUp,
  Plus,
  Trash2,
  Calculator,
} from "lucide-react"

interface Product {
  id: string
  name: string
  code: string
  category: string
}

interface ProductionCost {
  id: string
  productId: string
  product: Product
  type: string
  category: string | null
  amount: number
  quantity: number | null
  unit: string | null
  description: string | null
  date: string
}

interface ProductSummary {
  product: Product
  raw_material: number
  packaging: number
  labor: number
  overhead: number
  depreciation: number
  other: number
  total: number
}

const costTypes = [
  { value: "raw_material", label: "Raw Material" },
  { value: "packaging", label: "Packaging" },
  { value: "labor", label: "Labor" },
  { value: "overhead", label: "Overhead" },
  { value: "depreciation", label: "Depreciation" },
  { value: "other", label: "Other" },
]

const typeColors: Record<string, string> = {
  raw_material: "bg-blue-100 text-blue-800",
  packaging: "bg-purple-100 text-purple-800",
  labor: "bg-green-100 text-green-800",
  overhead: "bg-orange-100 text-orange-800",
  depreciation: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
}

export default function CostingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [costs, setCosts] = useState<ProductionCost[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterProduct, setFilterProduct] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [form, setForm] = useState({
    productId: "",
    type: "",
    category: "",
    amount: "",
    quantity: "",
    unit: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, costsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/production-costs"),
      ])
      const productsData = await productsRes.json()
      const costsData = await costsRes.json()
      setProducts(productsData)
      setCosts(costsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch("/api/production-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          quantity: form.quantity ? parseInt(form.quantity) : null,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create cost entry:", error)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/production-costs/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteConfirm(null)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to delete cost entry:", error)
    }
  }

  function resetForm() {
    setForm({
      productId: "",
      type: "",
      category: "",
      amount: "",
      quantity: "",
      unit: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  function getProductSummary(): ProductSummary[] {
    const summaryMap: Record<string, ProductSummary> = {}

    costs.forEach((cost) => {
      if (!summaryMap[cost.productId]) {
        summaryMap[cost.productId] = {
          product: cost.product,
          raw_material: 0,
          packaging: 0,
          labor: 0,
          overhead: 0,
          depreciation: 0,
          other: 0,
          total: 0,
        }
      }
      const typeKey = cost.type as keyof Omit<ProductSummary, "product" | "total">
      if (typeKey in summaryMap[cost.productId]) {
        summaryMap[cost.productId][typeKey] += cost.amount
      }
      summaryMap[cost.productId].total += cost.amount
    })

    return Object.values(summaryMap).sort((a, b) => b.total - a.total)
  }

  const summary = getProductSummary()
  const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
  const rawMaterialTotal = costs.filter((c) => c.type === "raw_material").reduce((sum, c) => sum + c.amount, 0)
  const packagingTotal = costs.filter((c) => c.type === "packaging").reduce((sum, c) => sum + c.amount, 0)
  const laborTotal = costs.filter((c) => c.type === "labor").reduce((sum, c) => sum + c.amount, 0)
  const overheadTotal = costs.filter((c) => c.type === "overhead").reduce((sum, c) => sum + c.amount, 0)
  const depreciationTotal = costs.filter((c) => c.type === "depreciation").reduce((sum, c) => sum + c.amount, 0)
  const otherTotal = costs.filter((c) => c.type === "other").reduce((sum, c) => sum + c.amount, 0)

  const filteredCosts = costs.filter((c) => {
    if (filterProduct !== "all" && c.productId !== filterProduct) return false
    if (filterType !== "all" && c.type !== filterType) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manufacturing Costing</h1>
          <p className="text-muted-foreground">Track and manage production costs per product</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Cost Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Production Cost Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cost Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {costTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="e.g. chemical, bottle, label"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="e.g. kg, pcs, hours"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Production Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Raw Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₱{rawMaterialTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Packaging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₱{packagingTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Labor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₱{laborTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overhead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₱{overheadTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₱{depreciationTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Product Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Product Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {summary.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No production cost entries yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Raw Materials</TableHead>
                  <TableHead className="text-right">Packaging</TableHead>
                  <TableHead className="text-right">Labor</TableHead>
                  <TableHead className="text-right">Overhead</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Other</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((s) => (
                  <TableRow key={s.product.id}>
                    <TableCell className="font-medium">{s.product.name}</TableCell>
                    <TableCell className="text-right">₱{s.raw_material.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">₱{s.packaging.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">₱{s.labor.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">₱{s.overhead.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">₱{s.depreciation.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">₱{s.other.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-bold">₱{s.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detailed Cost Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detailed Cost Breakdown</CardTitle>
          <div className="flex gap-2">
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {costTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCosts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No cost entries found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{cost.product.name}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[cost.type] || "bg-gray-100 text-gray-800"}>
                        {cost.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{cost.category || "-"}</TableCell>
                    <TableCell className="text-right">₱{cost.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">{cost.quantity || "-"}</TableCell>
                    <TableCell>{cost.unit || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{cost.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      {deleteConfirm === cost.id ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(cost.id)}>Yes</Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>No</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(cost.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
