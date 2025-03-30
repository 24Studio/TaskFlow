"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Clock, Tag, X, Edit, Check, MoreVertical, Calendar, Bell, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, isToday, isTomorrow, addDays, isBefore, isAfter, differenceInMinutes } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Notification } from "./notifications"
import { useNotificationStore } from "@/stores/notification-store"
import { addToCalendar, createCalendarEventFromTask, type CalendarProvider } from "@/lib/calendar-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { syncTodosWithCalendar } from "@/lib/sync-service"

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
  reminderTime?: number // minutes before due
  completedAt?: Date
}

interface TodoListProps {
  highlightedTaskId?: string | null
}

export default function TodoList({ highlightedTaskId }: TodoListProps) {
  // Load todos from localStorage or use default
  const loadTodos = (): Todo[] => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos)
        // Convert string dates back to Date objects
        return parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
        }))
      } catch (e) {
        console.error("Error parsing todos:", e)
        return getDefaultTodos()
      }
    }
    return getDefaultTodos()
  }

  const getDefaultTodos = (): Todo[] => [
    {
      id: "1",
      title: "Complete project proposal",
      completed: false,
      tags: ["Work", "Priority"],
      dueTime: "less than 5 minutes",
      isPriority: true,
      dueDate: addDays(new Date(), 1),
      createdAt: new Date(2023, 3, 10),
      space: "important",
      reminder: true,
      reminderTime: 30,
    },
    {
      id: "2",
      title: "Review team updates",
      completed: false,
      tags: ["Team"],
      dueTime: "more than 1 hour",
      createdAt: new Date(2023, 3, 12),
      space: "team",
      dueDate: addDays(new Date(), 2),
      reminder: true,
      reminderTime: 60,
    },
    {
      id: "3",
      title: "Schedule weekly meeting",
      completed: true,
      tags: ["Admin"],
      createdAt: new Date(2023, 3, 8),
      space: "upcoming",
      completedAt: new Date(2023, 3, 9),
    },
    {
      id: "4",
      title: "Prepare presentation slides",
      completed: false,
      tags: ["Work"],
      dueDate: new Date(),
      createdAt: new Date(2023, 3, 14),
      space: "today",
      reminder: true,
      reminderTime: 15,
    },
  ]

  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [currentTodoId, setCurrentTodoId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeSpace, setActiveSpace] = useState("all")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState("30")
  const [calendarProvider, setCalendarProvider] = useState<CalendarProvider>("google")
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [newTaskTags, setNewTaskTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")
  const [isPriority, setIsPriority] = useState(false)
  const [isAllDay, setIsAllDay] = useState(false)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const timeOptions = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
  ]

  const [timeEditDialogOpen, setTimeEditDialogOpen] = useState(false)
  const [editingTimeForTodoId, setEditingTimeForTodoId] = useState<string | null>(null)
  const [editingIsAllDay, setEditingIsAllDay] = useState(false)
  const [editingStartTime, setEditingStartTime] = useState("09:00")
  const [editingEndTime, setEditingEndTime] = useState("10:00")

  const { addNotification } = useNotificationStore()

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))

    // Dispatch event to notify sidebar of todo changes
    window.dispatchEvent(new CustomEvent("todosUpdated"))
  }, [todos])

  // Listen for active space changes from sidebar
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sortOrder") {
        setSortOrder(e.newValue as "asc" | "desc")
      }
      if (e.key === "activeSpace") {
        setActiveSpace(e.newValue || "all")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also check localStorage directly
    const savedActiveSpace = localStorage.getItem("activeSpace")
    if (savedActiveSpace) {
      setActiveSpace(savedActiveSpace)
    }

    const savedSortOrder = localStorage.getItem("sortOrder")
    if (savedSortOrder && (savedSortOrder === "asc" || savedSortOrder === "desc")) {
      setSortOrder(savedSortOrder)
    }

    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Sort todos by creation date
  const sortedTodos = [...todos].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA
  })

  // Filter todos by active space
  const filteredTodos =
    activeSpace === "all"
      ? sortedTodos
      : activeSpace === "important"
        ? sortedTodos.filter((todo) => todo.isPriority)
        : activeSpace === "today"
          ? sortedTodos.filter((todo) => todo.dueDate && isToday(todo.dueDate))
          : activeSpace === "upcoming"
            ? sortedTodos.filter((todo) => {
                if (!todo.completed && todo.dueDate) {
                  const dueDate = new Date(todo.dueDate)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const tomorrow = new Date(today)
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  return dueDate >= tomorrow
                }
                return false
              })
            : activeSpace === "team"
              ? sortedTodos.filter((todo) => todo.tags && todo.tags.some((tag) => tag.toLowerCase().includes("team")))
              : sortedTodos.filter((todo) => todo.space === activeSpace)

  const addTodo = () => {
    if (newTodo.trim() === "") return

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo,
      completed: false,
      tags: newTaskTags,
      dueDate: selectedDate,
      startTime: selectedDate && !isAllDay ? startTime : undefined,
      endTime: selectedDate && !isAllDay ? endTime : undefined,
      isAllDay: selectedDate ? isAllDay : undefined,
      createdAt: new Date(),
      space: activeSpace === "all" ? undefined : activeSpace,
      reminder: reminderEnabled,
      reminderTime: reminderEnabled ? Number.parseInt(reminderTime) : undefined,
      isPriority: isPriority,
    }

    setTodos([...todos, todo])
    // Sync with calendar
    syncTodosWithCalendar()
    setNewTodo("")
    setSelectedDate(undefined)
    setNewTaskTags([])
    setIsPriority(false)
    setIsAllDay(false)
    setStartTime("09:00")
    setEndTime("10:00")
    setShowAddTaskDialog(false)

    // Dispatch event to update sidebar
    window.dispatchEvent(new CustomEvent("todosUpdated"))

    // Create notification for new task
    const notification: Notification = {
      id: Date.now().toString(),
      title: "New Task Created",
      message: `You've added "${todo.title}" to your tasks`,
      time: new Date(),
      read: false,
      type: "system",
      taskId: todo.id,
    }

    dispatchNotification(notification)
  }

  const addTag = () => {
    if (newTagInput.trim() === "") return
    if (!newTaskTags.includes(newTagInput.trim())) {
      setNewTaskTags([...newTaskTags, newTagInput.trim()])
    }
    setNewTagInput("")
  }

  const removeTag = (tag: string) => {
    setNewTaskTags(newTaskTags.filter((t) => t !== tag))
  }

  const toggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const completed = !todo.completed
          const completedAt = completed ? new Date() : undefined

          // Create notification when task is completed
          if (completed) {
            const notification: Notification = {
              id: Date.now().toString(),
              title: "Task Completed",
              message: `You've completed "${todo.title}"`,
              time: new Date(),
              read: false,
              type: "completed",
              taskId: todo.id,
            }

            dispatchNotification(notification)
          }

          return { ...todo, completed, completedAt }
        }
        return todo
      }),
    )
    // Sync with calendar
    syncTodosWithCalendar()
  }

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find((todo) => todo.id === id)
    setTodos(todos.filter((todo) => todo.id !== id))
    // Sync with calendar
    syncTodosWithCalendar()

    if (todoToDelete) {
      const notification: Notification = {
        id: Date.now().toString(),
        title: "Task Deleted",
        message: `"${todoToDelete.title}" has been deleted`,
        time: new Date(),
        read: false,
        type: "system",
      }

      dispatchNotification(notification)
    }
  }

  const startEditing = (id: string, title: string) => {
    setEditingId(id)
    setEditText(title)
  }

  const saveEdit = () => {
    if (editingId) {
      setTodos(todos.map((todo) => (todo.id === editingId ? { ...todo, title: editText } : todo)))
      setEditingId(null)
    }
  }

  const togglePriority = (id: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const isPriority = !todo.isPriority

          // Create notification when task is marked as priority
          if (isPriority) {
            const notification: Notification = {
              id: Date.now().toString(),
              title: "Priority Task",
              message: `"${todo.title}" has been marked as priority`,
              time: new Date(),
              read: false,
              type: "system",
              taskId: todo.id,
            }

            dispatchNotification(notification)
          }

          return { ...todo, isPriority }
        }
        return todo
      }),
    )
  }

  const setDueDate = (id: string, date?: Date) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          // Create notification when due date is set
          if (date && (!todo.dueDate || todo.dueDate.getTime() !== date.getTime())) {
            const notification: Notification = {
              id: Date.now().toString(),
              title: "Due Date Set",
              message: `"${todo.title}" is due on ${format(date, "MMM dd, yyyy")}`,
              time: new Date(),
              read: false,
              type: "due",
              taskId: todo.id,
            }

            dispatchNotification(notification)
          }

          return { ...todo, dueDate: date }
        }
        return todo
      }),
    )
    // Sync with calendar
    syncTodosWithCalendar()
    setDatePickerOpen(false)
    setCurrentTodoId(null)
  }

  const openDatePicker = (id: string) => {
    setCurrentTodoId(id)
    setDatePickerOpen(true)
    const todo = todos.find((t) => t.id === id)
    setSelectedDate(todo?.dueDate)
  }

  const toggleReminder = (id: string, enabled: boolean) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, reminder: enabled } : todo)))
  }

  const updateReminderTime = (id: string, time: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, reminderTime: Number.parseInt(time) } : todo)))
  }

  // Function to add a task to calendar
  const handleAddToCalendar = (todo: Todo, provider: CalendarProvider) => {
    if (!todo.dueDate) {
      // Show notification that task needs a due date
      const notification: Notification = {
        id: Date.now().toString(),
        title: "Calendar Error",
        message: `Please set a due date for "${todo.title}" before adding to calendar`,
        time: new Date(),
        read: false,
        type: "system",
      }
      dispatchNotification(notification)
      return
    }

    const calendarEvent = createCalendarEventFromTask(todo)
    addToCalendar(calendarEvent, provider)

    // Show success notification
    const notification: Notification = {
      id: Date.now().toString(),
      title: "Added to Calendar",
      message: `"${todo.title}" has been added to your ${provider} calendar`,
      time: new Date(),
      read: false,
      type: "system",
    }
    dispatchNotification(notification)
  }

  // Function to dispatch notification events
  const dispatchNotification = (notification: Notification) => {
    addNotification(notification)
  }

  // Check for upcoming due dates and reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()

      todos.forEach((todo) => {
        if (todo.completed) return

        if (todo.dueDate) {
          // Check if due date is today and hasn't been notified yet
          if (
            isToday(todo.dueDate) &&
            differenceInMinutes(todo.dueDate, now) <= 60 &&
            differenceInMinutes(todo.dueDate, now) > 0
          ) {
            const notification: Notification = {
              id: `due-soon-${todo.id}-${now.getTime()}`,
              title: "Task Due Soon",
              message: `"${todo.title}" is due in less than an hour`,
              time: new Date(),
              read: false,
              type: "due",
              taskId: todo.id,
            }

            // Check if we've already sent this notification in the last hour
            const notificationKey = `notified-due-soon-${todo.id}`
            const lastNotified = localStorage.getItem(notificationKey)

            if (!lastNotified || Date.now() - Number.parseInt(lastNotified) > 60 * 60 * 1000) {
              dispatchNotification(notification)
              localStorage.setItem(notificationKey, Date.now().toString())
            }
          }

          // Check for reminder notifications
          if (todo.reminder && todo.reminderTime && !isToday(todo.dueDate)) {
            const reminderTime = new Date(todo.dueDate.getTime() - todo.reminderTime * 60 * 1000)

            // If it's time for the reminder (within the last 5 minutes)
            if (isAfter(reminderTime, new Date(now.getTime() - 5 * 60 * 1000)) && isBefore(reminderTime, now)) {
              const notification: Notification = {
                id: `reminder-${todo.id}-${now.getTime()}`,
                title: "Task Reminder",
                message: `"${todo.title}" is due on ${format(todo.dueDate, "MMM dd")}`,
                time: new Date(),
                read: false,
                type: "reminder",
                taskId: todo.id,
              }

              // Check if we've already sent this reminder
              const reminderKey = `notified-reminder-${todo.id}`
              const lastReminded = localStorage.getItem(reminderKey)

              if (!lastReminded || Date.now() - Number.parseInt(lastReminded) > 12 * 60 * 60 * 1000) {
                dispatchNotification(notification)
                localStorage.setItem(reminderKey, Date.now().toString())
              }
            }
          }
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkReminders, 60 * 1000)
    checkReminders() // Check immediately on mount

    return () => clearInterval(interval)
  }, [todos, addNotification])

  // Scroll to highlighted task
  useEffect(() => {
    if (highlightedTaskId && taskRefs.current[highlightedTaskId]) {
      taskRefs.current[highlightedTaskId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      // Add highlight animation
      const element = taskRefs.current[highlightedTaskId]
      element?.classList.add("ring-2", "ring-primary", "ring-offset-2")

      // Pulse animation
      const pulseAnimation = () => {
        element?.classList.add("opacity-70")
        setTimeout(() => {
          element?.classList.remove("opacity-70")
        }, 300)
      }

      // Pulse a few times
      let pulseCount = 0
      const pulseInterval = setInterval(() => {
        pulseAnimation()
        pulseCount++
        if (pulseCount >= 3) {
          clearInterval(pulseInterval)
          setTimeout(() => {
            element?.classList.remove("ring-2", "ring-primary", "ring-offset-2")
          }, 500)
        }
      }, 600)

      return () => {
        clearInterval(pulseInterval)
        element?.classList.remove("ring-2", "ring-primary", "ring-offset-2", "opacity-70")
      }
    }
  }, [highlightedTaskId])

  const openTimeEditDialog = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setEditingTimeForTodoId(id)
      setEditingIsAllDay(todo.isAllDay || false)
      setEditingStartTime(todo.startTime || "09:00")
      setEditingEndTime(todo.endTime || "10:00")
      setTimeEditDialogOpen(true)
    }
  }

  const saveTimeEdits = () => {
    if (editingTimeForTodoId) {
      setTodos(
        todos.map((todo) => {
          if (todo.id === editingTimeForTodoId) {
            return {
              ...todo,
              isAllDay: editingIsAllDay,
              startTime: !editingIsAllDay ? editingStartTime : undefined,
              endTime: !editingIsAllDay ? editingEndTime : undefined,
            }
          }
          return todo
        }),
      )

      // Sync with calendar
      syncTodosWithCalendar()

      // Create notification
      const todoToUpdate = todos.find((todo) => todo.id === editingTimeForTodoId)
      if (todoToUpdate) {
        const notification: Notification = {
          id: Date.now().toString(),
          title: "Task Time Updated",
          message: `Time settings updated for "${todoToUpdate.title}"`,
          time: new Date(),
          read: false,
          type: "system",
          taskId: todoToUpdate.id,
        }

        dispatchNotification(notification)
      }

      setTimeEditDialogOpen(false)
      setEditingTimeForTodoId(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="flex-1">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setShowAddTaskDialog(true)}
            className="glass-input"
          />
        </div>

        <Button
          onClick={() => setShowAddTaskDialog(true)}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Task
        </Button>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
              ref={(el) => (taskRefs.current[todo.id] = el)}
              className="card-transition"
            >
              <Card
                className={cn(
                  "overflow-hidden transition-all duration-300 glass-card hover:shadow-lg",
                  todo.isPriority ? "border-orange-300 dark:border-orange-500" : "",
                  todo.completed ? "opacity-70" : "",
                  todo.dueDate && isToday(todo.dueDate) ? "border-green-300 dark:border-green-500" : "",
                  todo.dueDate && isBefore(todo.dueDate, new Date()) && !todo.completed
                    ? "border-red-300 dark:border-red-500"
                    : "",
                  highlightedTaskId === todo.id ? "ring-2 ring-primary ring-offset-2" : "",
                )}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full h-6 w-6 min-w-6 p-0 transition-all duration-300 cursor-pointer",
                        todo.completed ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                      )}
                      onClick={() => toggleComplete(todo.id)}
                    >
                      {todo.completed && <Check className="h-3 w-3" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            autoFocus
                            className="glass-input"
                          />
                          <Button size="sm" onClick={saveEdit} className="glass">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p
                            className={cn(
                              "font-medium break-words text-sm sm:text-base",
                              todo.completed ? "line-through text-muted-foreground" : "",
                            )}
                          >
                            {todo.title}
                          </p>

                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                            {todo.tags &&
                              todo.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs glass">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}

                            {todo.dueTime && (
                              <Badge variant="outline" className="text-xs text-muted-foreground glass">
                                <Clock className="h-3 w-3 mr-1" />
                                {todo.dueTime}
                              </Badge>
                            )}

                            {todo.dueDate && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs glass",
                                  isToday(todo.dueDate)
                                    ? "text-green-500 dark:text-green-300"
                                    : isTomorrow(todo.dueDate)
                                      ? "text-blue-500 dark:text-blue-300"
                                      : isBefore(todo.dueDate, new Date())
                                        ? "text-red-500 dark:text-red-300"
                                        : "text-blue-500 dark:text-blue-300",
                                )}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {isToday(todo.dueDate)
                                  ? "Today"
                                  : isTomorrow(todo.dueDate)
                                    ? "Tomorrow"
                                    : format(todo.dueDate, "MMM dd, yyyy")}
                                {todo.isAllDay && " (All day)"}
                                {!todo.isAllDay &&
                                  todo.startTime &&
                                  todo.endTime &&
                                  ` ${todo.startTime}-${todo.endTime}`}
                              </Badge>
                            )}

                            {todo.reminder && todo.dueDate && (
                              <Badge variant="outline" className="text-xs text-purple-500 dark:text-purple-300 glass">
                                <Bell className="h-3 w-3 mr-1" />
                                {todo.reminderTime} min before
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass">
                          <DropdownMenuItem onClick={() => startEditing(todo.id, todo.title)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePriority(todo.id)}>
                            <Tag className="h-4 w-4 mr-2" />
                            {todo.isPriority ? "Remove priority" : "Mark as priority"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDatePicker(todo.id)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Set due date
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openTimeEditDialog(todo.id)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Set time
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleAddToCalendar(todo, "google")}
                            disabled={!todo.dueDate}
                            className="text-primary font-medium"
                          >
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Add to Calendar
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => deleteTodo(todo.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p>No tasks yet. Add your first task above!</p>
          </motion.div>
        )}
      </div>

      {/* Simplified Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="glass-input"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal glass-input">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass" align="start">
                    <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <div className="flex items-center h-10 space-x-2">
                  <Switch id="priority" checked={isPriority} onCheckedChange={setIsPriority} />
                  <Label htmlFor="priority">Mark as priority</Label>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="all-day">All Day</Label>
                  <div className="flex items-center h-10 space-x-2">
                    <Switch id="all-day" checked={isAllDay} onCheckedChange={setIsAllDay} />
                    <Label htmlFor="all-day">All day task</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder">Reminder</Label>
                  <div className="flex items-center h-10 space-x-2">
                    <Switch id="reminder" checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
                    <Label htmlFor="reminder">Set reminder</Label>
                  </div>
                </div>
              </div>
            )}

            {selectedDate && !isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger id="start-time" className="glass-input">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[200px]">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger id="end-time" className="glass-input">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[200px]">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {reminderEnabled && selectedDate && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger id="reminder-time" className="glass-input">
                    <SelectValue placeholder="Remind me before" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  className="glass-input"
                />
                <Button onClick={addTag} size="sm" className="glass">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newTaskTags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="glass flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addTodo} disabled={!newTodo.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Picker Popover */}
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverContent className="w-auto p-0 glass" align="center">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => currentTodoId && setDueDate(currentTodoId, date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time Edit Dialog */}
      <Dialog open={timeEditDialogOpen} onOpenChange={setTimeEditDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Time Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch id="edit-all-day" checked={editingIsAllDay} onCheckedChange={setEditingIsAllDay} />
              <Label htmlFor="edit-all-day">All day task</Label>
            </div>

            {!editingIsAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-time">Start Time</Label>
                  <Select value={editingStartTime} onValueChange={setEditingStartTime}>
                    <SelectTrigger id="edit-start-time" className="glass-input">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[200px]">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-time">End Time</Label>
                  <Select value={editingEndTime} onValueChange={setEditingEndTime}>
                    <SelectTrigger id="edit-end-time" className="glass-input">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[200px]">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTimeEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

