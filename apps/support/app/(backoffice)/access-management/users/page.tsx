import { UsersDataTable } from "@/features/user/components/users-data-table"
import { Card, CardContent } from "@workspace/ui/components/card"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Create and manage user accounts and roles
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <UsersDataTable />
        </CardContent>
      </Card>
    </div>
  )
}
