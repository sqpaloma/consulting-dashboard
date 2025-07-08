"use client";

import { Clock, MapPin, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CalendarEventProps {
  event: {
    _id: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    duration: string;
    location: string;
    participants: string[];
    color: string;
  };
  onDelete?: (eventId: string) => void;
  compact?: boolean;
}

export function CalendarEvent({
  event,
  onDelete,
  compact = false,
}: CalendarEventProps) {
  if (compact) {
    return (
      <div className={`text-xs p-1 rounded text-white truncate ${event.color}`}>
        {event.time} {event.title}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
            )}
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2" />
                {event.time} ({event.duration})
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-2" />
                  {event.location}
                </div>
              )}
              {event.participants.length > 0 && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-2" />
                  {event.participants.join(", ")}
                </div>
              )}
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event._id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
