"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GraduationCap,
  LayoutDashboard,
  Swords,
  User,
  LogOut,
  Menu,
  MoreVertical,
  Settings,
  Shield,
  BookCopy,
  Users,
} from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface AppShellProps {
  children: React.ReactNode
}

const studentMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Quests", icon: Swords },
  { href: "/profile", label: "Profile", icon: User },
]

const adminMenuItems = [
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/quests", label: "Quest Editor", icon: BookCopy },
    { href: "/admin/settings", label: "Platform Settings", icon: Settings },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin');

  // For this prototype, we'll assume a user is either a student or admin.
  // In a real app, this would be based on user roles from your auth system.
  const userRole = "admin" // or "student"
  const menuItems = userRole === 'admin' ? adminMenuItems : studentMenuItems;
  const userDisplayName = userRole === 'admin' ? "Administrator" : "Adventurer";
  const userLevel = userRole === 'admin' ? 'SysOp' : 'Level 5';
  const profileImage = userRole === 'admin' ? 'https://placehold.co/40x40.png' : 'https://placehold.co/40x40.png';


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl group-data-[collapsible=icon]:hidden">
                CodeQuest
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            {userRole === 'student' && (
                <SidebarMenu>
                {studentMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                    >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            )}

             {userRole === 'admin' && (
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2">
                        <Shield />
                        Admin Panel
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {adminMenuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{ children: item.label }}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileImage} alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>AV</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">{userDisplayName}</span>
                    <span className="text-xs text-muted-foreground">{userLevel}</span>
                  </div>
                  <MoreVertical className="ml-auto group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/" legacyBehavior passHref>
                  <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:justify-end">
            <SidebarTrigger className="md:hidden" />
            {/* Header content can go here if needed */}
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
