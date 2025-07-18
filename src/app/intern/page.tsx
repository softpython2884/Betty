import { AppShell } from "@/components/layout/AppShell"

export default function InternPage() {
  return (
    <AppShell>
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Intern Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your internship! Here are your assigned quests.</p>
      </div>
    </AppShell>
  )
}
