import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { FaRegCheckCircle } from "react-icons/fa";
import Cookies from "js-cookie";

function ViewTaskDialog({ open, setOpen, task, handleMarkCompleted }) {
  if (!task) return null;
  const [updating, setUpdating] = useState(false);

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
  const token = Cookies.get("sessionToken");
  const markTaskCompleted = async () => {
    setUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task._id}/complete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        showSuccess("Task marked as completed");
        task.status = "completed";
        if (handleMarkCompleted) handleMarkCompleted(task._id);
      } else {
        showError("Failed to update task");
      }
    } catch (err) {
      console.error(err);
      showError("Internal error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="max-w-4xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Task Details</span>
            <Link href={`/tasks/${task._id}`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>
            {task.status === "completed" ? (
              <div className="text-green-500 flex gap-1 text-nowrap text-sm items-center">
                <FaRegCheckCircle />
                <div>Completed</div>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <Button onClick={markTaskCompleted}>
                  {updating ? "Wait" : "Done"}
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2 flex flex-col gap-4 text-sm">
          <div>
            <strong>Title:</strong> {task.title}
          </div>
          <div>
            <strong>Description:</strong> {task.description}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          </div>
          <div>
            <strong>Priority:</strong>{" "}
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          <div>
            <strong>Due Date:</strong>{" "}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
          </div>
          <div>
            <strong>Assigned To:</strong>{" "}
            {task.assignedTo?.length > 0
              ? task.assignedTo.map((u) => u.name || u.email).join(", ")
              : "No users"}
          </div>
          <div>
            <strong>Documents:</strong>
            {task.documents?.length > 0 ? (
              <ul className="list-decimal list-inside mt-1 space-y-1">
                {task.documents.map((file, idx) => (
                  <li key={idx}>
                    <a
                      href={file.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {idx + 1}. {file.original_filename}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No documents</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewTaskDialog;
