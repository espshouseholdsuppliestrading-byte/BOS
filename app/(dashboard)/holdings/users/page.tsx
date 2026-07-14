import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPER_ADMIN") { redirect("/login") }

  const users = [
    { id: "U001", name: "Admin User", email: "admin@esps.com", role: "SUPER_ADMIN", company: "ESPS Holdings" },
    { id: "U002", name: "CEO Supply", email: "ceo@supply.com", role: "COMPANY_ADMIN", company: "ESPS Supply Corp" },
    { id: "U003", name: "Sales Agent", email: "agent@supply.com", role: "SALES_AGENT", company: "ESPS Supply Corp" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users across all companies</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
