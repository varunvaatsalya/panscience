"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "@/utils/toast";
import Cookies from "js-cookie";

function UserForm({ open, setOpen, data, setData, setUsers }) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const token = Cookies.get("sessionToken");

  useEffect(() => {
    if (data) {
      setUser({
        name: data?.name || "",
        email: data?.email || "",
        password: "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // console.log(user);
      let res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users${
          data && data._id ? `/${data._id}` : ""
        }`,
        {
          method: data ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
          credentials: "include",
        }
      );
      res = await res.json();
      if (res.success) {
        showSuccess(res.message);
        setOpen(false);
        setUser({ name: "", email: "", password: "" });
        if (data) {
          setUsers((prevUsers) =>
            prevUsers.map((u) => (u._id === data._id ? res.user : u))
          );
          setData(null);
        } else setUsers((prevUsers) => [res.user, prevUsers]);
      }
    } catch (err) {
      console.error("User creation failed", err);
      showError(res.message || "Internal Server Err");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{data ? "Edit" : "Add New"} User</DialogTitle>
          <DialogDescription>
            Enter user details to create account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              id="name"
              value={user.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              type="email"
              id="email"
              value={user.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              name="password"
              type="password"
              id="password"
              value={user.password}
              onChange={handleChange}
              required={!data}
            />
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserForm;
