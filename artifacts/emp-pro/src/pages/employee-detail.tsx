import React from "react";
import { Link } from "wouter";
import { useGetEmployee, useListTasks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MapPin, Building2, CalendarDays, ArrowLeft, Edit } from "lucide-react";

export default function EmployeeDetail({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const { data: employee, isLoading } = useGetEmployee(id);
  const { data: tasks } = useListTasks({ assignee_id: id }, { query: { enabled: !!id } as any });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) return <div>Employee not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/employees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Employee Profile</h2>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={employee.avatar_url || ""} />
              <AvatarFallback className="text-2xl">{employee.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 w-full space-y-5">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{employee.full_name}</h3>
                  <p className="text-muted-foreground text-lg">{employee.job_title || "—"}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {employee.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{employee.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${employee.email}`} className="text-foreground hover:underline truncate">{employee.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="text-foreground truncate">{employee.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="text-foreground truncate">{employee.department_name || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span className="text-foreground truncate">Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-foreground truncate">{employee.address || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto inline-flex">
          <TabsTrigger value="tasks">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks?.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">No assigned tasks</div>
              ) : (
                <div className="space-y-4">
                  {tasks?.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{task.project_name}</div>
                      </div>
                      <Badge variant={task.status === 'done' ? 'default' : 'secondary'} className="capitalize">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 text-muted-foreground">Available from Performance module</div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timesheets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Timesheets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 text-muted-foreground">Available from Timesheets module</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
