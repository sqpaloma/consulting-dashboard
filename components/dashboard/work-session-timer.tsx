"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export function WorkSessionTimer() {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true); // true = trabalho, false = descanso
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effects
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Sessão terminou
            setIsRunning(false);
            if (isWorkSession) {
              // Terminou trabalho, iniciar descanso
              setIsWorkSession(false);
              setSessions((prev) => prev + 1);
              return 5 * 60; // 5 minutos de descanso
            } else {
              // Terminou descanso, iniciar trabalho
              setIsWorkSession(true);
              return 25 * 60; // 25 minutos de trabalho
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, isWorkSession]);

  // Timer functions
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsWorkSession(true);
    setTimeLeft(25 * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    const totalTime = isWorkSession ? 25 * 60 : 5 * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <Card className="bg-white h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gray-800">
            {isWorkSession ? "Sessão de Trabalho" : "Tempo de Descanso"}
          </CardTitle>
          <div className="text-sm text-gray-500">Sessões: {sessions}</div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-36 h-36">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f3f4f6"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={isWorkSession ? "#22c55e" : "#3b82f6"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40 * (getProgress() / 100)} ${
                  2 * Math.PI * 40
                }`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-800">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 text-center">
                {isWorkSession ? "Foco no trabalho" : "Hora do descanso"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleTimer}
              className={`${
                isWorkSession
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>

            <Button
              onClick={resetTimer}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Próximo:</div>
            <div className="text-sm font-medium text-gray-700">
              {isWorkSession ? "5 min de descanso" : "25 min de trabalho"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
