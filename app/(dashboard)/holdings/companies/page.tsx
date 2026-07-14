import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  const companies = [
    { id: "1", code: "ESH", name: "ESPS Holdings", type: "Holdings", status: "Active" },
    { id: "2", code: "ESC", name: "ESPS Supply Corporation", type: "Trading", status: "Active" },
    { id: "3", code: "ESM", name: "ESPS Manufacturing", type: "Manufacturing", status: "Active" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage ESPS Holdings and operating companies</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Company</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.code}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.type}</TableCell>
                  <TableCell><Badge variant={company.status === "Active" ? "success" : "secondary"}>{company.status}</Badge></TableCell>
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
