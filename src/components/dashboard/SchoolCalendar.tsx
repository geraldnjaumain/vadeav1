"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";

export function SchoolCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const events = useQuery(api.calendar.getEvents);

    const getEventsForDay = (day: Date) => {
        if (!events) return [];
        return events.filter(e =>
            day.getTime() >= e.startDate && day.getTime() <= e.endDate ||
            isSameDay(day, new Date(e.startDate))
        );
    };

    const selectedEvents = date ? getEventsForDay(date) : [];

    // modifiers for calendar
    const eventDays = events ? events.map(e => new Date(e.startDate)) : [];

    // Create a map of modifiers based on event type if we want different colors
    // For now, simpler approach: just highlight days with events

    return (
        <div className="grid md:grid-cols-[auto_1fr] gap-4 items-start">
            <Card className="w-fit h-fit">
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        modifiers={{
                            event: eventDays
                        }}
                        modifiersStyles={{
                            event: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                        }}
                    />
                </CardContent>
            </Card>

            <Card className="h-full min-h-[350px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        {date ? format(date, "EEEE, MMMM do") : "Select a date"}
                    </CardTitle>
                    <CardDescription>
                        {selectedEvents.length} events scheduled
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[250px] pr-4">
                        {selectedEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-8">
                                <p>No events for this day.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedEvents.map(event => (
                                    <div key={event._id} className="flex gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                                        <div className={`w-1 self-stretch rounded-full ${event.type === 'holiday' ? 'bg-green-500' :
                                                event.type === 'exam' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-semibold text-zinc-900">{event.title}</h4>
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {event.type}
                                                </Badge>
                                            </div>
                                            {event.description && (
                                                <p className="text-sm text-zinc-600 mt-1">{event.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                                {event.targetAudience && event.targetAudience !== 'all' && (
                                                    <span className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-full">
                                                        <User className="h-3 w-3" />
                                                        For {event.targetAudience}s
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
