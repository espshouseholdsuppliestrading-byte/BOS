"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus } from "lucide-react"

interface SalesOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  client: { name: string } | null
  items: { productName: string; quantity: number; total: number }[]
}

interface Client {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  code: string
  costPrice: number
  sellingPrice: number
  currentStock: number
}

const formatCurrency = (value: number) => `₱${value.toLocaleString()}`

export default function ManufacturingSalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clientId, setClientId] = useState("")
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; sellingPrice: number }[]>([
    { productId: "", quantity: 1, sellingPrice: 0 },
  ])

  const fetchData = async () => {
    setLoading(true)
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

  const addItem = () => setOrderItems([...orderItems, { productId: "", quantity: 1, sellingPrice: 0 }])
  const removeItem = (index: number) => setOrderItems(orderItems.filter((_, i) => i !== index))
  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems]
    ;(updated[index] as Record<string, unknown>)[field] = value
    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) updated[index].sellingPrice = Number(product.sellingPrice)
    }
    setOrderItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || orderItems.length === 0) return
    setSubmitting(true)
    const items = orderItems.filter((i) => i.productId).map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      sellingPrice: i.sellingPrice,
      costPrice: products.find((p) => p.id === i.productId)?.costPrice || 0,
      total: i.sellingPrice * i.quantity,
    }))
    const totalAmount = items.reduce((sum, i) => sum + i.total, 0)
    const orderNumber = `MFG-SO-${Date.now()}`
    const res = await fetch("/api/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, clientId, totalAmount, status: "pending", items }),
    })
    if (res.ok) {
      setDialogOpen(false)
      setClientId("")
      setOrderItems([{ productId: "", quantity: 1, sellingPrice: 0 }])
      fetchData()
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">ESPS Manufacturing sales orders</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Sales Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>Add Item</Button>
                </div>
                {orderItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-end">
                    <div>
                      <Select value={item.productId} onValueChange={(v) => updateItem(index, "productId", v)}>
                        <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)} />
                    <Input type="number" placeholder="Price" value={item.sellingPrice} onChange={(e) => updateItem(index, "sellingPrice", parseFloat(e.target.value) || 0)} />
                    {orderItems.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>Remove</Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold">
                Total: {formatCurrency(orderItems.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0))}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Order"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue: {formatCurrency(totalRevenue)} | {orders.length} Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No sales orders yet. Create your first order!</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.client?.name || "—"}</TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "delivered" ? "success" : order.status === "pending" ? "warning" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
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
