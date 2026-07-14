"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Loader2 } from "lucide-react"

interface Client {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price?: number
}

interface QuotationItem {
  productId: string
  quantity: number
  unitPrice: number
  total: number
}

interface Quotation {
  id: string
  quoteNumber: string
  clientId: string
  client?: Client
  status: string
  validUntil: string
  totalAmount: number
  notes?: string
  items?: any[]
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "default" | "success" | "destructive" | "warning" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "warning" },
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [clientId, setClientId] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<QuotationItem[]>([
    { productId: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [qRes, cRes, pRes] = await Promise.all([
        fetch("/api/quotations"),
        fetch("/api/clients"),
        fetch("/api/products"),
      ])
      if (qRes.ok) setQuotations(await qRes.json())
      if (cRes.ok) setClients(await cRes.json())
      if (pRes.ok) setProducts(await pRes.json())
    } catch (e) {
      console.error("Failed to fetch data", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setClientId("")
    setValidUntil("")
    setNotes("")
    setItems([{ productId: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const updated = [...items]
    const item = { ...updated[index] }

    if (field === "productId") {
      item.productId = value as string
      const product = products.find((p) => p.id === value)
      if (product?.price) {
        item.unitPrice = product.price
        item.total = item.quantity * product.price
      }
    } else if (field === "quantity" || field === "unitPrice") {
      const num = Number(value) || 0
      ;(item as any)[field] = num
      item.total = item.quantity * item.unitPrice
    }

    updated[index] = item
    setItems(updated)
  }

  const handleSubmit = async () => {
    if (!clientId || !validUntil || items.some((i) => !i.productId)) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, validUntil, totalAmount, notes, items }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        fetchData()
      }
    } catch (e) {
      console.error("Failed to create quotation", e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return
    await fetch(`/api/quotations/${id}`, { method: "DELETE" })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Price quotes for clients</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />New Quotation
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No quotations found.
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quoteNumber}</TableCell>
                    <TableCell>{q.client?.name ?? "—"}</TableCell>
                    <TableCell>{q.items?.length ?? 0}</TableCell>
                    <TableCell>₱{Number(q.totalAmount).toLocaleString()}</TableCell>
                    <TableCell>{new Date(q.validUntil).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[q.status]?.variant ?? "secondary"}>
                        {statusConfig[q.status]?.label ?? q.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(q.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Quotation</DialogTitle>
            <DialogDescription>Create a price quote for a client.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="mr-1 h-3 w-3" />Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_100px_120px_120px_40px] gap-2 items-end">
                    <div className="space-y-1">
                      {idx === 0 && <Label className="text-xs">Product</Label>}
                      <Select value={item.productId} onValueChange={(v) => handleItemChange(idx, "productId", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      {idx === 0 && <Label className="text-xs">Qty</Label>}
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {idx === 0 && <Label className="text-xs">Unit Price</Label>}
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {idx === 0 && <Label className="text-xs">Total</Label>}
                      <Input type="number" value={item.total} readOnly className="bg-muted" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold text-lg pt-2">
                Total: ₱{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !clientId || !validUntil || items.some((i) => !i.productId)}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
