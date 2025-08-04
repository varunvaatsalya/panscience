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
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";
import Cookies from "js-cookie";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const users = [
  //   {
  //     id: "1",
  //     name: "John Doe",
  //     email: "john@example.com",
  //     role: "user",
  //     taskCount: 5,
  //   },
  //   {
  //     id: "2",
  //     name: "Alice Smith",
  //     email: "alice@example.com",
  //     role: "user",
  //     taskCount: 3,
  //   },
  // ];
  const token = Cookies.get("sessionToken");
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users?limit=4&taskCount=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        res = await res.json();
        if (res.success) {
          setUsers(res.users);
        } else showError("Error While fetching User list");
      } catch (error) {
        console.log(error);
        showError("Error While fetching User list on client side");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

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
              <TableHead>Pending</TableHead>
              <TableHead className="text-right">Total Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell colSpan={4}>
                      <div className="h-6 bg-muted-foreground/20 rounded w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="flex items-center">
                      <span
                        className={
                          user.pendingCount > 0
                            ? "text-white bg-red-600 p-2 rounded text-center w-8 py-0.5 font-semibold"
                            : ""
                        }
                      >
                        {user.pendingCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.taskCount}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
