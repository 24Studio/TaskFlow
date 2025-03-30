"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Calendar, Clock, Tag, RefreshCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isTomorrow, isBefore } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Todo {
  id: string
  title: string
  completed: boolean
  tags: string[]
  dueTime?: string
  isPriority?: boolean
  dueDate?: Date
  createdAt: Date
  completedAt?: Date
  space?: string
}

export default function TaskHistory() {
  const [completedTasks, setCompletedTasks] = useState<Todo[]>([])
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all")

  // Load completed tasks from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos)
        // Filter completed tasks and convert dates
        const completed = parsed
          .filter((todo: any) => todo.completed)
          .map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            completedAt: todo.completedAt ? new Date(todo.completedAt) : new Date(), // Default to now if not set
          }))
        setCompletedTasks(completed)
      } catch (e) {
        console.error("Error parsing todos:", e)
      }
    }
  }, [])

  // Filter tasks based on time period
  const getFilteredTasks = () => {
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay

    return completedTasks.filter((task) => {
      const taskDate = task.completedAt || task.createdAt
      const timeDiff = now.getTime() - taskDate.getTime()

      if (timeFilter === "all") return true
      if (timeFilter === "today") return timeDiff < oneDay
      if (timeFilter === "week") return timeDiff < oneWeek
      if (timeFilter === "month") return timeDiff < oneMonth
      return true
    })
  }

  // Sort tasks
  const getSortedTasks = () => {
    return getFilteredTasks().sort((a, b) => {
      const dateA = (a.completedAt || a.createdAt).getTime()
      const dateB = (b.completedAt || b.createdAt).getTime()
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })
  }

  const sortedAndFilteredTasks = getSortedTasks()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold flex items-center gap-2"
        >
          <Check className="h-5 w-5 text-green-500" />
          <span>Completed Tasks</span>
          <Badge variant="outline" className="ml-2">
            {sortedAndFilteredTasks.length}
          </Badge>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)}>
            <SelectTrigger className="w-[130px] glass-input">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent className="glass">
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[130px] glass-input">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="glass">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {sortedAndFilteredTasks.length > 0 ? (
            sortedAndFilteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="card-transition"
              >
                <Card className="glass-card opacity-80 hover:opacity-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded-full h-6 w-6 min-w-6 p-0 bg-green-500/20 text-green-500">
                        <Check className="h-3 w-3" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium break-words line-through text-muted-foreground">{task.title}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.tags &&
                            task.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs glass">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}

                          {task.dueDate && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs glass",
                                isToday(task.dueDate)
                                  ? "text-green-500 dark:text-green-300"
                                  : isTomorrow(task.dueDate)
                                    ? "text-blue-500 dark:text-blue-300"
                                    : isBefore(task.dueDate, new Date())
                                      ? "text-red-500 dark:text-red-300"
                                      : "text-blue-500 dark:text-blue-300",
                              )}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(task.dueDate, "MMM dd, yyyy")}
                            </Badge>
                          )}

                          <Badge variant="outline" className="text-xs text-green-500 dark:text-green-300 glass">
                            <Check className="h-3 w-3 mr-1" />
                            Completed {task.completedAt ? format(task.completedAt, "MMM dd, h:mm a") : ""}
                          </Badge>

                          <Badge variant="outline" className="text-xs text-muted-foreground glass">
                            <Clock className="h-3 w-3 mr-1" />
                            Created: {format(task.createdAt, "MMM dd")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <RefreshCcw className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No completed tasks found</p>
              <p className="text-sm">Tasks you complete will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

