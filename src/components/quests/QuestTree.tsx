

"use client"

import React, { useState, useRef, WheelEvent, MouseEvent as ReactMouseEvent, useEffect } from "react"
import { CheckCircle, Lock, Swords, Star, Calendar, DraftingCompass, Link2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Card } from "../ui/card"
import { cn } from "@/lib/utils"
import type { Quest } from "@/lib/db/schema"
import { Button } from "../ui/button"

export type QuestStatus = "completed" | "available" | "locked" | "draft" | "published"

export interface QuestNodeProps {
  id: string
  title: string
  category: string
  xp: number
  status: QuestStatus
  position: { top: string; left: string }
  rawQuest: Quest
}

export interface Connection {
    from: string;
    to: string;
}

interface QuestTreeProps {
    curriculumName: string;
    curriculumSubtitle: string;
    questNodes: QuestNodeProps[];
    connections: Connection[];
    onQuestMove?: (questId: string, position: { top: string; left: string }) => void;
    onNewConnection?: (from: string, to: string) => void;
    onRemoveConnection?: (from: string, to: string) => void;
    onEditQuest?: (questId: string) => void;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-700", borderColor: "border-green-500" },
  available: { icon: Swords, color: "bg-primary", textColor: "text-primary", borderColor: "border-primary" },
  published: { icon: Swords, color: "bg-primary", textColor: "text-primary", borderColor: "border-primary" },
  locked: { icon: Lock, color: "bg-muted", textColor: "text-muted-foreground", borderColor: "border-border" },
  draft: { icon: DraftingCompass, color: "bg-yellow-500", textColor: "text-yellow-700", borderColor: "border-yellow-500" },
}

