import React, { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTasks,
  useCreateTask,
  useListProjects,
  useListEmployees,
  useUpdateTask,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  CheckSquare,
  Clock,
  Plus,
  Filter,
  X,
  ChevronDown,
  Users,
  CalendarDays,
  Briefcase,
  Timer,
  Edit2,
  Save,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EmployeeItem = { id: number; full_name: string; avatar_url?: string | null };

/* ─── Reusable multi-select ─────────────────────────────────────────────── */
function AssigneeMultiSelect({
  employees,
  selected,
  onChange,
  placeholder = "Select assignees...",
  compact = false,
}: {
  employees: EmployeeItem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase())
  );
  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  const selectedEmployees = employees.filter((e) => selected.includes(e.id));

  return (
    <div className="relative" ref={ref}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm bg-background hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring min-h-[38px] cursor-pointer select-none"
      >
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {selectedEmployees.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : compact && selectedEmployees.length > 2 ? (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
              <Users className="w-3 h-3" />
              {selectedEmployees.length} people
            </span>
          ) : (
            selectedEmployees.map((e) => (
              <span
                key={e.id}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium"
              >
                <Avatar className="w-4 h-4">
                  <AvatarImage src={e.avatar_url || ""} />
                  <AvatarFallback className="text-[8px]">{e.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                {e.full_name.split(" ")[0]}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    toggle(e.id);
                  }}
                  onKeyDown={(ev) => { if (ev.key === "Enter") { ev.stopPropagation(); toggle(e.id); } }}
                  className="hover:text-destructive ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {selected.length > 0 && (
              <>
                <div
                  role="option"
                  aria-selected={false}
                  tabIndex={0}
                  onClick={() => onChange([])}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange([]); } }}
                  className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted flex items-center gap-2 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear all ({selected.length} selected)
                </div>
                <div className="border-t my-1" />
              </>
            )}
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">No employees found</p>
            ) : (
              filtered.map((e) => (
                <div
                  key={e.id}
                  role="option"
                  aria-selected={selected.includes(e.id)}
                  tabIndex={0}
                  onClick={() => toggle(e.id)}
                  onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggle(e.id); } }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${selected.includes(e.id) ? "bg-primary border-primary" : "border-input"}`}>
                    {selected.includes(e.id) && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={e.avatar_url || ""} />
                    <AvatarFallback className="text-[9px]">{e.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{e.full_name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stacked avatars on card ───────────────────────────────────────────── */
function AvatarStack({
  assignees,
}: {
  assignees: { id: number; full_name: string; avatar_url?: string | null }[];
}) {
  const show = assignees.slice(0, 3);
  const extra = assignees.length - show.length;
  if (assignees.length === 0)
    return (
      <Avatar className="w-6 h-6 border bg-muted">
        <AvatarFallback className="text-[10px]">?</AvatarFallback>
      </Avatar>
    );
  return (
    <div className="flex -space-x-1.5" title={assignees.map((a) => a.full_name).join(", ")}>
      {show.map((a) => (
        <Avatar
          key={a.id}
          className="w-6 h-6 border-2 border-background bg-muted ring-1 ring-border"
        >
          <AvatarImage src={a.avatar_url || ""} />
          <AvatarFallback className="text-[9px]">{a.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center text-[9px] font-medium text-muted-foreground">
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─── Priority badge helper ─────────────────────────────────────────────── */
function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">High</Badge>;
    case "low":
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="outline">Medium</Badge>;
  }
}

/* ─── Status badge helper ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

/* ─── Task Detail Dialog ─────────────────────────────────────────────────── */
function TaskDetailDialog({
  task,
  employees,
  onClose,
}: {
  task: any;
  employees: EmployeeItem[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        toast({ title: "Task updated", description: "Changes saved successfully." });
        setEditing(false);
      },
      onError: () => toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" }),
    },
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title ?? "",
    description: task.description ?? "",
    status: task.status ?? "todo",
    priority: task.priority ?? "medium",
    assignee_ids: ((task.assignees ?? []) as any[]).map((a: any) => a.id) as number[],
    due_date: task.due_date ?? "",
    estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
    actual_hours: task.actual_hours ? String(task.actual_hours) : "",
  });

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const save = () => {
    updateTask.mutate({
      id: task.id,
      data: {
        title: form.title,
        description: form.description || null,
        status: form.status as any,
        priority: form.priority as any,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
        actual_hours: form.actual_hours ? Number(form.actual_hours) : null,
        assignee_ids: form.assignee_ids,
      } as any,
    });
  };

  const assigneeNames = ((task.assignees ?? []) as any[])
    .map((a: any) => a.full_name)
    .join(", ");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-lg leading-snug pr-6">
              {editing ? (
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className="text-base font-semibold"
                  autoFocus
                />
              ) : (
                task.title
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Status + Priority row */}
          <div className="flex flex-wrap gap-3">
            {editing ? (
              <>
                <div className="space-y-1 flex-1 min-w-[120px]">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={form.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1 min-w-[120px]">
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            )}
          </div>

          <Separator />

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Project
              </p>
              <p className="font-medium">{task.project_name ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> Due Date
              </p>
              {editing ? (
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => set("due_date", e.target.value)}
                  className="h-7 text-sm"
                />
              ) : (
                <p className="font-medium">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Est. Hours
              </p>
              {editing ? (
                <Input
                  type="number"
                  min="0"
                  value={form.estimated_hours}
                  onChange={(e) => set("estimated_hours", e.target.value)}
                  className="h-7 text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="font-medium">{task.estimated_hours ?? "—"} hrs</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Actual Hours
              </p>
              {editing ? (
                <Input
                  type="number"
                  min="0"
                  value={form.actual_hours}
                  onChange={(e) => set("actual_hours", e.target.value)}
                  className="h-7 text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="font-medium">{task.actual_hours ?? "—"} hrs</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Assignees */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Assignees
            </p>
            {editing ? (
              <AssigneeMultiSelect
                employees={employees}
                selected={form.assignee_ids}
                onChange={(ids) => set("assignee_ids", ids)}
              />
            ) : (task.assignees ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(task.assignees as any[]).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-1.5 bg-muted rounded-full px-2 py-1">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={a.avatar_url || ""} />
                      <AvatarFallback className="text-[9px]">{a.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{a.full_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No assignees</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Description</p>
            {editing ? (
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Add details about this task..."
                rows={3}
              />
            ) : task.description ? (
              <p className="text-sm leading-relaxed">{task.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description</p>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Created {new Date(task.created_at).toLocaleString()}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    title: task.title ?? "",
                    description: task.description ?? "",
                    status: task.status ?? "todo",
                    priority: task.priority ?? "medium",
                    assignee_ids: ((task.assignees ?? []) as any[]).map((a: any) => a.id),
                    due_date: task.due_date ?? "",
                    estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
                    actual_hours: task.actual_hours ? String(task.actual_hours) : "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={save} disabled={updateTask.isPending}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {updateTask.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setEditing(true)}>
                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Task
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── New Task Dialog ────────────────────────────────────────────────────── */
function NewTaskDialog({
  open,
  onClose,
  employees,
}: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeItem[];
}) {
  const queryClient = useQueryClient();
  const { data: projects } = useListProjects();
  const { toast } = useToast();
  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        toast({ title: "Task created", description: "New task added to the board." });
        onClose();
        setForm({
          title: "", description: "", status: "todo", priority: "medium",
          project_id: "", assignee_ids: [], due_date: "", estimated_hours: "",
        });
      },
      onError: () => toast({ title: "Error", description: "Failed to create task.", variant: "destructive" }),
    },
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    project_id: "",
    assignee_ids: [] as number[],
    due_date: "",
    estimated_hours: "",
  });

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project_id) return;
    createTask.mutate({
      data: {
        title: form.title.trim(),
        description: form.description || null,
        status: form.status as any,
        priority: form.priority as any,
        project_id: Number(form.project_id),
        assignee_ids: form.assignee_ids.length > 0 ? form.assignee_ids : null,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
      } as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Project *</Label>
            <Select value={form.project_id} onValueChange={(v) => set("project_id", v)}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Assignees{" "}
              <span className="text-xs text-muted-foreground font-normal">
                — select one or more
              </span>
            </Label>
            <AssigneeMultiSelect
              employees={employees}
              selected={form.assignee_ids}
              onChange={(ids) => set("assignee_ids", ids)}
              placeholder="Click to assign team members..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Est. Hours</Label>
              <Input
                type="number"
                min="1"
                value={form.estimated_hours}
                onChange={(e) => set("estimated_hours", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending || !form.project_id || !form.title.trim()}>
              {createTask.isPending ? "Creating…" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Filter Popover ─────────────────────────────────────────────────────── */
type FilterState = {
  project_id: string;
  status: string;
  priority: string;
  assignee_ids: number[];
};

function FilterPopover({
  filters,
  onChange,
  employees,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  employees: EmployeeItem[];
}) {
  const [open, setOpen] = useState(false);
  const { data: projects } = useListProjects();

  const activeCount = [
    filters.project_id !== "",
    filters.status !== "",
    filters.priority !== "",
    filters.assignee_ids.length > 0,
  ].filter(Boolean).length;

  const clear = () => onChange({ project_id: "", status: "", priority: "", assignee_ids: [] });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={activeCount > 0 ? "border-primary text-primary" : ""}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <span className="ml-1.5 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4 p-4" align="end">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filters</span>
          {activeCount > 0 && (
            <button
              onClick={clear}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Project</Label>
          <Select
            value={filters.project_id || "_all"}
            onValueChange={(v) => onChange({ ...filters, project_id: v === "_all" ? "" : v })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All projects</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.status || "_all"}
            onValueChange={(v) => onChange({ ...filters, status: v === "_all" ? "" : v })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Priority
          </Label>
          <Select
            value={filters.priority || "_all"}
            onValueChange={(v) => onChange({ ...filters, priority: v === "_all" ? "" : v })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All priorities</SelectItem>
              <SelectItem value="critical">🔴 Critical</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <Users className="w-3 h-3" /> Assignees
          </Label>
          <AssigneeMultiSelect
            employees={employees}
            selected={filters.assignee_ids}
            onChange={(ids) => onChange({ ...filters, assignee_ids: ids })}
            placeholder="All assignees"
            compact
          />
          {filters.assignee_ids.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              Tasks assigned to any selected person
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Main Tasks Page ────────────────────────────────────────────────────── */
export default function Tasks() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    project_id: "",
    status: "",
    priority: "",
    assignee_ids: [],
  });

  // Fetch ALL employees (page_size=100 covers virtually every org)
  const { data: employeesData } = useListEmployees({ page_size: 100 } as any);
  const employees: EmployeeItem[] = (employeesData?.items ?? []).map((e: any) => ({
    id: e.id,
    full_name: e.full_name,
    avatar_url: e.avatar_url ?? null,
  }));

  // Send project + status + priority to backend; filter assignees client-side
  const { data: allTasks, isLoading } = useListTasks({
    project_id: filters.project_id ? Number(filters.project_id) : undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
  });

  const tasks = (allTasks ?? []).filter((task) => {
    if (filters.assignee_ids.length === 0) return true;
    const ids: number[] = ((task as any).assignees ?? []).map((a: any) => a.id);
    return filters.assignee_ids.some((id) => ids.includes(id));
  });

  const columns = filters.status
    ? [filters.status]
    : ["todo", "in_progress", "review", "done"];

  const columnLabel: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage your assigned work and team tasks.</p>
        </div>
        <div className="flex gap-2">
          <FilterPopover filters={filters} onChange={setFilters} employees={employees} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        employees={employees}
      />

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          employees={employees}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {columns.map((status) => {
          const col = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {status === "todo" && <CheckSquare className="w-4 h-4 text-muted-foreground" />}
                  {status === "in_progress" && <Clock className="w-4 h-4 text-blue-500" />}
                  {status === "review" && <CheckSquare className="w-4 h-4 text-purple-500" />}
                  {status === "done" && <CheckSquare className="w-4 h-4 text-green-500" />}
                  {columnLabel[status] ?? status}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {col.length}
                </Badge>
              </div>

              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center mt-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="space-y-2.5">
                  {col.map((task) => {
                    const assignees = (task as any).assignees ?? [];
                    return (
                      <Card
                        key={task.id}
                        className="hover:shadow-md transition-shadow cursor-pointer border hover:border-primary/30"
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardHeader className="p-3 pb-2">
                          <div className="flex justify-between items-start gap-1.5 mb-1.5">
                            <PriorityBadge priority={task.priority} />
                            <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">
                              {task.project_name}
                            </span>
                          </div>
                          <CardTitle className="text-sm font-medium line-clamp-2 leading-snug">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString()
                                : "No due date"}
                            </div>
                            <AvatarStack assignees={assignees} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {col.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                      No tasks
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
