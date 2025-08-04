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
import { useEffect, useState } from "react";
import ViewTaskDialog from "./ViewTaskDialog";
import { showError } from "@/utils/toast";
import Cookies from "js-cookie";

export default function RecentTasksTable() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [taskDeatils, setTaskDeatils] = useState(null);
  const token = Cookies.get("sessionToken");

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      try {
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks?limit=4`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        res = await res.json();
        if (res.success) {
          setTasks(res.tasks);
        } else showError("Error While fetching Task list");
      } catch (error) {
        console.log(error);
        showError("Error While fetching Task list on client side");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <TableHead className="w-8">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell colSpan={7}>
                    <div className="h-6 bg-muted-foreground/20 rounded w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TableRow key={task._id} className="hover:bg-muted transition">
                  <TableCell className="text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>

                  <TableCell className="truncate min-w-32">
                    {task.title}
                  </TableCell>

                  <TableCell className="text-muted-foreground text-xs truncate capitalize min-w-32">
                    {(() => {
                      const names = task.assignedTo.map(
                        (u) => u.name || u.email
                      );
                      if (names.length === 0) return "---";
                      const visible = names
                        .slice(0, 3)
                        .map((name) => name.split(" ")[0])
                        .join(", ");
                      const extraCount = names.length - 3;
                      return extraCount > 0
                        ? `${visible}, +${extraCount} more`
                        : visible;
                    })()}
                  </TableCell>

                  <TableCell className="capitalize w-24">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="capitalize w-24">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>

                  <TableCell className="w-28 text-sm">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  <TableCell className="w-24 text-right pr-2">
                    <Button
                      variant="link"
                      onClick={() => {
                        setTaskDeatils(task);
                        setOpen(true);
                      }}
                      className="underline"
                    >
                      View
                    </Button>
                    <ViewTaskDialog
                      open={open}
                      setOpen={setOpen}
                      task={taskDeatils}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm py-2">
                  No Tasks Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
