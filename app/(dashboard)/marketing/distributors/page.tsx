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

interface Distributor {
  id: string
  name: string
  email: string
  status: string
  createdAt: string
  territory: Territory | null
  distributorInventory: Array<{ id: string }>
}

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTerritory, setFilterTerritory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    territoryId: "",
  })

  const fetchDistributors = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (filterTerritory !== "all") params.set("territoryId", filterTerritory)
    if (filterStatus !== "all") params.set("status", filterStatus)
    const res = await fetch(`/api/marketing/distributors?${params.toString()}`)
    if (res.ok) setDistributors(await res.json())
    setLoading(false)
  }

  const fetchTerritories = async () => {
    const res = await fetch("/api/marketing/territories")
    if (res.ok) setTerritories(await res.json())
  }

  useEffect(() => { fetchTerritories() }, [])
  useEffect(() => { fetchDistributors() }, [search, filterTerritory, filterStatus])

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", territoryId: "" })
    setEditingDistributor(null)
  }

  const openEdit = (d: Distributor) => {
    setEditingDistributor(d)
    setForm({
      name: d.name,
      email: d.email,
      password: "",
      territoryId: d.territory?.id || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      territoryId: form.territoryId || null,
    }
    if (form.password) payload.password = form.password

    if (editingDistributor) {
      await fetch(`/api/marketing/distributors/${editingDistributor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      payload.password = form.password
      await fetch("/api/marketing/distributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }
    resetForm()
    setDialogOpen(false)
    setSubmitting(false)
    fetchDistributors()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this distributor?")) return
    await fetch(`/api/marketing/distributors/${id}`, { method: "DELETE" })
    fetchDistributors()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Distributors</h1>
          <p className="text-muted-foreground">Distribution network management</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open) }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Distributor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDistributor ? "Edit Distributor" : "Add Distributor"}</DialogTitle>
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
                <Label htmlFor="password">Password {editingDistributor && "(leave blank to keep current)"}</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingDistributor} />
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
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingDistributor ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search distributors..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
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
        <CardHeader><CardTitle>Distributor List</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
              ) : distributors.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No distributors found.</TableCell></TableRow>
              ) : (
                distributors.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.email}</TableCell>
                    <TableCell>{d.territory?.name || "-"}</TableCell>
                    <TableCell>{d.distributorInventory.length}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "active" ? "default" : "destructive"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}>Delete</Button>
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
