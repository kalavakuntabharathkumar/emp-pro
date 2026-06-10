import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useListDepartments,
  useCreateDepartment,
  useListEmployees,
  getListDepartmentsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users, X, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const deptSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});

type DeptForm = z.infer<typeof deptSchema>;

type Department = {
  id: number;
  name: string;
  description?: string | null;
  head_name?: string | null;
  employee_count?: number;
};

function DepartmentEmployeesSheet({
  dept,
  onClose,
}: {
  dept: Department | null;
  onClose: () => void;
}) {
  const { data: employeesData, isLoading } = useListEmployees(
    dept ? { department_id: dept.id } : undefined,
    { query: { enabled: !!dept } }
  );

  return (
    <Sheet open={!!dept} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {dept?.name}
          </SheetTitle>
          {dept?.description && (
            <p className="text-sm text-muted-foreground">{dept.description}</p>
          )}
        </SheetHeader>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Team Members
          </span>
          <Badge variant="secondary" className="font-semibold">
            {employeesData?.total ?? dept?.employee_count ?? 0}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : employeesData?.employees?.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No employees in this department
          </div>
        ) : (
          <div className="space-y-2">
            {employeesData?.employees?.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {emp.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{emp.full_name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    {emp.job_title || "No title"}
                  </div>
                </div>
                <Badge
                  variant={emp.status === "active" ? "default" : "secondary"}
                  className="text-xs capitalize shrink-0"
                >
                  {emp.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Departments() {
  const { data: departments, isLoading } = useListDepartments();
  const [open, setOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createDept = useCreateDepartment();

  const form = useForm<DeptForm>({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (values: DeptForm) => {
    createDept.mutate(
      { data: { name: values.name, description: values.description || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Department created", description: `"${values.name}" has been added.` });
          form.reset();
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to create department",
            description: err?.message || "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">Manage organization structure and teams.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-[150px] mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : departments?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            No departments found.
          </div>
        ) : (
          departments?.map((dept) => (
            <Card
              key={dept.id}
              className="hover-elevate shadow-sm flex flex-col cursor-pointer group transition-all border-border/60 hover:border-primary/40 hover:shadow-md"
              onClick={() => setSelectedDept(dept)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                    <Building2 className="h-5 w-5 text-primary" />
                    {dept.name}
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">
                  {dept.description || "No description provided."}
                </p>
              </CardHeader>
              <CardContent className="mt-auto pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Department Head</span>
                    <span className="font-medium">{dept.head_name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{dept.employee_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DepartmentEmployeesSheet dept={selectedDept} onClose={() => setSelectedDept(null)} />

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) form.reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this department..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); form.reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDept.isPending}>
                  {createDept.isPending ? "Creating..." : "Create Department"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
