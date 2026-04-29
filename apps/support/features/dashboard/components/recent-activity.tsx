import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  ShoppingCartIcon,
  UserIcon,
  PackageIcon,
  HeadphonesIcon,
} from "lucide-react"

type ActivityStatus = "completed" | "pending" | "failed"

interface ActivityItem {
  id: string
  type: string
  description: string
  date: string
  status: ActivityStatus
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "Order",
    description: "#1234 placed by Jane Smith",
    date: "Today",
    status: "completed",
  },
  {
    id: "2",
    type: "User",
    description: "New user: Mike Johnson",
    date: "Today",
    status: "completed",
  },
  {
    id: "3",
    type: "Product",
    description: "Widget Y updated",
    date: "Yesterday",
    status: "completed",
  },
  {
    id: "4",
    type: "Order",
    description: "#1233 shipped",
    date: "Yesterday",
    status: "completed",
  },
  {
    id: "5",
    type: "Support",
    description: "Ticket #567 resolved",
    date: "2 days ago",
    status: "completed",
  },
  {
    id: "6",
    type: "Order",
    description: "#1235 pending payment",
    date: "3 days ago",
    status: "pending",
  },
]

const typeIcons: Record<string, React.ReactNode> = {
  Order: <ShoppingCartIcon className="size-4" />,
  User: <UserIcon className="size-4" />,
  Product: <PackageIcon className="size-4" />,
  Support: <HeadphonesIcon className="size-4" />,
}

const statusVariants: Record<
  ActivityStatus,
  "default" | "secondary" | "destructive"
> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your system</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No recent activity
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">
                        {typeIcons[activity.type]}
                      </div>
                      <span className="font-medium">{activity.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {activity.description}
                  </TableCell>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[activity.status]}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
