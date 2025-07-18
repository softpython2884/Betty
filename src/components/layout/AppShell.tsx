'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Link as LinkIcon,
  Sparkles,
  UserCheck,
  ClipboardList,
  Bot,
  X,
  Send,
  Loader2,
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

// Student-centric menu
const menuItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/quests', label: 'Quêtes', icon: Swords },
  { href: '/projects', label: 'Projets', icon: FolderKanban },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/codex', label: 'Codex', icon: Sparkles },
  { href: '/ai-studio', label: 'AI Studio', icon: Sparkles },
  { href: '/profile', label: 'Profil', icon: User },
];

// Determine if we are in an admin route
const isAdminRoute = (pathname: string) => pathname.startsWith('/admin');

// Admin-centric menu
const adminMenuItems = [
  { href: '/admin/users', label: 'User Management', icon: UserCheck },
  { href: '/admin/quests', label: 'Quest Editor', icon: Swords },
  { href: '/admin/quests/quiz-builder', label: 'Quiz Builder', icon: ClipboardList },
  { href: '/admin/grading', label: 'Grading Queue', icon: GraduationCap },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentMenuItems = isAdminRoute(pathname) ? adminMenuItems : menuItems;
  const homeLink = isAdminRoute(pathname) ? '/admin/users' : '/dashboard';

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
                        (item.href !== '/dashboard' && item.href !== '/admin/users' &&
                          pathname.startsWith(item.href))
                      }
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
                    <AvatarImage
                      src="https://placehold.co/40x40"
                      alt="User Avatar"
                      data-ai-hint="user avatar"
                    />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">Alex</span>
                    <span className="text-xs text-muted-foreground">
                      {isAdminRoute(pathname) ? 'Professor' : 'Niveau 5'}
                    </span>
                  </div>
                  <MoreVertical className="ml-auto group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  <a
                    href="https://flowup.app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ouvrir FlowUp
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="text-red-500 focus:bg-red-500/10 focus:text-red-600"
                >
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
          {!isAdminRoute(pathname) && <CodexWidget />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
