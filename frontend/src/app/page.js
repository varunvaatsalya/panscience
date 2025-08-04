"use client";
import { useUserAuth } from "@/contexts/UserAuthContext";
import Spinner from "@/components/shared/Spinner";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

function Page() {
  const { user, loading } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) return <Spinner />;
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "user") return <UserDashboard />;

  return <></>;
}

export default Page;

import StatsCards from "@/components/admin/StatsCards";
import UsersTable from "@/components/admin/UsersTable";
import RecentTasksTable from "@/components/admin/RecentTasksTable";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import UserForm from "@/components/admin/UserForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Power } from "lucide-react";
import Cookies from "js-cookie";

function AdminDashboard() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <DashboardHeader />
      <StatsCards />
      <UsersTable />
      <RecentTasksTable />
    </div>
  );
}
function UserDashboard() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <DashboardHeader />
      <RecentTasksTable />
    </div>
  );
}

function DashboardHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confimOpen, setConfimOpen] = useState(false);
  const { user, loading, setUser } = useUserAuth();

  const handleLogout = () => {
    setConfimOpen(false);
    router.push("/login");
    Cookies.remove("sessionToken", {
      secure: true,
      sameSite: "None",
    });
    setUser(null);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {user.role === "admin" ? "Admin" : "User"} Dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage tasks and overview everything here.
        </p>
      </div>
      <div className="flex items-center gap-2 px-2">
        <div className="font-semibold">
          Hi!{" "}
          <span className="text-primary">{loading ? "User" : user.name}</span>
        </div>

        {user.role === "admin" && (
          <Button onClick={() => setOpen(!open)} variant="outline">
            Add User
          </Button>
        )}
        <Link
          href="/tasks/new"
          className={buttonVariants({ variant: "default" })}
        >
          Add Task
        </Link>
        <UserForm open={open} setOpen={setOpen} />
        <Dialog open={confimOpen} onOpenChange={setConfimOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500"
            >
              <Power className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">
                Confirm Logout
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to log out?
              </p>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
