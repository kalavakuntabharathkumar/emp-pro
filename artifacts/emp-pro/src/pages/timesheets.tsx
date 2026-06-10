import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTimesheets,
  useCreateTimesheet,
  useListProjects,
  useListTasks,
  getListTimesheetsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Plus } from "lucide-react";

function LogHoursDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: projects } = useListProjects();
  const { data: tasks } = useListTasks();
  const createTimesheet = useCreateTimesheet({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTimesheetsQueryKey() });
        onClose();
      },
    },
  });

  const [form, setForm] = useState({
    project_id: "",
    task_id: "",
    date: new Date().toISOString().slice(0, 10),
    hours: "",
    description: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const filteredTasks = form.project_id
    ? tasks?.filter((t) => t.project_id === Number(form.project_id))
    : tasks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_id || !form.hours || !form.date) return;
    createTimesheet.mutate({
      data: {
        project_id: Number(form.project_id),
        task_id: form.task_id ? Number(form.task_id) : null,
        date: form.date,
        hours: Number(form.hours),
        description: form.description || null,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Hours</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project *</Label>
            <Select
              value={form.project_id}
              onValueChange={(v) => {
                set("project_id", v);
                set("task_id", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Task</Label>
            <Select
              value={form.task_id}
              onValueChange={(v) => set("task_id", v === "_none" ? "" : v)}
              disabled={!form.project_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task (optional)..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No specific task</SelectItem>
                {filteredTasks?.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ts-date">Date *</Label>
              <Input
                id="ts-date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ts-hours">Hours *</Label>
              <Input
                id="ts-hours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={form.hours}
                onChange={(e) => set("hours", e.target.value)}
                placeholder="8"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ts-desc">Description</Label>
            <Textarea
              id="ts-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What did you work on?"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTimesheet.isPending || !form.project_id || !form.hours}
            >
              {createTimesheet.isPending ? "Saving…" : "Log Hours"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Timesheets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: timesheets, isLoading } = useListTimesheets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Timesheets</h2>
          <p className="text-muted-foreground">Log hours against projects and tasks.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Hours
        </Button>
      </div>

      <LogHoursDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border divide-y">
              {timesheets?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No timesheets found.
                </div>
              ) : (
                timesheets?.map((ts) => (
                  <div
                    key={ts.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <div className="font-medium">
                        {new Date(ts.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{ts.employee_name}</div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                      <div className="font-medium text-sm">{ts.project_name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {ts.task_title || ts.description}
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-2 font-mono flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {ts.hours}h
                    </div>
                    <div className="col-span-6 sm:col-span-3 text-right">
                      <Badge className={getStatusColor(ts.status)} variant="outline">
                        {ts.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
