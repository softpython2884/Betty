"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { AiMentor } from "@/components/quests/AiMentor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FolderKanban, Play } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Dummy data for a quest
const questData = {
  id: "3",
  title: "JavaScript Intro: The Forest of Functions",
  description: "Venture into the Forest of Functions, where you'll learn the ancient art of writing and calling your own JavaScript functions. Your task is to create a function that greets a fellow adventurer.",
  task: "Write a JavaScript function called `greet` that takes one argument, `name`, and returns the string 'Hello, ' followed by the name.",
  initialCode: `// Your code here\n\nfunction greet(name) {\n  \n}\n`,
};

export default function QuestCodeSpacePage({ params }: { params: { questId: string } }) {
  const [code, setCode] = useState(questData.initialCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  return (
    <AppShell>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">{questData.title}</CardTitle>
              <CardDescription>{questData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Your Task</h3>
              <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border">{questData.task}</p>
            </CardContent>
          </Card>
          <AiMentor code={code} error={error} task={questData.task} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Project Workspace</CardTitle>
              <CardDescription>All work for this quest is done within its dedicated project.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64">
                <FolderKanban className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Projet: {questData.title}</h3>
                <p className="text-muted-foreground mb-6">Your central hub for this quest.</p>
                <Button size="lg">
                    <Play className="mr-2" />
                    Open Quest Project
                </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
              <Button variant="outline">Request Peer Review</Button>
              <Button>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Quest for Evaluation
              </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
