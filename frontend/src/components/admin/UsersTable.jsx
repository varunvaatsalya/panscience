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
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UsersTable() {
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      taskCount: 5,
    },
    {
      id: "2",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "user",
      taskCount: 3,
    },
  ];

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Users</CardTitle>
          <Link
            href="/users"
            className="text-end text-sm text-blue-500 font-semibold px-3 hover:underline"
          >
            View All Users
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Total Tasks</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.taskCount}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    View Tasks
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
