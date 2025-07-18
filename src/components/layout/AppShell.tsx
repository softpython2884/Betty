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
  Briefcase,
  FileText,
  UserCheck,
  UserCog,
  UserPlus,
  BookOpen,
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

const menuConfig = {
    student: {
        label: "Étudiant",
        level: "Niveau 5",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
            { href: "/quests", label: "Quêtes", icon: Swords },
            { href: "/profile", label: "Profil", icon: User },
        ]
    },
    professor: {
        label: "Professeur",
        level: "Instructeur",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
            { href: "/admin/quests", label: "Éditeur de Quêtes", icon: BookCopy },
            { href: "/admin/users", label: "Gestion Étudiants", icon: Users },
            { href: "/grading", label: "File d'évaluation", icon: FileText },
        ]
    },
    manager: {
        label: "Manager",
        level: "Responsable",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/manager", label: "Tableau de bord", icon: LayoutDashboard },
            { href: "/admin/users", label: "Gérer les utilisateurs", icon: UserCog },
            { href: "/admin/quests", label: "Aperçu du cursus", icon: BookOpen },
        ]
    },
    admin: {
        label: "Administrateur",
        level: "SysOp",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/admin/users", label: "Gestion Utilisateurs", icon: Users },
            { href: "/admin/quests", label: "Éditeur de Quêtes", icon: BookCopy },
            { href: "/admin/settings", label: "Paramètres Plateforme", icon: Settings },
        ]
    },
    staff: {
        label: "Personnel",
        level: "Support",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/staff", label: "Tableau de bord", icon: LayoutDashboard },
            { href: "/admin/settings", label: "Annonces", icon: Settings },
        ]
    },
    intern: {
        label: "Stagiaire",
        level: "Niveau 1",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/intern", label: "Tableau de bord", icon: LayoutDashboard },
            { href: "/quests", label: "Mes Quêtes", icon: Swords },
        ]
    },
    guest: {
        label: "Invité",
        level: "Visiteur",
        profileImage: "https://placehold.co/40x40.png",
        items: [
            { href: "/guest", label: "Bienvenue", icon: UserCheck },
        ]
    }
};

type UserRole = keyof typeof menuConfig;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  
  const [userRole, setUserRole] = React.useState<UserRole>("student");

  const { label: userDisplayName, level: userLevel, profileImage, items: menuItems } = menuConfig[userRole];

  const cycleRole = () => {
    const roles = Object.keys(menuConfig) as UserRole[];
    const currentIndex = roles.indexOf(userRole);
    const nextIndex = (currentIndex + 1) % roles.length;
    setUserRole(roles[nextIndex]);
  };

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
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
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
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileImage} alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>{userDisplayName.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">{userDisplayName}</span>
                    <span className="text-xs text-muted-foreground">{userLevel}</span>
                  </div>
                  <MoreVertical className="ml-auto group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={cycleRole}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Changer de Rôle (Dev)</span>
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
