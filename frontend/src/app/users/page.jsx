"use client";
import UserForm from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showError } from "@/utils/toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline, IoMdArrowRoundBack } from "react-icons/io";

function Page() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editUserDeatils, setEditUserDeatils] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users?page=${page}&query=${query}&taskCount=1`,
          {
            credentials: "include",
          }
        );
        res = await res.json();
        if (res.success) {
          setUsers(res.users);
          setTotalPages(res.totalPages);
        } else showError("Error While fetching User list");
      } catch (error) {
        console.log(error);
        showError("Error While fetching User list on client side");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [page, query]);

  return (
    <div className="h-[100dvh] w-full max-w-5xl mx-auto text-sm font-sans p-2 space-y-2">
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
          <div className="font-bold text-xl px-2">Your Users</div>
        </div>
        <Button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1"
        >
          <IoIosAddCircleOutline />
          <div>Add User</div>
        </Button>
        <UserForm
          open={open}
          setOpen={setOpen}
          data={editUserDeatils}
          setUsers={setUsers}
          setData={(val) => setEditUserDeatils(val)}
        />
      </div>
      <Input
        placeholder="Search with name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 min-w-24"
      />
      <div className="rounded-md border overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center px-4 py-2 border-b text-xs font-semibold bg-muted text-muted-foreground">
          <div className="w-8">#</div>
          <div className="min-w-24 flex-1">Name</div>
          <div className="min-w-24 flex-1">Email</div>
          <div className="w-24">Task</div>
          <div className="w-24 text-right pr-2">Action</div>
        </div>

        {/* Merchant Rows */}
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
          ) : users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={user._id}
                className="flex items-center px-4 py-2 border-b text-sm hover:bg-muted transition"
              >
                <div className="w-8 text-xs text-muted-foreground">
                  {index + 1}
                </div>
                <div className="truncate min-w-24 flex-1">{user.name}</div>
                <div className="truncate min-w-24 flex-1 text-muted-foreground">
                  {user.email}
                </div>
                <div className="w-24 text-xs truncate">{user.taskCount}</div>
                <div className="w-24 text-right pr-2">
                  <Button
                    variant="link"
                    onClick={() => {
                      setEditUserDeatils(user);
                      setOpen(!open);
                    }}
                    className="underline"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center px-4 py-2 border-b text-sm">
              No Users Available
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
    </div>
  );
}

export default Page;
