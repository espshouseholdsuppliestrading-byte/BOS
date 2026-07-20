"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Territory {
  id: string
  name: string
  type: string
}

interface Agent {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  territory: Territory | null
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTerritory, setFilterTerritory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_AGENT",
    territoryId: "",
  })

  const fetchAgents = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (filterTerritory !== "all") params.set("territoryId", filterTerritory)
    if (filterStatus !== "all") params.set("status", filterStatus)
    const res = await fetch(`/api/marketing/agents?${params.toString()}`)
    if (res.ok) setAgents(await res.json())
    setLoading(false)
  }

  const fetchTerritories = async () => {
    const res = await fetch("/api/marketing/territories")
    if (res.ok) setTerritories(await res.json())
  }

  useEffect(() => { fetchTerritories() }, [])
  useEffect(() => { fetchAgents() }, [search, filterTerritory, filterStatus])

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "SALES_AGENT", territoryId: "" })
    setEditingAgent(null)
  }

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setForm({
      name: agent.name,
      email: agent.email,
      password: "",
      role: agent.role,
      territoryId: agent.territory?.id || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      territoryId: form.territoryId || null,
    }
    if (form.password) payload.password = form.password

    if (editingAgent) {
      await fetch(`/api/marketing/agents/${editingAgent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      payload.password = form.password
      await fetch("/api/marketing/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }
    resetForm()
    setDialogOpen(false)
    setSubmitting(false)
    fetchAgents()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this agent?")) return
    await fetch(`/api/marketing/agents/${id}`, { method: "DELETE" })
    fetchAgents()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Sales agents and resellers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open) }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit Agent" : "Add Agent"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {editingAgent && "(leave blank to keep current)"}</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingAgent} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES_AGENT">Sales Agent</SelectItem>
                    <SelectItem value="RESELLER">Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Territory</Label>
                <Select value={form.territoryId} onValueChange={(value) => setForm({ ...form, territoryId: value })}>
                  <SelectTrigger><SelectValue placeholder="Select territory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {territories.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setDialogOpen(false) }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingAgent ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={filterTerritory} onValueChange={setFilterTerritory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All territories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All territories</SelectItem>
            {territories.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Agent List</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
              ) : agents.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">No agents found.</TableCell></TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell><Badge variant="secondary">{agent.role === "SALES_AGENT" ? "Sales Agent" : "Reseller"}</Badge></TableCell>
                    <TableCell>{agent.territory?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={agent.status === "active" ? "default" : "destructive"}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(agent)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(agent.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
