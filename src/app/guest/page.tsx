import { AppShell } from "@/components/layout/AppShell"

export default function GuestPage() {
  return (
    <AppShell>
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Guest Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome! As a guest, you have limited access.</p>
      </div>
    </AppShell>
  )
}
