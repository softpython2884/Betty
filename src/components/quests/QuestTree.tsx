"use client"

import { CheckCircle, Lock, Swords } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

type QuestStatus = "completed" | "available" | "locked"

interface QuestNodeProps {
  id: string
  title: string
  category: string
  xp: number
  status: QuestStatus
  position: { top: string; left: string }
}

const questNodes: QuestNodeProps[] = [
  { id: "1", title: "HTML Basics", category: "Frontend", xp: 100, status: "completed", position: { top: "10%", left: "10%" } },
  { id: "2", title: "CSS Fundamentals", category: "Frontend", xp: 150, status: "completed", position: { top: "10%", left: "50%" } },
  { id: "3", title: "JavaScript Intro", category: "Core", xp: 200, status: "available", position: { top: "40%", left: "30%" } },
  { id: "4", title: "DOM Manipulation", category: "Frontend", xp: 250, status: "locked", position: { top: "70%", left: "10%" } },
  { id: "5", title: "Async/Await", category: "Core", xp: 300, status: "locked", position: { top: "70%", left: "50%" } },
  { id: "6", title: "Intro to React", category: "Library", xp: 500, status: "locked", position: { top: "90%", left: "30%" } },
]

const connections = [
  { from: "1", to: "3" },
  { from: "2", to: "3" },
  { from: "3", to: "4" },
  { from: "3", to: "5" },
  { from: "4", to: "6" },
  { from: "5", to: "6" },
]

const statusConfig = {
  completed: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-700", borderColor: "border-green-500" },
  available: { icon: Swords, color: "bg-primary", textColor: "text-primary", borderColor: "border-primary" },
  locked: { icon: Lock, color: "bg-muted", textColor: "text-muted-foreground", borderColor: "border-border" },
}

export function QuestTree() {
  const nodePositions: { [key: string]: { top: number; left: number } } = {}
  questNodes.forEach(node => {
    nodePositions[node.id] = {
      top: parseFloat(node.position.top),
      left: parseFloat(node.position.left)
    }
  })

  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Curriculum Path</CardTitle>
        <CardDescription>Your journey through the world of code. Click an available quest to begin.</CardDescription>
      </CardHeader>
      <div className="p-4">
        <div className="relative h-[600px] w-full rounded-lg border bg-card-foreground/[0.02] overflow-hidden">
           {/* Grid background */}
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0">
            <defs>
              <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
              </pattern>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="url(#smallGrid)"/>
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          <svg className="absolute top-0 left-0 h-full w-full" style={{ pointerEvents: 'none' }}>
            {connections.map((conn, index) => {
              const fromNode = nodePositions[conn.from]
              const toNode = nodePositions[conn.to]
              if (!fromNode || !toNode) return null

              return (
                <line
                  key={index}
                  x1={`${fromNode.left}%`}
                  y1={`${fromNode.top}%`}
                  x2={`${toNode.left}%`}
                  y2={`${toNode.top}%`}
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray={questNodes.find(n => n.id === conn.to)?.status === 'locked' ? "4 4" : "none"}
                />
              )
            })}
          </svg>

          {questNodes.map((node) => {
            const config = statusConfig[node.status]
            const isClickable = node.status !== "locked"
            const Wrapper = isClickable ? Link : 'div'
            
            return (
                <Wrapper 
                    href={isClickable ? `/quests/${node.id}`: ''}
                    key={node.id} 
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: node.position.top, left: node.position.left }}
                    >
                    <div className={`relative w-48 rounded-lg border-2 bg-card p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105 ${config.borderColor} ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                        <div className={`absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full ${config.color}`}>
                            <config.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className={`font-semibold text-lg ${config.textColor}`}>{node.title}</p>
                        <p className="text-sm text-muted-foreground">{node.category}</p>
                        <Badge variant="secondary" className="mt-2">{node.xp} XP</Badge>
                         {node.status === 'locked' && <div className="absolute inset-0 bg-card/70 backdrop-blur-sm rounded-md" />}
                    </div>
                </Wrapper>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
