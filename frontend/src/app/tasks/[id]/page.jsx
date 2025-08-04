"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CldUploadWidget } from "next-cloudinary";
// import Select from "react-select";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";
import { useParams, useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/UserAuthContext";
const ClientSelect = dynamic(() => import("react-select"), { ssr: false });

function Page() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUserAuth();
  let taskId = params?.id;
  const [date, setDate] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          credentials: "include",
        });
        res = await res.json();
        if (res.success) {
          setUsers(res.users);
        } else showError("Error While fetching User list");
      } catch (error) {
        console.log(error);
        showError("Error While fetching User list on client side");
      }
    }
    async function fetchTaskDeatils() {
      if (taskId && taskId !== "new") {
        try {
          let res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
            {
              credentials: "include",
            }
          );
          res = await res.json();
          console.log(res);
          if (res.success) {
            setTitle(res.task.title);
            setDescription(res.task.description);
            setPriority(res.task.priority);
            setDate(res.task.dueDate);
            setUploadedFiles(res.task.documents);
            setSelectedUsers(
              res.task?.assignedTo?.map((u) => ({
                label: u.name,
                value: u._id,
              }))
            );
            console.log(res.task.assignedTo);
          } else router.replace("/tasks/new");
        } catch (error) {
          console.log(error);
          showError("Error While fetching task Details on client side");
        }
      }
    }
    if (user?.role === "admin") fetchUsers();
    fetchTaskDeatils();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showError("Title and description are required.");
      return;
    }
    if (!date) {
      showError("Please select a due date.");
      return;
    }
    if (user.role === "admin" && selectedUsers.length === 0) {
      showError("Please assign the task to at least one user.");
      return;
    }
    const payload = {
      title,
      description,
      dueDate: date,
      priority,
      assignedTo: selectedUsers.map((user) => user.value), // assuming {value, label} structure
      documents: uploadedFiles,
    };
    setCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks${
          taskId !== "new" ? `/${taskId}` : ""
        }`,
        {
          method: taskId !== "new" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message);
        setTitle("");
        setDescription("");
        setDate(null);
        setPriority("medium");
        setSelectedUsers([]);
        setUploadedFiles([]);
        if (taskId !== "new") router.back();
      } else {
        showError(data.message || "Task creation failed.");
      }
    } catch (err) {
      console.error("Task creation failed", err);
    } finally {
      setCreating(false);
    }
  };

  const options = useMemo(() => {
    return users.map((u) => ({
      value: u._id,
      label: u.name,
    }));
  }, [users]);

  return (
    <div className="h-svh flex flex-col gap-2 p-2">
      <Card className="max-w-2xl w-full mx-auto p-4 gap-4">
        <CardTitle className="text-2xl">Create New Task</CardTitle>
        <CardDescription>
          Fill the form below to add a new task.
        </CardDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="px-2 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="space-y-1 flex-1">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1 flex-1">
                <Label>Priority</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border-2 px-2 py-1 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {user?.role === "admin" && (
              <div className="space-y-1">
                <Label>Assign To</Label>
                <ClientSelect
                  isMulti
                  options={options}
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  className="text-black"
                  placeholder="Search and select users..."
                  menuPosition="fixed"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>Upload Documents (Max 3)</Label>
              <ul className="text-sm m-2 space-y-1 flex flex-col">
                {uploadedFiles.map((file, i) => (
                  <li key={i}>
                    <Link
                      href={file.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-600 underline hover:text-yellow-800"
                    >
                      {`${i + 1}. ${file.original_filename}`}
                    </Link>
                  </li>
                ))}
              </ul>
              {uploadedFiles.length < 3 && (
                <CloudinaryUploader
                  onUpload={(result) => {
                    setUploadedFiles((prev) => [...prev, result]);
                    showSuccess("uploaded");
                  }}
                  // onError={() =>
                  //   showError("Failed to load Cloudinary. Check internet.")
                  // }
                  disabled={uploadedFiles.length >= 3}
                />
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="hover:opacity-80 flex items-center gap-1"
            >
              <IoMdArrowRoundBack className="size-4" />
              <div>Cancel</div>
            </Button>
            <Button type="submit" className="flex-1" disabled={creating}>
              {creating
                ? taskId !== "new"
                  ? "Updating..."
                  : "Creating..."
                : taskId !== "new"
                ? "Update Task"
                : "Create Task"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Page;

function CloudinaryUploader({ onUpload, disabled }) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{ maxFiles: 1, multiple: false }}
      onSuccess={(result) => {
        if (result.event === "success") {
          const { secure_url, public_id, original_filename } = result.info;
          console.log(result);
          onUpload({ secure_url, public_id, original_filename });
        }
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          onClick={() => open?.()}
          variant="outline"
          disabled={disabled}
        >
          Upload File
        </Button>
      )}
    </CldUploadWidget>
  );
}

