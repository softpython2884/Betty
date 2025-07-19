
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Timer, Coffee, Play, Pause, RotateCcw, Settings } from "lucide-react";

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [cycles, setCycles] = useState(0);

  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        notificationSoundRef.current = new Audio('/sounds/notification.mp3');
    }
  }, []);

  const playSound = () => {
    if(notificationSoundRef.current){
        notificationSoundRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }

  const sendNotification = (title: string, body: string) => {
      if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
      }
  }

  const requestNotificationPermission = () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission();
      }
  }

  const toggle = () => {
    setIsActive(!isActive);
    requestNotificationPermission();
  };

  const reset = useCallback(() => {
    setIsActive(false);
    switch (mode) {
      case "work":
        setMinutes(25);
        break;
      case "shortBreak":
        setMinutes(5);
        break;
      case "longBreak":
        setMinutes(15);
        break;
    }
    setSeconds(0);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          // Timer finished
          playSound();
          if (mode === "work") {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles % 4 === 0) {
              setMode("longBreak");
              sendNotification("C'est l'heure de la grande pause !", "Prenez 15 minutes pour vous ressourcer.");
            } else {
              setMode("shortBreak");
               sendNotification("C'est l'heure de la pause !", "Prenez 5 minutes pour vous détendre.");
            }
          } else {
            setMode("work");
            sendNotification("La pause est finie !", "Retour au travail !");
          }
          setIsActive(false);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if(interval) clearInterval(interval);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, mode, cycles]);

  useEffect(() => {
    reset();
  }, [mode, reset]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Timer className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Minuteur Pomodoro</h4>
            <p className="text-sm text-muted-foreground">
              Gérez votre temps de travail et de pause.
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              variant={mode === "work" ? "default" : "outline"}
              onClick={() => setMode("work")}
            >
              Travail
            </Button>
            <Button
              variant={mode === "shortBreak" ? "default" : "outline"}
              onClick={() => setMode("shortBreak")}
            >
              Pause Courte
            </Button>
            <Button
              variant={mode === "longBreak" ? "default" : "outline"}
              onClick={() => setMode("longBreak")}
            >
              Pause Longue
            </Button>
          </div>
          <div className="text-center font-bold text-6xl my-4">
            {minutes < 10 ? `0${minutes}` : minutes}:
            {seconds < 10 ? `0${seconds}` : seconds}
          </div>
          <div className="flex justify-center items-center space-x-4">
            <Button onClick={toggle} size="lg" className="rounded-full w-20 h-20">
              {isActive ? <Pause size={32} /> : <Play size={32} />}
            </Button>
            <Button onClick={reset} variant="outline" size="icon" className="rounded-full">
              <RotateCcw />
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Cycles complétés : {cycles}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    