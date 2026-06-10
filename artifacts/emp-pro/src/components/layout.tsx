import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Building2, FolderKanban, CheckSquare, Clock, CalendarCheck, TrendingUp, Bell, BarChart3, Settings, LogOut, Sun, Moon } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
    { title: "Employees", icon: Users, url: "/employees" },
    { title: "Departments", icon: Building2, url: "/departments", adminOnly: true },
    { title: "Projects", icon: FolderKanban, url: "/projects" },
    { title: "Tasks", icon: CheckSquare, url: "/tasks" },
    { title: "Timesheets", icon: Clock, url: "/timesheets" },
    { title: "Attendance", icon: CalendarCheck, url: "/attendance" },
    { title: "Performance", icon: TrendingUp, url: "/performance" },
    { title: "Analytics", icon: BarChart3, url: "/analytics", adminOnly: true },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background w-full">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <div className="font-bold text-lg flex items-center gap-2 text-primary-foreground">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">EP</div>
              EMP Pro
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/60">Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location.startsWith(item.url)} tooltip={item.title}>
                        <Link href={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-2 rounded-md transition-colors">
                  <Avatar className="h-8 w-8 rounded bg-primary/20">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                    <AvatarFallback className="bg-primary/20 text-primary-foreground">{user.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-medium truncate">{user.full_name}</span>
                    <span className="text-xs text-sidebar-foreground/60 truncate">{user.role}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold capitalize">
                {location.split("/")[1] || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full text-muted-foreground hover:text-foreground"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/notifications" className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
              </Link>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 bg-muted/30">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
