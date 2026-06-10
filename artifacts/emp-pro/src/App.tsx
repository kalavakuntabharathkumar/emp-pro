import React from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import EmployeeDetail from "@/pages/employee-detail";
import Departments from "@/pages/departments";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Tasks from "@/pages/tasks";
import Timesheets from "@/pages/timesheets";
import Attendance from "@/pages/attendance";
import Performance from "@/pages/performance";
import Notifications from "@/pages/notifications";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, path }: { component: any, path: string }) {
  return (
    <Route path={path}>
      {(params) => {
        const { user, isLoading } = useAuth();
        if (isLoading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
        if (!user) return <Redirect to="/login" />;

        return (
          <Layout>
            <Component params={params} />
          </Layout>
        );
      }}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {() => {
          const { user, isLoading } = useAuth();
          if (isLoading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
          if (user) return <Redirect to="/dashboard" />;
          return <Redirect to="/login" />;
        }}
      </Route>

      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/employees" component={Employees} />
      <ProtectedRoute path="/employees/:id" component={EmployeeDetail} />
      <ProtectedRoute path="/departments" component={Departments} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetail} />
      <ProtectedRoute path="/tasks" component={Tasks} />
      <ProtectedRoute path="/timesheets" component={Timesheets} />
      <ProtectedRoute path="/attendance" component={Attendance} />
      <ProtectedRoute path="/performance" component={Performance} />
      <ProtectedRoute path="/notifications" component={Notifications} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/settings" component={Settings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