export function QuestTree({ 
    curriculumName, 
    curriculumSubtitle, 
    questNodes: initialQuestNodes, 
    connections,
    onQuestMove,
    onNewConnection,
    onRemoveConnection,
    onEditQuest
}: QuestTreeProps) {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [questNodes, setQuestNodes] = useState(initialQuestNodes);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuestNodes(initialQuestNodes);
  }, [initialQuestNodes]);

  const isAdminView = !!onQuestMove && !!onNewConnection && !!onRemoveConnection && !!onEditQuest;

  const nodePositions: { [key: string]: { top: number; left: number } } = {}
  questNodes.forEach(node => {
    nodePositions[node.id] = {
      top: parseFloat(node.position.top),
      left: parseFloat(node.position.left)
    }
  })

  // Handle Wheel for Zoom
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, transform.scale + scaleAmount), 2);

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = transform.x + (mouseX - transform.x) * (1 - newScale / transform.scale);
    const newY = transform.y + (mouseY - transform.y) * (1 - newScale / transform.scale);

    setTransform({ scale: newScale, x: newX, y: newY });
  };

  // Handle MouseDown for Panning or starting Node Drag
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const questNodeElement = target.closest('[data-quest-node-id]');
    
    if (isAdminView && questNodeElement && !target.closest('[data-button-id]')) {
        const questId = questNodeElement.getAttribute('data-quest-node-id')!;
        const nodeState = questNodes.find(q => q.id === questId);
        if (!nodeState) return;

        setIsDraggingNode(questId);
        
        const containerRect = containerRef.current!.getBoundingClientRect();
        const nodeLeft = (parseFloat(nodeState.position.left) / 100) * (containerRect.width / transform.scale);
        const nodeTop = (parseFloat(nodeState.position.top) / 100) * (containerRect.height / transform.scale);

        const mouseX = (e.clientX - containerRect.left - transform.x) / transform.scale;
        const mouseY = (e.clientY - containerRect.top - transform.y) / transform.scale;
        
        setDragOffset({
            x: mouseX - nodeLeft,
            y: mouseY - nodeTop,
        });

    } else if (!target.closest('[data-connector]')) {
        setIsPanning(true);
        setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle MouseMove for Panning or Dragging Node
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const containerRect = containerRef.current!.getBoundingClientRect();
    const currentMousePos = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
    };
    setMousePosition(currentMousePos);

    if (isDraggingNode) {
      const newLeft = (currentMousePos.x - transform.x) / transform.scale - dragOffset.x;
      const newTop = (currentMousePos.y - transform.y) / transform.scale - dragOffset.y;
      
      const newLeftPercent = (newLeft / (containerRect.width / transform.scale)) * 100;
      const newTopPercent = (newTop / (containerRect.height / transform.scale)) * 100;

      const finalPosition = {
          top: `${Math.max(0, Math.min(100, newTopPercent))}%`,
          left: `${Math.max(0, Math.min(100, newLeftPercent))}%`,
      };

      setQuestNodes(prev => prev.map(q => q.id === isDraggingNode ? { ...q, position: finalPosition } : q));

    } else if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      }));
    }
  };
  
  // Handle MouseUp to end Panning or Node Drag
  const handleMouseUp = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const questNodeElement = target.closest('[data-quest-node-id]');
    
    if (isConnecting && questNodeElement && onNewConnection) {
        const toId = questNodeElement.getAttribute('data-quest-node-id')!;
        if (isConnecting !== toId) {
            onNewConnection(isConnecting, toId);
        }
    } else if (isDraggingNode && onQuestMove) {
        const finalNodeState = questNodes.find(q => q.id === isDraggingNode);
        if (finalNodeState) {
            onQuestMove(isDraggingNode, finalNodeState.position);
        }
    }
    
    setIsPanning(false);
    setIsDraggingNode(null);
    setIsConnecting(null);
  };
  
  const handleConnectorClick = (e: React.MouseEvent, questId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAdminView) return;
    if(isConnecting === questId) {
        setIsConnecting(null);
    } else {
        setIsConnecting(questId);
    }
  }
  
  const handleLineClick = (e: React.MouseEvent, from: string, to: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAdminView && onRemoveConnection && window.confirm("Voulez-vous supprimer cette dépendance ?")) {
        onRemoveConnection(from, to);
    }
  }


  return (
    <Card className="shadow-md w-full">
      <div 
        ref={containerRef}
        className={cn(
          "relative h-[800px] w-full rounded-lg border bg-card-foreground/[0.02] overflow-hidden touch-none",
          isPanning ? "cursor-grabbing" : "cursor-grab",
          isConnecting && "cursor-crosshair",
          !isAdminView && "cursor-default"
          )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <h2 className="text-xl font-bold font-headline text-foreground">Parcours {curriculumName}</h2>
              <p className="text-sm text-muted-foreground">{curriculumSubtitle}</p>
          </div>
            <div className="absolute top-4 left-[15%] -translate-x-1/2 text-center pointer-events-none">
              <h2 className="text-lg font-bold font-headline text-foreground/80 flex items-center gap-2"><Star className="h-5 w-5 text-accent"/> Quêtes Optionnelles</h2>
          </div>
            <div className="absolute top-4 left-[85%] -translate-x-1/2 text-center pointer-events-none">
              <h2 className="text-lg font-bold font-headline text-foreground/80 flex items-center gap-2"><Calendar className="h-5 w-5 text-accent"/> Quêtes Hebdomadaires</h2>
          </div>


          <svg className="absolute top-0 left-0 h-full w-full" style={{ pointerEvents: 'none' }}>
              {isConnecting && nodePositions[isConnecting] && (
                 <line
                    x1={`${nodePositions[isConnecting].left}%`}
                    y1={`${nodePositions[isConnecting].top}%`}
                    x2={(mousePosition.x - transform.x) / transform.scale}
                    y2={(mousePosition.y - transform.y) / transform.scale}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2 / transform.scale}
                    strokeDasharray="4 4"
                    />
              )}
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
                  strokeWidth={4 / transform.scale}
                  className={cn("hover:stroke-destructive", isAdminView && "cursor-pointer")}
                  style={{ pointerEvents: 'stroke' }}
                  onClick={(e) => handleLineClick(e, conn.from, conn.to)}
                  />
              )
              })}
          </svg>

          {questNodes.map((node) => {
              const config = statusConfig[node.status] || statusConfig.locked;
              const isClickable = !isAdminView && (node.status !== "locked" && node.status !== "draft");
              const Wrapper = isClickable && !isDraggingNode ? Link : 'div';
              const isLockedForStudent = !isAdminView && (node.status === 'locked' || node.status === 'draft');
              
              return (
                  <div
                      key={node.id} 
                      data-quest-node-id={node.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                          top: node.position.top, 
                          left: node.position.left,
                          cursor: isDraggingNode ? 'grabbing' : (isAdminView ? 'grab' : (isClickable ? 'pointer' : 'not-allowed'))
                      }}
                  >
                    <Wrapper 
                      href={isClickable ? `/quests/${node.id}`: '#'}
                      >
                      <div className={`group relative w-48 rounded-lg border-2 bg-card p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105 ${config.borderColor} ${!isClickable ? 'cursor-not-allowed' : ''}`}>
                          <div className={`absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full ${config.color}`}>
                              <config.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="space-y-1">
                            <p className={`font-semibold text-lg leading-tight ${config.textColor}`}>{node.title}</p>
                            <p className="text-sm text-muted-foreground">{node.category}</p>
                          </div>
                          <Badge variant="secondary" className="mt-2">{node.xp} XP</Badge>
                          
                          {/* Connectors for Admin */}
                          {isAdminView && (
                            <>
                                <Button 
                                    data-button-id="edit-button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute -left-3 top-1/2 -translate-y-1/2 h-7 w-7 transition-opacity"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditQuest && onEditQuest(node.id); }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <div 
                                    data-connector="true"
                                    onClick={(e) => handleConnectorClick(e, node.id)}
                                    className={cn(
                                        "absolute -right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-card border-2 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-primary-foreground",
                                        isConnecting === node.id ? "bg-primary text-primary-foreground" : ""
                                    )}>
                                    <Link2 className="h-3 w-3" />
                                </div>
                            </>
                          )}

                          {isLockedForStudent && <div className="absolute inset-0 bg-card/70 backdrop-blur-sm rounded-md" />}
                      </div>
                  </Wrapper>
                  </div>
              )
          })}
        </div>
      </div>
    </Card>
  )
}
