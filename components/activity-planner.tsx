"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

export function ActivityPlanner() {
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
  ];

  const activities = [
    {
      time: "08:00",
      title: "Reunião de Equipe (Reunião Interna)",
      date: "19 Abril, 2025",
      duration: "08:30",
      participants: [
        { name: "João", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Sarah", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    {
      time: "10:00",
      title: "Revisão de Estratégia com Cliente",
      date: "19 Abril, 2025",
      duration: "10:30",
      participants: [
        { name: "Miguel", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Lisa", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
  ];

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          Planejador de Atividades Diárias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {timeSlots.map((time) => (
            <div key={time} className="flex-shrink-0 text-center">
              <div className="text-sm text-gray-500 mb-4">{time}</div>
              <div className="w-24 h-2 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-6">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-green-50 rounded-lg p-4 border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">
                    {activity.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{activity.date}</span>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.duration}
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {activity.participants.map((participant, pIndex) => (
                    <Avatar
                      key={pIndex}
                      className="w-8 h-8 border-2 border-white"
                    >
                      <AvatarImage
                        src={participant.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
