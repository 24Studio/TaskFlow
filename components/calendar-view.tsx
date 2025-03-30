"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { CalendarIcon, Clock, ChevronLeft, ChevronRight, ListTodo } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, addDays, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  startTime?: string
  endTime?: string
  isAllDay?: boolean
  color?: string
  reminder?: boolean
  reminderTime?: number // minutes before
  isTask?: boolean
}

interface Todo {
  id: string
  title: string
  completed: boolean
  tags: string[]
  dueTime?: string
  isPriority?: boolean
  dueDate?: Date
  startTime?: string
  endTime?: string
  isAllDay?: boolean
  createdAt: Date
  space?: string
  reminder?: boolean
  reminderTime?: number
}

interface CalendarViewProps {
  onTodayClick?: () => void
}

export default function CalendarView({ onTodayClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [viewMode, setViewMode] = useState<"month" | "day">("month")
  const timeSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`), [])

  // Załaduj zadania i przekształć je na wydarzenia, jeśli mają terminy
  useEffect(() => {
    // Funkcja do ładowania zadań
    const loadTodos = () => {
      const savedTodos = localStorage.getItem("todos")
      if (!savedTodos) return

      try {
        const parsed = JSON.parse(savedTodos)
        // Przekształć stringi dat z powrotem na obiekty Date
        const parsedTodos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }))
        setTodos(parsedTodos)

        // Przekształć zadania z terminami na wydarzenia kalendarza
        const todoEvents = parsedTodos
          .filter((todo: Todo) => todo.dueDate && !todo.completed)
          .map((todo: Todo) => ({
            id: `todo-${todo.id}`,
            title: todo.title,
            date: todo.dueDate as Date,
            startTime: todo.startTime,
            endTime: todo.endTime,
            isAllDay: todo.isAllDay,
            color: todo.isPriority ? "bg-red-500" : "bg-blue-500",
            reminder: todo.reminder,
            reminderTime: todo.reminderTime,
            isTask: true,
          }))

        setEvents(todoEvents)
      } catch (e) {
        console.error("Error parsing todos:", e)
      }
    }

    loadTodos()

    // Nasłuchuj aktualizacji zadań
    window.addEventListener("todosUpdated", loadTodos)
    return () => window.removeEventListener("todosUpdated", loadTodos)
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }, [currentMonth])

  const nextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }, [currentMonth])

  const prevDay = useCallback(() => {
    setSelectedDate(addDays(selectedDate, -1))
  }, [selectedDate])

  const nextDay = useCallback(() => {
    setSelectedDate(addDays(selectedDate, 1))
  }, [selectedDate])

  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
    if (onTodayClick) onTodayClick()
  }, [onTodayClick])

  // Pobierz wydarzenia dla wybranej daty
  const selectedDateEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.date) return false
      return isSameDay(event.date, selectedDate)
    })
  }, [events, selectedDate])

  // Posortuj wydarzenia według czasu
  const sortedEvents = useMemo(() => {
    return [...selectedDateEvents].sort((a, b) => {
      // Wydarzenia całodniowe najpierw
      if (a.isAllDay && !b.isAllDay) return -1
      if (!a.isAllDay && b.isAllDay) return 1

      // Następnie sortuj według czasu rozpoczęcia
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime)
      }

      return 0
    })
  }, [selectedDateEvents])

  // Pogrupuj wydarzenia według przedziału czasowego dla widoku dnia
  const getEventsForTimeSlot = useCallback(
    (timeSlot: string) => {
      return sortedEvents.filter((event) => {
        if (event.isAllDay) return false

        if (event.startTime) {
          const [eventHour] = event.startTime.split(":")
          const [slotHour] = timeSlot.split(":")
          return eventHour === slotHour
        }

        return false
      })
    },
    [sortedEvents],
  )

  // Pobierz wydarzenia całodniowe
  const allDayEvents = useMemo(() => {
    return sortedEvents.filter((event) => event.isAllDay)
  }, [sortedEvents])

  // Przygotuj dane dla kalendarza
  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    // Przygotuj mapę wydarzeń według dni
    const eventsByDay = new Map<string, CalendarEvent[]>()

    events.forEach((event) => {
      if (!event.date) return

      const dateKey = format(event.date, "yyyy-MM-dd")
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, [])
      }
      eventsByDay.get(dateKey)?.push(event)
    })

    return { days, eventsByDay }
  }, [currentMonth, events])

  // Niestandardowy renderer dnia dla kalendarza
  const renderDay = useCallback(
    (day: Date) => {
      // Znajdź wydarzenia dla tego dnia
      const dateKey = format(day, "yyyy-MM-dd")
      const dayEvents = calendarData.eventsByDay.get(dateKey) || []

      // Zwróć dzień ze wskaźnikami wydarzeń
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <span className={cn("text-center", isToday(day) && "font-bold text-primary")}>{day.getDate()}</span>
          {dayEvents.length > 0 && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
              {dayEvents.length <= 3 ? (
                dayEvents.map((event, i) => (
                  <div key={i} className={cn("h-1.5 w-1.5 rounded-full", event.color || "bg-primary")} />
                ))
              ) : (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[0.6rem] text-muted-foreground">+{dayEvents.length - 3}</span>
                </>
              )}
            </div>
          )}
        </div>
      )
    },
    [calendarData],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-xl font-bold">Task Calendar</h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "month" | "day")}>
            <TabsList className="glass">
              <TabsTrigger value="month" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
              <TabsTrigger value="day" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Day</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" className="glass" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      {viewMode === "month" && (
        <Card className="glass-card vision-card optimized-calendar">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
                components={{
                  Day: ({ date, ...props }) => <button {...props}>{renderDay(date)}</button>,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "day" && (
        <Card className="glass-card vision-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={prevDay} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextDay} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Sekcja wydarzeń całodniowych */}
            {allDayEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">All Day</h3>
                <div className="space-y-2">
                  {allDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "p-2 rounded-md flex items-center justify-between",
                        event.isTask ? "bg-primary/10 border border-primary/30" : "glass",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-full", event.color)} />
                        <span className="font-medium">{event.title}</span>
                        {event.isTask && (
                          <Badge variant="outline" className="text-xs">
                            Task
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wydarzenia oparte na czasie */}
            <div className="space-y-1">
              {timeSlots.map((timeSlot) => {
                const eventsInSlot = getEventsForTimeSlot(timeSlot)
                if (eventsInSlot.length === 0) return null

                return (
                  <div key={timeSlot} className="mb-4">
                    <h3 className="text-sm font-medium mb-2">{timeSlot}</h3>
                    <div className="space-y-2">
                      {eventsInSlot.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "p-2 rounded-md flex items-center justify-between",
                            event.isTask ? "bg-primary/10 border border-primary/30" : "glass",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn("h-3 w-3 rounded-full", event.color)} />
                            <span className="font-medium">{event.title}</span>
                            {event.isTask && (
                              <Badge variant="outline" className="text-xs">
                                Task
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.startTime} {event.endTime && `- ${event.endTime}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Jeśli brak wydarzeń opartych na czasie */}
              {timeSlots.every((slot) => getEventsForTimeSlot(slot).length === 0) && allDayEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ListTodo className="h-12 w-12 mb-2 opacity-20" />
                  <p>No tasks scheduled for this day</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => {
                      // Przejdź do listy zadań
                      const todoTab = document.querySelector('[data-value="tasks"]') as HTMLElement
                      if (todoTab) todoTab.click()
                    }}
                  >
                    Add a task
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

