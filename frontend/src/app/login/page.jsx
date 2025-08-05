"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { BiLoaderCircle } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError } from "@/utils/toast";
import { useUserAuth } from "@/contexts/UserAuthContext";
import Image from "next/image";
import LOGO from "@/assets/logo.png";

function Page() {
  const { setUser } = useUserAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      role: "admin",
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const token = Cookies.get("sessionToken");
      let result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      result = await result.json();
      if (result.success) {
        Cookies.set("sessionToken", result.token, {
          expires: 2,
          secure: true,
          sameSite: "None",
        });
        if (result.user) setUser(result.user);
        router.replace("/");
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border border-border bg-background/70 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="rounded-lg w-16 h-16 mx-auto mb-2">
              <Image src={LOGO} width={400} height={400} alt="PanScience" />
            </div>
            <CardTitle className="text-xl font-semibold">
              PanScience Task Manager
            </CardTitle>
            <CardDescription>
              Login to continue managing your tasks
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={watch("role")}
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                {submitting && (
                  <BiLoaderCircle className="size-5 animate-spin" />
                )}
                {submitting ? "Logging In..." : "Log In"}
              </Button>
            </form>

            <div className="mt-6 text-sm text-gray-600 bg-gray-100 p-3 rounded">
              <p className="mb-1 font-medium">🔑 Default Admin Credentials:</p>
              <p>
                <strong>Email:</strong> <code>admin@panscience.xyz</code>
              </p>
              <p>
                <strong>Password:</strong> <code>varungupta</code>
              </p>
              <p>
                <strong>Role:</strong> <code>admin</code>
              </p>
              <Button
                variant="link"
                className="px-0"
                onClick={() => {
                  setValue("email", "admin@panscience.xyz");
                  setValue("password", "varungupta");
                }}
              >
                Click Here to auto-fill
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              !This project is hosted on Render's free tier. The backend may
              take <strong>20–30 seconds</strong> to respond on first request.
              Please be patient.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
