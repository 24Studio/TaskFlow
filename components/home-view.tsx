"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, CalendarIcon, TrendingUp, Star, AlertCircle } from "lucide-react"
import { isToday, isThisWeek, addDays } from "date-fns"

interface HomeViewProps {
  username: string
}

interface Todo {
  id: string
  title: string
  completed: boolean
  tags: string[]
  dueTime?: string
  isPriority?: boolean
  dueDate?: Date
  createdAt: Date
  space?: string
  reminder?: boolean
  reminderTime?: number
}

interface CalendarEvent {
  id: string
  title: string
  date: Date
  color?: string
  reminder?: boolean
  reminderTime?: number
}

export default function HomeView({ username }: HomeViewProps) {
  const [progress, setProgress] = useState(0)
  const [todos, setTodos] = useState<Todo[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [completedTasks, setCompletedTasks] = useState<number>(0)
  const [pendingTasks, setPendingTasks] = useState<number>(0)
  const [dueTodayTasks, setDueTodayTasks] = useState<number>(0)
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0)
  const [upcomingEventsToday, setUpcomingEventsToday] = useState<number>(0)
  const [dailyProgress, setDailyProgress] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  // Load data from localStorage
  useEffect(() => {
    // Load todos
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos)
        // Convert string dates back to Date objects
        const parsedTodos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }))
        setTodos(parsedTodos)
      } catch (e) {
        console.error("Error parsing todos:", e)
      }
    }

    // Load calendar events
    const savedEvents = localStorage.getItem("calendarEvents")
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents)
        // Convert string dates back to Date objects
        const parsedEvents = parsed.map((event: any) => ({
          ...event,
          date: new Date(event.date),
        }))
        setEvents(parsedEvents)
      } catch (e) {
        console.error("Error parsing events:", e)
      }
    }
  }, [])

  // Calculate statistics
  useEffect(() => {
    if (todos.length > 0) {
      // Count completed tasks in the last 7 days
      const lastWeekCompleted = todos.filter((todo) => todo.completed && isThisWeek(new Date(todo.createdAt))).length

      setCompletedTasks(lastWeekCompleted)

      // Count pending tasks
      const pending = todos.filter((todo) => !todo.completed).length
      setPendingTasks(pending)

      // Count tasks due today
      const dueToday = todos.filter((todo) => !todo.completed && todo.dueDate && isToday(new Date(todo.dueDate))).length
      setDueTodayTasks(dueToday)

      // Calculate progress
      const total = todos.length
      const completed = todos.filter((todo) => todo.completed).length
      const calculatedProgress = total > 0 ? Math.round((completed / total) * 100) : 0
      setProgress(calculatedProgress)

      // Calculate daily progress based on actual completed tasks
      const days = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
        const date = new Date()
        date.setDate(date.getDate() - dayOffset)
        date.setHours(0, 0, 0, 0)

        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayTodos = todos.filter((todo) => {
          const completedDate = todo.completed
            ? todo.completedAt
              ? new Date(todo.completedAt)
              : new Date(todo.createdAt)
            : null

          return completedDate && completedDate >= date && completedDate < nextDay
        })

        const dayTotal = dayTodos.length
        return dayTotal > 0 ? Math.min(100, dayTotal * 20) : 0 // Scale for visualization
      })

      setDailyProgress(days.reverse()) // Reverse to show oldest to newest
    } else {
      // If no todos, set all stats to 0
      setCompletedTasks(0)
      setPendingTasks(0)
      setDueTodayTasks(0)
      setProgress(0)
      setDailyProgress([0, 0, 0, 0, 0, 0, 0])
    }

    // Calculate upcoming events based on todos with due dates
    const nextWeek = addDays(new Date(), 7)
    const upcoming = todos.filter(
      (todo) => todo.dueDate && todo.dueDate >= new Date() && todo.dueDate <= nextWeek && !todo.completed,
    ).length
    setUpcomingEvents(upcoming)

    const today = todos.filter((todo) => todo.dueDate && isToday(todo.dueDate) && !todo.completed).length
    setUpcomingEventsToday(today)
  }, [todos, events])

  // Get priority tasks
  const priorityTasks = todos
    .filter((todo) => todo.isPriority && !todo.completed)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      return 0
    })
    .slice(0, 3)

  // Get upcoming tasks
  const upcomingTasks = todos
    .filter((todo) => !todo.completed && todo.dueDate && todo.dueDate > new Date())
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      return 0
    })
    .slice(0, 3)

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {username}!</h1>
        <p className="text-muted-foreground">Here's an overview of your tasks and productivity.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Completed Tasks
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedTasks}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {completedTasks > 0
                  ? `${Math.round((completedTasks / 7) * 100) / 100} tasks per day`
                  : "No tasks completed yet"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Tasks to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTasks}</div>
              <div className="text-sm text-muted-foreground mt-1">{dueTodayTasks} due today</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingEvents}</div>
              <div className="text-sm text-muted-foreground mt-1">{upcomingEventsToday} today</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
            <CardDescription>Your task completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{progress}%</div>
                  <div className="text-sm text-muted-foreground">Task completion</div>
                </div>
                <Button variant="outline" className="glass">
                  View Details
                </Button>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="grid grid-cols-7 gap-1 pt-2">
                {dailyProgress.map((dayProgress, i) => {
                  const dayOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1">{["M", "T", "W", "T", "F", "S", "S"][i]}</div>
                      <div
                        className={`w-full h-16 rounded-md ${
                          dayProgress > 80
                            ? "bg-green-500/20"
                            : dayProgress > 50
                              ? "bg-blue-500/20"
                              : "bg-orange-500/20"
                        } relative`}
                      >
                        <div
                          className={`absolute bottom-0 left-0 right-0 rounded-md ${
                            dayProgress > 80 ? "bg-green-500" : dayProgress > 50 ? "bg-blue-500" : "bg-orange-500"
                          }`}
                          style={{ height: `${dayProgress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="glass mb-4">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="space-y-2">
                  {priorityTasks.filter((task) => task.dueDate && isToday(task.dueDate)).length > 0 ? (
                    priorityTasks
                      .filter((task) => task.dueDate && isToday(task.dueDate))
                      .map((task, i) => (
                        <div key={i} className="p-3 glass rounded-md flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full border-2 border-primary" />
                          <span className="text-sm">{task.title}</span>
                        </div>
                      ))
                  ) : (
                    <div className="p-3 glass rounded-md text-center text-muted-foreground">
                      No priority tasks for today
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="upcoming" className="space-y-2">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task, i) => (
                      <div key={i} className="p-3 glass rounded-md flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full border-2 border-primary" />
                        <span className="text-sm">{task.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 glass rounded-md text-center text-muted-foreground">No upcoming tasks</div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-500" />
                Task Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todos.length > 0 ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Most productive day</span>:{" "}
                        <span>
                          {
                            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][
                              dailyProgress.indexOf(Math.max(...dailyProgress))
                            ]
                          }
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">Based on your completion history</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Overdue tasks</span>:{" "}
                        <span>{todos.filter((t) => !t.completed && t.dueDate && t.dueDate < new Date()).length}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Tasks that need your attention</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Priority ratio</span>:{" "}
                        <span>{Math.round((todos.filter((t) => t.isPriority).length / todos.length) * 100)}%</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Percentage of priority tasks</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Add tasks to see insights</p>
                </div>
              )}

              <Button variant="outline" className="w-full glass">
                View All Insights
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

