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
import { Plus, DollarSign, Eye } from "lucide-react"

interface PayoutItem {
  id: string
  amount: number
  type: string
  description: string
  commission: { id: string; amount: number; type: string; status: string } | null
}

interface Payout {
  id: string
  period: string
  totalAmount: number
  status: string
  calculatedAt: string
  approvedAt: string | null
  releasedAt: string | null
  paidAt: string | null
  user: { id: string; name: string; email: string }
  items: PayoutItem[]
  commissions: { id: string; amount: number; status: string }[]
}

interface Agent { id: string; name: string }

const formatCurrency = (v: number) => `₱${v.toLocaleString()}`

const statusBadge = (s: string) => {
  const v = s === "paid" ? "success" : s === "approved" ? "default" : s === "released" ? "secondary" : s === "pending" ? "warning" : "outline"
  return <Badge variant={v}>{s}</Badge>
}

const NEXT_STATUS: Record<string, string> = {
  pending: "approved",
  approved: "released",
  released: "paid",
}

const NEXT_LABEL: Record<string, string> = {
  pending: "Approve",
  approved: "Release",
  released: "Mark Paid",
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [period, setPeriod] = useState("")
  const [agentId, setAgentId] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const [payoutsRes, agentsRes] = await Promise.all([
      fetch("/api/marketing/payouts"),
      fetch("/api/marketing/agents"),
    ])
    if (payoutsRes.ok) setPayouts(await payoutsRes.json())
    if (agentsRes.ok) setAgents(await agentsRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!period || !agentId) return
    setSubmitting(true)
    const res = await fetch("/api/marketing/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, agentId }),
    })
    if (res.ok) {
      setDialogOpen(false)
      setPeriod("")
      setAgentId("")
      fetchData()
    }
    setSubmitting(false)
  }

  const transitionStatus = async (id: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    if (!confirm(`Mark payout as "${next}"?`)) return
    const res = await fetch(`/api/marketing/payouts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) fetchData()
  }

  const viewPayout = async (id: string) => {
    const res = await fetch(`/api/marketing/payouts/${id}`)
    if (res.ok) {
      setSelectedPayout(await res.json())
      setDetailOpen(true)
    }
  }

  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.totalAmount), 0)
  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.totalAmount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-muted-foreground">Manage commission payouts to agents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Payout</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. 2026-W28" required />
              </div>
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select value={agentId} onValueChange={setAgentId}>
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Payout"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalPending)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Payouts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{payouts.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : payouts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <DollarSign className="mx-auto mb-2 h-8 w-8 opacity-50" />
              No payouts yet. Create your first payout!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Calculated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-sm">{payout.period}</TableCell>
                    <TableCell>{payout.user?.name}</TableCell>
                    <TableCell>{formatCurrency(Number(payout.totalAmount))}</TableCell>
                    <TableCell>{statusBadge(payout.status)}</TableCell>
                    <TableCell>{new Date(payout.calculatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => viewPayout(payout.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {NEXT_STATUS[payout.status] && (
                        <Button size="sm" onClick={() => transitionStatus(payout.id, payout.status)}>
                          {NEXT_LABEL[payout.status]}
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Period:</span> <span className="font-mono">{selectedPayout.period}</span></div>
                <div><span className="text-muted-foreground">Agent:</span> {selectedPayout.user?.name}</div>
                <div><span className="text-muted-foreground">Amount:</span> {formatCurrency(Number(selectedPayout.totalAmount))}</div>
                <div><span className="text-muted-foreground">Status:</span> {statusBadge(selectedPayout.status)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Commission Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPayout.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{formatCurrency(Number(item.amount))}</TableCell>
                        <TableCell><Badge variant="secondary">{item.commission?.status || "—"}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {selectedPayout.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No items</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
