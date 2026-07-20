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
import { Plus, ShoppingCart, Eye } from "lucide-react"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  sellingPrice: number
  total: number
  product: { name: string; code: string }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  client: { id: string; name: string } | null
  salesAgent: { id: string; name: string } | null
  territory: { name: string } | null
  items: OrderItem[]
  commissions?: { id: string; amount: number; type: string; status: string }[]
}

interface Client { id: string; name: string }
interface Agent { id: string; name: string }
interface Product { id: string; name: string; code: string; sellingPrice: number }
interface Territory { id: string; name: string }

const formatCurrency = (v: number) => `₱${v.toLocaleString()}`

const statusBadge = (s: string) => {
  const v = s === "completed" || s === "delivered" ? "success" : s === "pending" ? "warning" : s === "cancelled" ? "destructive" : "secondary"
  return <Badge variant={v}>{s}</Badge>
}

const paymentBadge = (s: string) => {
  const v = s === "paid" ? "success" : s === "partial" ? "warning" : "outline"
  return <Badge variant={v}>{s}</Badge>
}

export default function MarketingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [clientId, setClientId] = useState("")
  const [agentId, setAgentId] = useState("")
  const [territoryId, setTerritoryId] = useState("")
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ])

  const fetchData = async () => {
    setLoading(true)
    const [ordersRes, clientsRes, agentsRes, productsRes, territoriesRes] = await Promise.all([
      fetch("/api/marketing/orders"),
      fetch("/api/clients"),
      fetch("/api/marketing/agents"),
      fetch("/api/products"),
      fetch("/api/marketing/territories"),
    ])
    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (clientsRes.ok) setClients(await clientsRes.json())
    if (agentsRes.ok) setAgents(await agentsRes.json())
    if (productsRes.ok) setProducts(await productsRes.json())
    if (territoriesRes.ok) {
      const t = await territoriesRes.json()
      setTerritories(t.flat?.() || t)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const addItem = () => setOrderItems([...orderItems, { productId: "", quantity: 1, unitPrice: 0 }])
  const removeItem = (index: number) => setOrderItems(orderItems.filter((_, i) => i !== index))
  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems]
    ;(updated[index] as Record<string, unknown>)[field] = value
    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) updated[index].unitPrice = Number(product.sellingPrice)
    }
    setOrderItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || orderItems.filter((i) => i.productId).length === 0) return
    setSubmitting(true)
    const items = orderItems.filter((i) => i.productId).map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }))
    const res = await fetch("/api/marketing/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, salesAgentId: agentId || undefined, territoryId: territoryId || undefined, items }),
    })
    if (res.ok) {
      setDialogOpen(false)
      setClientId("")
      setAgentId("")
      setTerritoryId("")
      setOrderItems([{ productId: "", quantity: 1, unitPrice: 0 }])
      fetchData()
    }
    setSubmitting(false)
  }

  const viewOrder = async (id: string) => {
    const res = await fetch(`/api/marketing/orders/${id}`)
    if (res.ok) {
      setSelectedOrder(await res.json())
      setDetailOpen(true)
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Orders</h1>
          <p className="text-muted-foreground">Manage sales orders for ESPS Marketing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Agent (optional)</Label>
                  <Select value={agentId} onValueChange={setAgentId}>
                    <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Territory (optional)</Label>
                <Select value={territoryId} onValueChange={setTerritoryId}>
                  <SelectTrigger><SelectValue placeholder="Select territory" /></SelectTrigger>
                  <SelectContent>
                    {territories.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
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
                    <Input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)} />
                    {orderItems.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>Remove</Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold">
                Total: {formatCurrency(orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0))}
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
            <div className="p-6 text-center text-muted-foreground">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8 opacity-50" />
              No orders yet. Create your first order!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell>{order.client?.name || "—"}</TableCell>
                    <TableCell>{order.salesAgent?.name || "—"}</TableCell>
                    <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell>{paymentBadge(order.paymentStatus)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => viewOrder(order.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Order #:</span> <span className="font-mono">{selectedOrder.orderNumber}</span></div>
                <div><span className="text-muted-foreground">Client:</span> {selectedOrder.client?.name || "—"}</div>
                <div><span className="text-muted-foreground">Agent:</span> {selectedOrder.salesAgent?.name || "—"}</div>
                <div><span className="text-muted-foreground">Territory:</span> {selectedOrder.territory?.name || "—"}</div>
                <div><span className="text-muted-foreground">Status:</span> {statusBadge(selectedOrder.status)}</div>
                <div><span className="text-muted-foreground">Payment:</span> {paymentBadge(selectedOrder.paymentStatus)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(Number(item.sellingPrice))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(item.total))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="text-right font-semibold mt-2">
                  Grand Total: {formatCurrency(Number(selectedOrder.totalAmount))}
                </div>
              </div>
              {selectedOrder.commissions && selectedOrder.commissions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Commissions</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.commissions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.type}</TableCell>
                          <TableCell>{formatCurrency(Number(c.amount))}</TableCell>
                          <TableCell><Badge variant={c.status === "paid" ? "success" : "secondary"}>{c.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
