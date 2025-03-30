"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useNotificationStore } from "@/stores/notification-store"

export interface Notification {
  id: string
  title: string
  message: string
  time: Date
  read: boolean
  type: "reminder" | "due" | "system" | "completed"
  taskId?: string
}

interface NotificationsProps {
  initialNotifications?: Notification[]
  onTaskClick?: (taskId: string) => void
}

export default function Notifications({ initialNotifications = [], onTaskClick }: NotificationsProps) {
  const [open, setOpen] = useState(false)
  const { notifications, addNotification, removeNotification, markAsRead, notificationsEnabled, soundEnabled } =
    useNotificationStore()

  // Initialize notifications from props
  useEffect(() => {
    if (initialNotifications.length > 0) {
      initialNotifications.forEach((notification) => {
        addNotification(notification)
      })
    }
  }, [initialNotifications, addNotification])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markAsRead(n.id)
    })
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Bell className="h-4 w-4 text-blue-500" />
      case "due":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Calendar className="h-4 w-4 text-purple-500" />
    }
  }

  // Listen for notification events from other components
  useEffect(() => {
    const handleNotification = (e: CustomEvent) => {
      const newNotification = e.detail as Notification
      addNotification(newNotification)
    }

    window.addEventListener("newNotification" as any, handleNotification as any)
    return () => window.removeEventListener("newNotification" as any, handleNotification as any)
  }, [addNotification])

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.taskId && onTaskClick) {
      onTaskClick(notification.taskId)
      setOpen(false)
    }
  }

  // If notifications are disabled, just show the icon without badge
  if (!notificationsEnabled) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-8" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: "hidden" }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className={cn(
                    "p-3 border-b border-border/40 flex gap-3",
                    !notification.read ? "bg-primary/5 dark:bg-primary/10" : "",
                    notification.taskId ? "cursor-pointer" : "",
                    "hover:bg-primary/10 dark:hover:bg-primary/15 transition-all duration-300",
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 -mt-1 -mr-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.time), "MMM d, h:mm a")}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-8 text-center text-muted-foreground"
              >
                <p>No notifications</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  )
}

