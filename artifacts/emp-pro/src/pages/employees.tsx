import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useListEmployees,
  useDeleteEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useListDepartments,
} from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreVertical, Trash2, Pencil } from "lucide-react";

type EmployeeSummary = { id: number; full_name: string; email: string };

type EmployeeRow = {
  id: number;
  full_name: string;
  email: string;
  job_title?: string;
  phone?: string;
  department_id?: number;
  department_name?: string;
  role: string;
  status: string;
  salary?: number;
  avatar_url?: string;
};

// ── Add schema ───────────────────────────────────────────────────────────────
const addSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  job_title: z.string().optional(),
  phone: z.string().optional(),
  department_id: z.string().optional(),
  role: z.enum(["employee", "admin"]),
  salary: z.string().optional(),
});
type AddForm = z.infer<typeof addSchema>;

// ── Edit schema ──────────────────────────────────────────────────────────────
const editSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  job_title: z.string().optional(),
  phone: z.string().optional(),
  department_id: z.string().optional(),
  role: z.enum(["employee", "admin"]),
  status: z.enum(["active", "inactive", "on_leave"]),
  salary: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

// ── Component ────────────────────────────────────────────────────────────────
export default function Employees() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeRow | null>(null);
  const [toDelete, setToDelete] = useState<EmployeeSummary | null>(null);

  const { data, isLoading } = useListEmployees({ search: search || undefined });
  const { data: departments } = useListDepartments();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const isAdmin = user?.role === "admin";

  // ── Add form ────────────────────────────────────────────────────────────────
  const addForm = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      full_name: "", email: "", password: "",
      job_title: "", phone: "", department_id: "",
      role: "employee", salary: "",
    },
  });

  const onAdd = (values: AddForm) => {
    const today = new Date().toISOString().split("T")[0];
    createEmployee.mutate(
      {
        data: {
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          job_title: values.job_title || undefined,
          phone: values.phone || undefined,
          department_id: values.department_id ? Number(values.department_id) : undefined,
          role: values.role as "employee" | "admin",
          salary: values.salary ? Number(values.salary) : undefined,
          hire_date: today,
          status: "active",
        },
      },
      {
        onSuccess: (emp) => {
          toast({ title: "Employee added", description: `${emp.full_name} has been added.` });
          addForm.reset();
          setAddOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        },
        onError: (err: any) => {
          toast({ title: "Failed to add", description: err?.message || "Something went wrong.", variant: "destructive" });
        },
      }
    );
  };

  // ── Edit form ───────────────────────────────────────────────────────────────
  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: "", job_title: "", phone: "",
      department_id: "", role: "employee", status: "active", salary: "",
    },
  });

  useEffect(() => {
    if (editTarget) {
      editForm.reset({
        full_name: editTarget.full_name,
        job_title: editTarget.job_title || "",
        phone: editTarget.phone || "",
        department_id: editTarget.department_id ? String(editTarget.department_id) : "",
        role: (editTarget.role as "employee" | "admin") || "employee",
        status: (editTarget.status as "active" | "inactive" | "on_leave") || "active",
        salary: editTarget.salary ? String(editTarget.salary) : "",
      });
    }
  }, [editTarget]);

  const onEdit = (values: EditForm) => {
    if (!editTarget) return;
    updateEmployee.mutate(
      {
        id: editTarget.id,
        data: {
          full_name: values.full_name,
          job_title: values.job_title || undefined,
          phone: values.phone || undefined,
          department_id: values.department_id ? Number(values.department_id) : undefined,
          role: values.role as "employee" | "admin",
          status: values.status as "active" | "inactive" | "on_leave",
          salary: values.salary ? Number(values.salary) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Employee updated", description: `${values.full_name}'s details have been saved.` });
          setEditTarget(null);
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        },
        onError: (err: any) => {
          toast({ title: "Failed to update", description: err?.message || "Something went wrong.", variant: "destructive" });
        },
      }
    );
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteEmployee.mutate(
      { id: toDelete.id },
      {
        onSuccess: () => {
          toast({ title: "Employee removed", description: `${toDelete.full_name} has been deleted.` });
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
          setToDelete(null);
        },
        onError: (err: any) => {
          toast({ title: "Failed to delete", description: err?.message || "Something went wrong.", variant: "destructive" });
          setToDelete(null);
        },
      }
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage your organization's workforce.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-5 sm:col-span-4">Employee</div>
                <div className="hidden sm:block col-span-3">Department</div>
                <div className="hidden md:block col-span-2">Role</div>
                <div className="col-span-4 sm:col-span-2">Status</div>
                <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y">
                {data?.items?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No employees found.</div>
                ) : (
                  data?.items?.map((employee) => (
                    <div key={employee.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.avatar_url || ""} />
                          <AvatarFallback>{employee.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/employees/${employee.id}`} className="font-medium hover:underline text-primary">
                            {employee.full_name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{employee.email}</div>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col col-span-3">
                        <span className="text-sm">{employee.department_name || "—"}</span>
                        <span className="text-xs text-muted-foreground">{employee.job_title || "—"}</span>
                      </div>
                      <div className="hidden md:block col-span-2 text-sm capitalize">{employee.role}</div>
                      <div className="col-span-4 sm:col-span-2">
                        <Badge variant={employee.status === "active" ? "default" : "secondary"} className="capitalize">
                          {employee.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="col-span-3 sm:col-span-1 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/employees/${employee.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setEditTarget(employee as EmployeeRow)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                  onClick={() =>
                                    setToDelete({ id: employee.id, full_name: employee.full_name, email: employee.email })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Employee
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Employee Dialog ─────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) addForm.reset(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAdd)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={addForm.control} name="full_name" render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={addForm.control} name="email" render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="jane@company.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={addForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="password" placeholder="Min. 6 characters" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={addForm.control} name="job_title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Engineer" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={addForm.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+1 555 000 0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={addForm.control} name="department_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={addForm.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={addForm.control} name="salary" render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (annual)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g. 75000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => { setAddOpen(false); addForm.reset(); }}>Cancel</Button>
                <Button type="submit" disabled={createEmployee.isPending}>
                  {createEmployee.isPending ? "Adding…" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Employee Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <FormField control={editForm.control} name="full_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="job_title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Engineer" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+1 555 000 0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="department_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {departments?.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="salary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary (annual)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 75000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                <Button type="submit" disabled={updateEmployee.isPending}>
                  {updateEmployee.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!toDelete} onOpenChange={(open) => { if (!open) setToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{toDelete?.full_name}</span>{" "}
              ({toDelete?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteEmployee.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
