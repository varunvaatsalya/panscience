"use client";
import ViewTaskDialog from "@/components/admin/ViewTaskDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError } from "@/utils/toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline, IoMdArrowRoundBack } from "react-icons/io";

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

function Page() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDateOrder, setDueDateOrder] = useState("desc");
  const [open, setOpen] = useState(false);
  const [taskDeatils, setTaskDeatils] = useState(null);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      try {
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks?page=${page}&status=${status}&priority=${priority}&dueDateOrder=${dueDateOrder}`,
          {
            credentials: "include",
          }
        );
        res = await res.json();
        if (res.success) {
          setTasks(res.tasks);
          setTotalPages(res.totalPages);
        } else showError("Error While fetching Task list");
      } catch (error) {
        console.log(error);
        showError("Error While fetching Task list on client side");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, [page, status, priority, dueDateOrder]);

  return (
    <div className="h-[100dvh] w-full max-w-6xl mx-auto text-sm font-sans p-2 space-y-2">
      <Card>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center">
              <Button
                type="button"
                variant="icon"
                onClick={() => {
                  router.back();
                }}
                className="hover:opacity-80"
              >
                <IoMdArrowRoundBack className="size-6" />
              </Button>
              <div className="font-bold text-xl px-2">Your Tasks</div>
            </div>
            <Button
              onClick={() => router.push("/tasks/new")}
              className="flex items-center gap-1"
            >
              <IoIosAddCircleOutline />
              <div>Add Task</div>
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Select
              value={status}
              onValueChange={(val) => setStatus(val === "all" ? "" : val)}
            >
              <SelectTrigger className="col-span-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={(val) => setPriority(val === "all" ? "" : val)}
            >
              <SelectTrigger className="col-span-1">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border overflow-hidden">
            {/* Header Row */}
            <div className="flex items-center px-4 py-2 border-b text-xs font-semibold bg-muted text-muted-foreground">
              <div className="w-8">#</div>
              <div className="flex-1 min-w-32">Title</div>
              <div className="flex-1 min-w-32">Assign To</div>
              <div className="w-24">Status</div>
              <div className="w-24">Priority</div>
              <div
                className="w-28 flex items-center cursor-pointer"
                onClick={() =>
                  setDueDateOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                <span>Due Date</span>
                <span className="ml-1">
                  {dueDateOrder === "asc" ? "↑" : "↓"}
                </span>
              </div>
              <div className="w-24 text-right pr-2">Action</div>
            </div>

            {/* Task Rows */}
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 border-b text-sm animate-pulse"
                  >
                    <div className="h-6 bg-muted-foreground/20 rounded w-full" />
                  </div>
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <div
                    key={task._id}
                    className="flex items-center px-4 py-2 border-b text-sm hover:bg-muted transition"
                  >
                    <div className="w-8 text-xs text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="truncate flex-1 min-w-32">{task.title}</div>
                    <div className="min-w-32 flex-1 text-muted-foreground text-xs truncate capitalize">
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
                    </div>
                    <div className="w-24 capitalize">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>

                    <div className="w-24 capitalize">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>

                    <div className="w-28 text-sm">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="w-24 text-right pr-2">
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
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center px-4 py-2 border-b text-sm">
                  No Tasks Found
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-2 flex justify-center items-center gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <div>
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;

