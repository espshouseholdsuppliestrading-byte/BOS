"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, TrendingUp, ShoppingCart, Clock } from "lucide-react"

interface Client {
  id: string
  code: string
  name: string
}

interface Product {
  id: string
  code: string
  name: string
  sellingPrice: number
}

interface OrderItem {
  productId: string
  quantity: number
  sellingPrice: number
  total: number
}

interface SalesOrder {
  id: string
  orderNumber: string
  clientId: string
  client: { id: string; name: string }
  status: string
  totalAmount: number
  discount: number
  items: { id: string; productId: string; quantity: number; sellingPrice: number; total: number }[]
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clientId, setClientId] = useState("")
  const [discount, setDiscount] = useState(0)
  const [items, setItems] = useState<OrderItem[]>([{ productId: "", quantity: 1, sellingPrice: 0, total: 0 }])

  const fetchData = async () => {
    const [ordersRes, clientsRes, productsRes] = await Promise.all([
      fetch("/api/sales-orders"),
      fetch("/api/clients"),
      fetch("/api/products"),
    ])
    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (clientsRes.ok) setClients(await clientsRes.json())
    if (productsRes.ok) setProducts(await productsRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const pendingCount = orders.filter((o) => o.status === "pending").length

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === "quantity" || field === "sellingPrice") {
        updated[index].total = updated[index].quantity * updated[index].sellingPrice
      }
      if (field === "productId") {
        const product = products.find((p) => p.id === value)
        if (product) {
          updated[index].sellingPrice = Number(product.sellingPrice)
          updated[index].total = updated[index].quantity * Number(product.sellingPrice)
        }
      }
      return updated
    })
  }

  const addItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1, sellingPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const computedTotal = items.reduce((sum, item) => sum + item.total, 0) - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || items.every((i) => !i.productId)) return
    setSubmitting(true)
    await fetch("/api/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, totalAmount: computedTotal, discount, items }),
    })
    setClientId("")
    setDiscount(0)
    setItems([{ productId: "", quantity: 1, sellingPrice: 0, total: 0 }])
    setDialogOpen(false)
    setSubmitting(false)
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Manage sales orders and quotations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />New Sale
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">No orders found.</TableCell></TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.client?.name}</TableCell>
                    <TableCell>{order.items?.length ?? 0}</TableCell>
                    <TableCell>₱{Number(order.totalAmount).toLocaleString()}</TableCell>
                    <TableCell>{Number(order.discount) > 0 ? `₱${Number(order.discount).toLocaleString()}` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLES[order.status] || ""}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Sales Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new sales order.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" />Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Product</Label>
                      <Select value={item.productId} onValueChange={(v) => updateItem(index, "productId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input type="number" min={0} step={0.01} value={item.sellingPrice} onChange={(e) => updateItem(index, "sellingPrice", Number(e.target.value))} />
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs">Total</Label>
                      <Input value={`₱${item.total.toLocaleString()}`} readOnly />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="mb-0.5" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input id="discount" type="number" min={0} step={0.01} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>

            <div className="flex justify-end text-lg font-bold">
              Total: ₱{computedTotal.toLocaleString()}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Order"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
