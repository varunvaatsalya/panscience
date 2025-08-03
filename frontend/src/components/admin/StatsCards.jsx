"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, CheckCircle, Hourglass } from "lucide-react";

export default function StatsCards() {
  const stats = [
    { title: "Total Users", icon: <Users className="text-yellow-600" />, value: 12 },
    { title: "Total Tasks", icon: <ClipboardList className="text-yellow-600" />, value: 38 },
    { title: "Completed", icon: <CheckCircle className="text-green-600" />, value: 22 },
    { title: "In Progress", icon: <Hourglass className="text-blue-600" />, value: 10 },
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
            <div className="text-2xl font-bold">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
