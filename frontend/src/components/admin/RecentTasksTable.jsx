"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RecentTasksTable() {
  const tasks = [
    {
      id: "t1",
      title: "Design Homepage",
      assignedTo: "John",
      status: "pending",
      dueDate: "2025-08-05",
    },
    {
      id: "t2",
      title: "Fix Login Bug",
      assignedTo: "Alice",
      status: "completed",
      dueDate: "2025-08-03",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-600">In Progress</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Tasks</CardTitle>
          <Link
            href="/tasks"
            className="text-end text-sm text-blue-500 font-semibold px-3 hover:underline"
          >
            View All Tasks
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
