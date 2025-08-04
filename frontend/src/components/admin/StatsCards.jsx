"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";
import Cookies from "js-cookie";
import { Users, ClipboardList, CheckCircle, Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";

export default function StatsCards() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("sessionToken");
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        res = await res.json();
        if (res.success) {
          setStatsData(res.stats);
        } else showError(res.message);
      } catch (error) {
        console.log(error);
        showError("internal server error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  const stats = [
    {
      title: "Total Users",
      icon: <Users className="text-yellow-600" />,
      value: statsData?.totalUsers || 0,
    },
    {
      title: "Total Tasks",
      icon: <ClipboardList className="text-rose-600" />,
      value: statsData?.totalTasks || 0,
    },
    {
      title: "Completed",
      icon: <CheckCircle className="text-green-600" />,
      value: statsData?.pendingTasks || 0,
    },
    {
      title: "Pending",
      icon: <Hourglass className="text-blue-600" />,
      value: statsData?.completedTasks || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
            {s.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <BiLoaderCircle className="size-5 animate-spin" />
              ) : (
                s.value
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
