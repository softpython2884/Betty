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
  MoreVertical,
  Settings,
  FolderKanban,
  CalendarDays,
  Link as LinkIcon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface AppShellProps {
  children: React.ReactNode
}

// Student-centric menu
const menuItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/quests", label: "Quêtes", icon: Swords },
    { href: "/projects", label: "Projets", icon: FolderKanban },
    { href: "/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/profile", label: "Profil", icon: User },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl group-data-[collapsible=icon]:hidden">
                Betty
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                        tooltip={{ children: item.label }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40" alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">Alex</span>
                    <span className="text-xs text-muted-foreground">Niveau 5</span>
                  </div>
                  <MoreVertical className="ml-auto group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <a href="https://flowup.app" target="_blank" rel="noopener noreferrer">Ouvrir FlowUp</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-red-500 focus:bg-red-500/10 focus:text-red-600">
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </Link>
                </DropdownMenuItem>
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
