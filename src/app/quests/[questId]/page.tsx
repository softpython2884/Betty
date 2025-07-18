"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { AiMentor } from "@/components/quests/AiMentor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, Play } from 'lucide-react';
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

  const handleRunCode = () => {
    setError("");
    setOutput("");
    // This is a mock execution environment
    try {
      // A very simple and unsafe way to "run" JS. DO NOT use this in production.
      // We'll try to check if the function exists and call it.
      if (code.includes("function greet(name)")) {
        const testResult = eval(`${code}; greet('Adventurer');`);
        if(testResult === "Hello, Adventurer") {
            setOutput(`Success! Output: "${testResult}"`);
        } else {
            setError(`Incorrect output. Expected "Hello, Adventurer", but got "${testResult}".`);
        }
      } else {
        setError("Function `greet` is not defined correctly.");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

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
              <CardTitle>CodeSpace</CardTitle>
              <CardDescription>Write your solution in the editor below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="font-code bg-muted/50 rounded-md border">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your code here..."
                  className="h-64 w-full rounded-t-md rounded-b-none border-0 font-code"
                />
                <div className="p-2 border-t flex items-center justify-between bg-muted/70 rounded-b-md">
                    <div className="text-sm text-muted-foreground">Console</div>
                    <Button size="sm" onClick={handleRunCode}>
                        <Play className="mr-2 h-4 w-4"/>
                        Run Code
                    </Button>
                </div>
                <div className="h-24 p-2 font-mono text-sm bg-background rounded-b-md border-t">
                  {output && <pre className="text-green-600 whitespace-pre-wrap">{`> ${output}`}</pre>}
                  {error && <pre className="text-red-600 whitespace-pre-wrap">{`> Error: ${error}`}</pre>}
                  {!output && !error && <pre className="text-muted-foreground/50">{`> Output will appear here...`}</pre>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
              <Button variant="outline">Peer Review</Button>
              <Button>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Quest
              </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
