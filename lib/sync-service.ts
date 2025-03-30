// Synchronization service for tasks and calendar events

import type { Notification } from "@/components/notifications"

// Function to synchronize todos with calendar events
export function syncTodosWithCalendar() {
  try {
    // Load todos from localStorage
    const savedTodos = localStorage.getItem("todos")
    if (!savedTodos) return

    const todos = JSON.parse(savedTodos)

    // Load calendar events from localStorage
    const savedEvents = localStorage.getItem("calendarEvents")
    let events = savedEvents ? JSON.parse(savedEvents) : []

    // Filter out events that were created from todos
    events = events.filter((event: any) => !event.id.startsWith("todo-"))

    // Convert todos with due dates to calendar events
    const todoEvents = todos
      .filter((todo: any) => todo.dueDate && !todo.completed)
      .map((todo: any) => ({
        id: `todo-${todo.id}`,
        title: todo.title,
        date: new Date(todo.dueDate),
        startTime: todo.startTime,
        endTime: todo.endTime,
        isAllDay: todo.isAllDay,
        color: todo.isPriority ? "bg-red-500" : "bg-blue-500",
        reminder: todo.reminder,
        reminderTime: todo.reminderTime,
      }))

    // Combine standalone events with todo events
    const combinedEvents = [...events, ...todoEvents]

    // Save combined events to localStorage
    localStorage.setItem("calendarEvents", JSON.stringify(combinedEvents))

    // Create notification for sync
    const notification: Notification = {
      id: Date.now().toString(),
      title: "Calendar Synchronized",
      message: `${todoEvents.length} tasks synchronized with calendar`,
      time: new Date(),
      read: false,
      type: "system",
    }

    // Dispatch notification event
    window.dispatchEvent(
      new CustomEvent("newNotification", {
        detail: notification,
      }),
    )

    return combinedEvents
  } catch (e) {
    console.error("Error syncing todos with calendar:", e)
    return []
  }
}

// Function to update a task from a calendar event
export function updateTaskFromEvent(eventId: string, updates: any) {
  if (!eventId.startsWith("todo-")) return false

  const taskId = eventId.replace("todo-", "")

  try {
    // Load todos from localStorage
    const savedTodos = localStorage.getItem("todos")
    if (!savedTodos) return false

    const todos = JSON.parse(savedTodos)

    // Find and update the task
    const updatedTodos = todos.map((todo: any) => {
      if (todo.id === taskId) {
        return {
          ...todo,
          dueDate: updates.date ? new Date(updates.date) : todo.dueDate,
          startTime: updates.startTime || todo.startTime,
          endTime: updates.endTime || todo.endTime,
          isAllDay: updates.isAllDay !== undefined ? updates.isAllDay : todo.isAllDay,
          reminder: updates.reminder !== undefined ? updates.reminder : todo.reminder,
          reminderTime: updates.reminderTime || todo.reminderTime,
        }
      }
      return todo
    })

    // Save updated todos to localStorage
    localStorage.setItem("todos", JSON.stringify(updatedTodos))

    // Dispatch event to notify todo list of changes
    window.dispatchEvent(new CustomEvent("todosUpdated"))

    return true
  } catch (e) {
    console.error("Error updating task from event:", e)
    return false
  }
}

// Function to create a task from a calendar event
export function createTaskFromEvent(event: any) {
  try {
    // Load todos from localStorage
    const savedTodos = localStorage.getItem("todos")
    const todos = savedTodos ? JSON.parse(savedTodos) : []

    // Create new task from event
    const newTask = {
      id: Date.now().toString(),
      title: event.title,
      completed: false,
      tags: ["Calendar"],
      dueDate: new Date(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      isAllDay: event.isAllDay,
      createdAt: new Date(),
      space: "upcoming",
      reminder: event.reminder,
      reminderTime: event.reminderTime,
      isPriority: false,
    }

    // Add new task to todos
    const updatedTodos = [...todos, newTask]

    // Save updated todos to localStorage
    localStorage.setItem("todos", JSON.stringify(updatedTodos))

    // Dispatch event to notify todo list of changes
    window.dispatchEvent(new CustomEvent("todosUpdated"))

    // Create notification for new task
    const notification: Notification = {
      id: Date.now().toString(),
      title: "Task Created from Calendar",
      message: `"${event.title}" has been added to your tasks`,
      time: new Date(),
      read: false,
      type: "system",
    }

    // Dispatch notification event
    window.dispatchEvent(
      new CustomEvent("newNotification", {
        detail: notification,
      }),
    )

    return newTask.id
  } catch (e) {
    console.error("Error creating task from event:", e)
    return null
  }
}

