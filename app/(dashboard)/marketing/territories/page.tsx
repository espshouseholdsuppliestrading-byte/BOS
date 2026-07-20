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
import { Plus, Trash2, MapPin } from "lucide-react"

interface Territory {
  id: string
  name: string
  type: string
  parentId: string | null
  parent?: { name: string } | null
  children?: Territory[]
  _count?: { users: number }
}

const typeBadge = (type: string) => {
  const v = type === "region" ? "default" : type === "city" ? "secondary" : "outline"
  return <Badge variant={v}>{type}</Badge>
}

export default function TerritoriesPage() {
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [parentId, setParentId] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch("/api/marketing/territories")
    if (res.ok) setTerritories(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const flatTerritories = territories.flatMap(function flat(t: Territory): Territory[] {
    return [t, ...(t.children || []).flatMap(flat)]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !type) return
    setSubmitting(true)
    const res = await fetch("/api/marketing/territories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, parentId: parentId || undefined }),
    })
    if (res.ok) {
      setDialogOpen(false)
      setName("")
      setType("")
      setParentId("")
      fetchData()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this territory?")) return
    const res = await fetch(`/api/marketing/territories/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error || "Failed to delete")
      setTimeout(() => setDeleteError(""), 3000)
    } else {
      fetchData()
    }
  }

  const canDelete = (t: Territory) => {
    return (t._count?.users || 0) === 0 && (t.children?.length || 0) === 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Territories</h1>
          <p className="text-muted-foreground">Manage sales territories and regions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Territory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Territory</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Territory name" required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="barangay">Barangay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Territory (optional)</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {flatTerritories.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Territory"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {deleteError && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-4 py-2 text-sm">
          {deleteError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Territories ({flatTerritories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : flatTerritories.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MapPin className="mx-auto mb-2 h-8 w-8 opacity-50" />
              No territories yet. Add your first territory!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {territories.map((t) => (
                  <TerritoryRow key={t.id} territory={t} depth={0} onDelete={handleDelete} canDelete={canDelete} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TerritoryRow({
  territory,
  depth,
  onDelete,
  canDelete,
}: {
  territory: Territory
  depth: number
  onDelete: (id: string) => void
  canDelete: (t: Territory) => boolean
}) {
  const indent = depth * 24
  return (
    <>
      <TableRow>
        <TableCell className="font-medium" style={{ paddingLeft: 16 + indent }}>
          {depth > 0 && <span className="text-muted-foreground mr-2">&#9500;</span>}
          {territory.name}
        </TableCell>
        <TableCell>{typeBadge(territory.type)}</TableCell>
        <TableCell>{territory.parent?.name || "—"}</TableCell>
        <TableCell>{territory._count?.users || 0}</TableCell>
        <TableCell className="text-right">
          {canDelete(territory) && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(territory.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
      {territory.children?.map((child) => (
        <TerritoryRow key={child.id} territory={child} depth={depth + 1} onDelete={onDelete} canDelete={canDelete} />
      ))}
    </>
  )
}
