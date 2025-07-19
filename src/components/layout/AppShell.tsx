
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Sparkles,
  UserCheck,
  ClipboardList,
  Bot,
  X,
  Send,
  Loader2,
  BookOpen,
  Compass,
  Gem,
  Shield,
  Award,
  Trophy,
  Code2,
} from 'lucide-react';

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
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { chatWithCodex, ChatWithCodexInput } from '@/ai/flows/codex-chat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { User as UserType, UserCosmetic } from '@/lib/db/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyCosmetics } from '@/app/actions/shop';
import GradientText from '../ui/gradient-text';


interface AppShellProps {
  children: React.ReactNode;
}

type Message = {
  role: 'user' | 'model';
  content: string;
};

const CodexWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const codexInput: ChatWithCodexInput = {
        query: input,
        context: `The user is currently on the page: ${pathname}.`,
        history: [...messages, userMessage],
      };
      const result = await chatWithCodex(codexInput);
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error with Codex chat:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur du Codex',
        description: 'Désolé, je ne parviens pas à répondre pour le moment.',
      });
       // Do not remove the user message if AI fails, so they can retry.
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg w-16 h-16"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="h-8 w-8" />
        </Button>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Codex
            </SheetTitle>
            <SheetDescription>
              Votre mentor IA, prêt à vous aider.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 flex flex-col mt-4 min-h-0">
            <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-4',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                      <Avatar className="border h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-xs rounded-lg p-3',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="border h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t pt-4"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const studentMenuItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/quests', label: 'Quêtes', icon: Swords },
  { href: '/guilds', label: 'Guildes', icon: Shield },
  { href: '/projects', label: 'Projets', icon: FolderKanban },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/treasure-hunt', label: 'Chasse au Trésor', icon: Trophy },
  { href: '/discovery', label: 'Découverte', icon: Compass },
  { href: '/snippets', label: 'Snippets', icon: Code2 },
  { href: '/shop', label: 'Boutique', icon: Gem },
  { href: '/resources', label: 'Ressources', icon: BookOpen },
  { href: '/ai-studio', label: 'AI Studio', icon: Sparkles },
];

const adminMenuItems = [
  { href: '/admin/users', label: 'User Management', icon: UserCheck },
  { href: '/admin/quests', label: 'Quest Editor', icon: Swords },
  { href: '/admin/guilds', label: 'Guild Management', icon: Shield },
  { href: '/admin/resources', label: 'Gérer les Ressources', icon: BookOpen },
  { href: '/admin/quests/quiz-builder', label: 'Quiz Builder', icon: ClipboardList },
  { href: '/admin/grading', label: 'Grading Queue', icon: GraduationCap },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<UserType | null>(null);
  const [userCosmetics, setUserCosmetics] = React.useState<UserCosmetic[]>([]);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);


  React.useEffect(() => {
    const fetchUser = async () => {
        setIsLoadingUser(true);
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                // Also fetch cosmetics
                const cosmeticsData = await getMyCosmetics();
                setUserCosmetics(cosmeticsData);
            } else {
                // If fetching user fails, it means token is invalid or expired
                // No need to call logout, as the middleware will handle redirection
            }
        } catch (e) {
            console.error("Failed to fetch user:", e);
        } finally {
            setIsLoadingUser(false);
        }
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async (showToast = true) => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (showToast) {
        toast({ title: 'Déconnexion réussie' });
      }
      setUser(null); // Clear user state
      router.push('/');
      router.refresh();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de déconnexion', description: 'Impossible de se déconnecter, veuillez réessayer.' });
    }
  };

  const isProfessorOrAdmin = user?.role === 'admin' || user?.role === 'professor';
  const currentMenuItems = isProfessorOrAdmin ? adminMenuItems : studentMenuItems;
  const homeLink = isProfessorOrAdmin ? '/admin/users' : '/dashboard';

  const getUserRoleDisplay = () => {
      if (!user) return '';
      if (user.role === 'admin') return 'Administrateur';
      if (user.role === 'professor') return 'Professeur';
      return `Niveau ${user.level || 1}`;
  }

  const equippedTitleStyle = userCosmetics.find(uc => uc.cosmetic.type === 'title_style' && uc.equipped)?.cosmetic;
  const titleColors = equippedTitleStyle ? (equippedTitleStyle.data as any).colors : undefined;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href={homeLink} className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl group-data-[collapsible=icon]:hidden">
                Betty
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {currentMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={
                        pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href))
                      }
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
               <SidebarMenuItem>
                  <Link href="/profile">
                      <SidebarMenuButton
                      isActive={pathname.startsWith('/profile')}
                      tooltip={{ children: "Profil" }}
                      >
                      <User />
                      <span>Profil</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {isLoadingUser ? (
              <div className='flex items-center gap-2 p-2'>
                <Skeleton className='h-8 w-8 rounded-full' />
                <div className='flex flex-col gap-1 w-full group-data-[collapsible=icon]:hidden'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                </div>
              </div>
            ) : user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`}
                        alt={user.name || 'User Avatar'}
                        data-ai-hint="user avatar"
                      />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <span className="font-semibold">{user.name}</span>
                       {titleColors ? (
                         <GradientText colors={titleColors} className="text-xs">{user.title}</GradientText>
                       ) : (
                        <span className="text-xs text-muted-foreground">{user.title}</span>
                       )}
                    </div>
                    <MoreVertical className="ml-auto group-data-[collapsible=icon]:hidden" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2" align="end">
                  <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                   </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleLogout()}
                    className="text-red-500 focus:bg-red-500/10 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:justify-end">
            <SidebarTrigger className="md:hidden" />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
          {user?.role === 'student' && <CodexWidget />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
