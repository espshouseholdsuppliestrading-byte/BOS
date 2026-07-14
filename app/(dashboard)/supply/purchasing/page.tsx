"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, ShoppingCart, Clock, CheckCircle, Trash2 } from "lucide-react"

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
}

interface PurchaseOrderItem {
  id?: string
  productId: string
  quantity: number
  unitCost: number
  totalCost: number
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplier: Supplier
  status: string
  totalAmount: number
  expectedDate: string | null
  items: PurchaseOrderItem[]
}

interface FormItem {
  productId: string
  quantity: number
  unitCost: number
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="warning">pending</Badge>
    case "approved":
      return <Badge variant="default">approved</Badge>
    case "received":
      return <Badge variant="success">received</Badge>
    case "cancelled":
      return <Badge variant="destructive">cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function PurchasingPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formSupplierId, setFormSupplierId] = useState("")
  const [formExpectedDate, setFormExpectedDate] = useState("")
  const [formItems, setFormItems] = useState<FormItem[]>([
    { productId: "", quantity: 1, unitCost: 0 },
  ])

  async function fetchAll() {
    setLoading(true)
    const [ordersRes, suppliersRes, productsRes] = await Promise.all([
      fetch("/api/purchase-orders"),
      fetch("/api/suppliers"),
      fetch("/api/products"),
    ])
    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (suppliersRes.ok) setSuppliers(await suppliersRes.json())
    if (productsRes.ok) setProducts(await productsRes.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const totalSpending = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const pendingCount = orders.filter((o) => o.status === "pending").length

  function resetForm() {
    setFormSupplierId("")
    setFormExpectedDate("")
    setFormItems([{ productId: "", quantity: 1, unitCost: 0 }])
  }

  function addItem() {
    setFormItems([...formItems, { productId: "", quantity: 1, unitCost: 0 }])
  }

  function removeItem(index: number) {
    if (formItems.length <= 1) return
    setFormItems(formItems.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof FormItem, value: string | number) {
    const updated = [...formItems]
    if (field === "quantity" || field === "unitCost") {
      updated[index] = { ...updated[index], [field]: Number(value) || 0 }
    } else {
      updated[index] = { ...updated[index], [field]: String(value) }
    }
    setFormItems(updated)
  }

  const formTotal = formItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const body = {
      supplierId: formSupplierId,
      totalAmount: formTotal,
      expectedDate: formExpectedDate || null,
      items: formItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
      })),
    }
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setDialogOpen(false)
      resetForm()
      fetchAll()
    }
    setSubmitting(false)
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/purchase-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this purchase order?")) return
    const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" })
    if (res.ok) fetchAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchasing</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and suppliers
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{totalSpending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.supplier?.name ?? "—"}</TableCell>
                    <TableCell>{order.items?.length ?? 0}</TableCell>
                    <TableCell>
                      ₱{Number(order.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {order.expectedDate
                        ? new Date(order.expectedDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {order.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(order.id, "approved")}
                        >
                          Approve
                        </Button>
                      )}
                      {order.status === "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(order.id, "received")}
                        >
                          Receive
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={formSupplierId} onValueChange={setFormSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Date</Label>
                <Input
                  type="date"
                  value={formExpectedDate}
                  onChange={(e) => setFormExpectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {formItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={item.productId}
                      onValueChange={(v) => updateItem(index, "productId", v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      className="w-20"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Unit Cost"
                      className="w-28"
                      min={0}
                      step="0.01"
                      value={item.unitCost || ""}
                      onChange={(e) =>
                        updateItem(index, "unitCost", e.target.value)
                      }
                    />
                    <span className="w-28 text-right text-sm">
                      ₱{(item.quantity * item.unitCost).toLocaleString()}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formItems.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2 border-t">
                <span className="font-semibold">
                  Total: ₱{formTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !formSupplierId}>
                {submitting ? "Creating..." : "Create Purchase Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
