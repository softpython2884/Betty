import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, CheckCircle, BarChart, FilePenLine } from "lucide-react"
import Link from "next/link"

const stats = [
  { title: "Total Students", value: "128", icon: Users, change: "+5 this week" },
  { title: "Published Quests", value: "42", icon: BookOpen },
  { title: "Pending Submissions", value: "8", icon: FilePenLine, urgent: true },
  { title: "Average Score", value: "88%", icon: BarChart, change: "-2% vs last month" },
]

const submissions = [
  { name: "Alice", quest: "The Forest of Functions", time: "2 hours ago", status: "Pending" },
  { name: "Bob", quest: "The CSS Caverns", time: "5 hours ago", status: "Pending" },
  { name: "Charlie", quest: "The Array Archipelago", time: "1 day ago", status: "Pending" },
  { name: "Diana", quest: "The Object-Oriented Oracle", time: "2 days ago", status: "Pending" },
]

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Professor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Oversee your academy and guide your students to victory.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.urgent ? "text-primary" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Grading Queue</CardTitle>
            <CardDescription>Review the latest quest submissions from your students.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Quest</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.quest}</TableCell>
                    <TableCell className="text-muted-foreground">{sub.time}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Grade</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
