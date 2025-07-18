"use client"

import { useState, useRef, WheelEvent, MouseEvent } from "react"
import { CheckCircle, Lock, Swords, Star, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { cn } from "@/lib/utils"

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
  // Main Curriculum
  { id: "1", title: "HTML Basics", category: "Frontend", xp: 100, status: "completed", position: { top: "15%", left: "50%" } },
  { id: "2", title: "CSS Fundamentals", category: "Frontend", xp: 150, status: "completed", position: { top: "30%", left: "50%" } },
  { id: "3", title: "JavaScript Intro", category: "Core", xp: 200, status: "available", position: { top: "45%", left: "50%" } },
  { id: "4", title: "DOM Manipulation", category: "Frontend", xp: 250, status: "locked", position: { top: "60%", left: "35%" } },
  { id: "5", title: "Async/Await", category: "Core", xp: 300, status: "locked", position: { top: "60%", left: "65%" } },
  { id: "6", title: "Intro to React", category: "Library", xp: 500, status: "locked", position: { top: "85%", left: "50%" } },

  // Optional Quests
  { id: "opt-1", title: "Advanced Git", category: "Tools", xp: 150, status: "available", position: { top: "20%", left: "15%" } },
  { id: "opt-2", title: "CSS Animations", category: "Frontend", xp: 200, status: "locked", position: { top: "40%", left: "15%" } },

  // Weekly Quests
  { id: "week-1", title: "Flexbox Challenge", category: "Weekly", xp: 50, status: "available", position: { top: "20%", left: "85%" } },
];

const connections = [
  // Main
  { from: "1", to: "2" },
  { from: "2", to: "3" },
  { from: "3", to: "4" },
  { from: "3", to: "5" },
  { from: "4", to: "6" },
  { from: "5", to: "6" },
  
  // Optional
  { from: "1", to: "opt-1" },
  { from: "2", to: "opt-2" },
]

const statusConfig = {
  completed: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-700", borderColor: "border-green-500" },
  available: { icon: Swords, color: "bg-primary", textColor: "text-primary", borderColor: "border-primary" },
  locked: { icon: Lock, color: "bg-muted", textColor: "text-muted-foreground", borderColor: "border-border" },
}

export function QuestTree() {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const nodePositions: { [key: string]: { top: number; left: number } } = {}
  questNodes.forEach(node => {
    nodePositions[node.id] = {
      top: parseFloat(node.position.top),
      left: parseFloat(node.position.left)
    }
  })

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, transform.scale + scaleAmount), 2);

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = transform.x + (mouseX - transform.x) * (1 - newScale / transform.scale);
    const newY = transform.y + (mouseY - transform.y) * (1 - newScale / transform.scale);

    setTransform({ scale: newScale, x: newX, y: newY });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-quest-node]')) {
      return;
    }
    e.preventDefault();
    setIsPanning(true);
    setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    setTransform(prev => ({
      ...prev,
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    }));
  };
  
  const handleMouseUpOrLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
        e.preventDefault();
        setIsPanning(false);
    }
  };


  return (
    <Card className="shadow-md w-full">
      <div 
        ref={containerRef}
        className={cn(
          "relative h-[600px] w-full rounded-lg border bg-card-foreground/[0.02] overflow-hidden",
          isPanning ? "cursor-grabbing" : "cursor-grab"
          )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
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
        
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{ 
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0'
          }}
        >
          {/* Section Titles */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <h2 className="text-xl font-bold font-headline text-foreground">Main Curriculum Path</h2>
              <p className="text-sm text-muted-foreground">Level 1 - The Basics</p>
          </div>
            <div className="absolute top-4 left-[15%] -translate-x-1/2 text-center">
              <h2 className="text-lg font-bold font-headline text-foreground/80 flex items-center gap-2"><Star className="h-5 w-5 text-accent"/> Optional Quests</h2>
          </div>
            <div className="absolute top-4 left-[85%] -translate-x-1/2 text-center">
              <h2 className="text-lg font-bold font-headline text-foreground/80 flex items-center gap-2"><Calendar className="h-5 w-5 text-accent"/> Weekly Quests</h2>
          </div>


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
                  y2={`${to_Node.top}%`}
                  stroke="hsl(var(--border))"
                  strokeWidth={2 / transform.scale}
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
                      data-quest-node
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
