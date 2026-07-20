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
import { Plus, Percent, DollarSign } from "lucide-react"

interface CommissionRule {
  id: string
  productId: string
  userRole: string
  type: string
  amount: number
  overrideUp: boolean | null
  overridePercent: number | null
  status: string
  territoryId: string | null
  product: { name: string; code: string }
  territory: { name: string } | null
}

interface Product {
  id: string
  name: string
  code: string
}

interface Territory {
  id: string
  name: string
}

const roleLabels: Record<string, string> = {
  SALES_AGENT: "Sales Agent",
  RESELLER: "Reseller",
  DISTRIBUTOR: "Distributor",
  TERRITORY_PARTNER: "Territory Partner",
}

const statusBadge = (s: string) => {
  const v = s === "active" ? "success" : s === "inactive" ? "destructive" : "secondary"
  return <Badge variant={v}>{s}</Badge>
}

export default function CommissionRulesPage() {
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [productId, setProductId] = useState("")
  const [userRole, setUserRole] = useState("")
  const [type, setType] = useState("")
  const [amount, setAmount] = useState("")
  const [territoryId, setTerritoryId] = useState("")
  const [overrideUp, setOverrideUp] = useState(false)
  const [overridePercent, setOverridePercent] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const [rulesRes, productsRes, territoriesRes] = await Promise.all([
      fetch("/api/marketing/commission-rules"),
      fetch("/api/products"),
      fetch("/api/marketing/territories"),
    ])
    if (rulesRes.ok) setRules(await rulesRes.json())
    if (productsRes.ok) setProducts(await productsRes.json())
    if (territoriesRes.ok) setTerritories(await territoriesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || !userRole || !type || !amount) return
    setSubmitting(true)
    const res = await fetch("/api/marketing/commission-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        userRole,
        type,
        amount: parseFloat(amount),
        territoryId: territoryId || undefined,
        overrideUp: overrideUp || undefined,
        overridePercent: overrideUp ? parseFloat(overridePercent) || undefined : undefined,
      }),
    })
    if (res.ok) {
      setDialogOpen(false)
      setProductId("")
      setUserRole("")
      setType("")
      setAmount("")
      setTerritoryId("")
      setOverrideUp(false)
      setOverridePercent("")
      fetchData()
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Rules</h1>
          <p className="text-muted-foreground">Configure commission rates per product and role</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Rule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Commission Rule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>User Role</Label>
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount {type === "percentage" ? "(%)" : "(₱)"}</Label>
                  <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Territory (optional)</Label>
                <Select value={territoryId} onValueChange={setTerritoryId}>
                  <SelectTrigger><SelectValue placeholder="All territories" /></SelectTrigger>
                  <SelectContent>
                    {territories.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="overrideUp"
                  checked={overrideUp}
                  onChange={(e) => setOverrideUp(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="overrideUp">Enable override upline</Label>
              </div>
              {overrideUp && (
                <div className="space-y-2">
                  <Label>Override Percent (%)</Label>
                  <Input type="number" step="0.01" min="0" max="100" value={overridePercent} onChange={(e) => setOverridePercent(e.target.value)} placeholder="0" />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Rule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rules ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Percent className="mx-auto mb-2 h-8 w-8 opacity-50" />
              No commission rules yet. Add your first rule!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.product?.name}</TableCell>
                    <TableCell>{roleLabels[rule.userRole] || rule.userRole}</TableCell>
                    <TableCell>
                      {rule.type === "fixed" ? <DollarSign className="inline h-3 w-3" /> : <Percent className="inline h-3 w-3" />}
                      {rule.type}
                    </TableCell>
                    <TableCell>
                      {rule.type === "fixed" ? `₱${Number(rule.amount).toLocaleString()}` : `${rule.amount}%`}
                    </TableCell>
                    <TableCell>{rule.territory?.name || "All"}</TableCell>
                    <TableCell>
                      {rule.overrideUp ? (
                        <Badge variant="secondary">+{rule.overridePercent || 0}%</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{statusBadge(rule.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
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
