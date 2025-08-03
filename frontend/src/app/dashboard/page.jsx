"use client";
import { useUserAuth } from "@/contexts/UserAuthContext";
import React, { useState } from "react";

function Page() {
  const { user, loading } = useUserAuth();
  if (loading) return <Spinner />;
  if (loading) return <div>Loading...</div>;
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "user") return <UserDashboard />;
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>{user ? `${user.email} - ${user.role}` : "No User Found"}</div>
      )}
    </div>
  );
}

export default Page;

import StatsCards from "@/components/admin/StatsCards";
import UsersTable from "@/components/admin/UsersTable";
import RecentTasksTable from "@/components/admin/RecentTasksTable";
import Spinner from "@/components/shared/Spinner";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import UserForm from "@/components/admin/UserForm";

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

function DashboardHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage users, tasks, and overview everything here.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setOpen(!open)} variant="outline">
          Add User
        </Button>
        <Link
          href="/tasks/new"
          className={buttonVariants({ variant: "default" })}
        >
          Add Task
        </Link>
        <UserForm open={open} setOpen={setOpen} />
      </div>
    </div>
  );
}
