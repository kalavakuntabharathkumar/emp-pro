import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListAttendance,
  useCreateAttendance,
  useCheckOut,
  getListAttendanceQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CalendarCheck, Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

type AttendanceRecord = {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: string;
  work_hours?: number | null;
  notes?: string | null;
};

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function recordDate(dateStr: string): string {
  if (dateStr.includes("T")) return dateStr.slice(0, 10);
  return dateStr.slice(0, 10);
}

function PersonHistorySheet({
  employeeId,
  employeeName,
  onClose,
}: {
  employeeId: number | null;
  employeeName: string;
  onClose: () => void;
}) {
  const { data: history, isLoading } = useListAttendance(
    employeeId ? { employee_id: employeeId } : undefined,
    { query: { enabled: !!employeeId } }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "absent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "late": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "half_day": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "on_leave": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const presentDays = history?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
  const absentDays = history?.filter((r) => r.status === "absent").length ?? 0;
  const totalHours = history?.reduce((sum, r) => sum + (r.work_hours ?? 0), 0) ?? 0;

  return (
    <Sheet open={!!employeeId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            {employeeName}'s Attendance
          </SheetTitle>
        </SheetHeader>

        {!isLoading && history && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{presentDays}</div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-0.5">Present</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{absentDays}</div>
              <div className="text-xs text-red-600 dark:text-red-500 mt-0.5">Absent</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalHours.toFixed(0)}h</div>
              <div className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Total hrs</div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : history?.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground border border-dashed rounded-lg">
            No attendance records found
          </div>
        ) : (
          <div className="space-y-2">
            {history?.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary leading-none">
                    {new Date(record.date + "T00:00:00").getDate()}
                  </span>
                  <span className="text-[10px] text-primary/80 uppercase leading-none mt-0.5">
                    {new Date(record.date + "T00:00:00").toLocaleString("default", { month: "short" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {record.check_in
                        ? new Date(record.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </span>
                    {record.check_out && (
                      <>
                        <span>→</span>
                        <span>
                          {new Date(record.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </>
                    )}
                    {record.work_hours && (
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Clock className="w-3 h-3" />{record.work_hours}h
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={`${getStatusColor(record.status)} text-xs capitalize shrink-0`} variant="outline">
                  {record.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Attendance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: attendance, isLoading } = useListAttendance();
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);

  const checkIn = useCreateAttendance({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() });
      },
    },
  });

  const checkOut = useCheckOut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() });
      },
    },
  });

  const todayStr = localToday();

  const todayRecord = attendance?.find((r) => {
    return recordDate(r.date) === todayStr && r.employee_id === user?.id;
  });

  const hasCheckedIn = !!(todayRecord?.check_in);
  const hasCheckedOut = !!(todayRecord?.check_out);

  const handleCheckIn = () => {
    if (!user) return;
    const now = new Date();
    checkIn.mutate({
      data: {
        employee_id: user.id,
        date: todayStr,
        check_in: now.toISOString(),
      },
    });
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    checkOut.mutate({ id: todayRecord.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "absent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "late": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "half_day": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "on_leave": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Track daily check-ins and hours.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-40"
            onClick={handleCheckIn}
            disabled={hasCheckedIn || checkIn.isPending}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {checkIn.isPending ? "Checking in…" : hasCheckedIn ? "Checked In ✓" : "Check In"}
          </Button>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40"
            onClick={handleCheckOut}
            disabled={!hasCheckedIn || hasCheckedOut || checkOut.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {checkOut.isPending ? "Checking out…" : hasCheckedOut ? "Checked Out ✓" : "Check Out"}
          </Button>
        </div>
      </div>

      {/* Today status banner */}
      {hasCheckedIn && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 rounded-lg px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Checked in at{" "}
            <strong>
              {new Date(todayRecord!.check_in!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </strong>
            {hasCheckedOut && (
              <> · Checked out at{" "}
                <strong>
                  {new Date(todayRecord!.check_out!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </strong>
                {todayRecord?.work_hours && <> · <strong>{todayRecord.work_hours}h</strong> worked</>}
              </>
            )}
          </span>
        </div>
      )}

      {!hasCheckedIn && !isLoading && (
        <div className="flex items-center gap-3 bg-muted/40 border rounded-lg px-4 py-3 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You haven't checked in today. Click <strong>Check In</strong> to record your attendance.</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Attendance Log</span>
            <span className="text-xs font-normal text-muted-foreground">Click a row to see full history</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border divide-y">
              {attendance?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No attendance records found.</div>
              ) : (
                attendance?.map(record => (
                  <div
                    key={record.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() =>
                      setSelectedEmployee({
                        id: record.employee_id,
                        name: record.employee_name || "Employee",
                      })
                    }
                  >
                    <div className="col-span-12 sm:col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {new Date(record.date + "T00:00:00").getDate()}
                        </span>
                        <span className="text-[10px] text-primary/80 uppercase leading-none">
                          {new Date(record.date + "T00:00:00").toLocaleString("default", { month: "short" })}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{record.employee_name}</div>
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <div className="text-xs text-muted-foreground mb-1">Check In</div>
                      <div className="font-mono text-sm">
                        {record.check_in
                          ? new Date(record.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <div className="text-xs text-muted-foreground mb-1">Check Out</div>
                      <div className="font-mono text-sm">
                        {record.check_out
                          ? new Date(record.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </div>
                    </div>
                    <div className="col-span-12 sm:col-span-3 flex justify-between sm:justify-end items-center gap-4">
                      {record.work_hours && (
                        <div className="text-sm font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {record.work_hours}h
                        </div>
                      )}
                      <Badge className={getStatusColor(record.status)} variant="outline">
                        {record.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PersonHistorySheet
        employeeId={selectedEmployee?.id ?? null}
        employeeName={selectedEmployee?.name ?? ""}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
}
