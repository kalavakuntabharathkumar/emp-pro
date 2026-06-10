import React from "react";
import { Link } from "wouter";
import { useGetProject, useListTasks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Calendar, Settings, Clock, CheckSquare } from "lucide-react";

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const { data: project, isLoading: loadingProject } = useGetProject(id);
  const { data: tasks, isLoading: loadingTasks } = useListTasks({ project_id: id }, { query: { enabled: !!id } as any });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const todoTasks = tasks?.filter(t => t.status === 'todo') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress' || t.status === 'review') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
              <Badge className={getStatusColor(project.status)} variant="outline">
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.department_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>{project.description || "No description provided."}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Overall Progress</span>
                  <span className="font-bold text-primary">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                  <div className="font-medium">{new Date(project.start_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Target End</div>
                  <div className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Manager</div>
                  <div className="font-medium">{project.manager_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Budget</div>
                  <div className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : '—'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span>Total</span>
                </div>
                <span className="font-bold">{project.task_count || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Completed</span>
                </div>
                <span className="font-bold">{project.completed_task_count || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Active</span>
                </div>
                <span className="font-bold">{(project.task_count || 0) - (project.completed_task_count || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-[400px]">
        <h3 className="text-lg font-semibold mb-4">Task Board</h3>
        
        {loadingTasks ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <Skeleton className="h-full rounded-lg" />
            <Skeleton className="h-full rounded-lg" />
            <Skeleton className="h-full rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* To Do Column */}
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col gap-3 min-h-[200px]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">To Do</h4>
                <Badge variant="secondary">{todoTasks.length}</Badge>
              </div>
              {todoTasks.map(task => (
                <Card key={task.id} className="cursor-pointer hover-elevate">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium leading-tight mb-2">{task.title}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px] py-0">{task.priority}</Badge>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={task.assignee_avatar || ""} />
                        <AvatarFallback className="text-[8px]">{task.assignee_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* In Progress Column */}
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col gap-3 min-h-[200px]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">In Progress</h4>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">{inProgressTasks.length}</Badge>
              </div>
              {inProgressTasks.map(task => (
                <Card key={task.id} className="cursor-pointer hover-elevate border-l-2 border-l-blue-500">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium leading-tight mb-2">{task.title}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground capitalize">{task.status.replace('_', ' ')}</span>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={task.assignee_avatar || ""} />
                        <AvatarFallback className="text-[8px]">{task.assignee_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Done Column */}
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col gap-3 min-h-[200px]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">Done</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">{doneTasks.length}</Badge>
              </div>
              {doneTasks.map(task => (
                <Card key={task.id} className="cursor-pointer hover-elevate border-l-2 border-l-green-500 opacity-75 hover:opacity-100">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium leading-tight mb-2 line-through text-muted-foreground">{task.title}</p>
                    <div className="flex justify-end">
                      <Avatar className="h-5 w-5 grayscale">
                        <AvatarImage src={task.assignee_avatar || ""} />
                        <AvatarFallback className="text-[8px]">{task.assignee_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
