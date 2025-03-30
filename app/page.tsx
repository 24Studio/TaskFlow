"use client"

import { useState, useEffect, useRef, lazy, Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import WelcomeScreen from "@/components/welcome-screen"
import Sidebar from "@/components/sidebar"
import Notifications from "@/components/notifications"
import { ModeToggle } from "@/components/mode-toggle"
import type { Notification } from "@/components/notifications"
import { BackgroundInitializer } from "@/components/background-initializer"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ListTodo, Plug, History } from "lucide-react"

// Lazy load components for better performance
const TodoList = lazy(() => import("@/components/todo-list"))
const CalendarView = lazy(() => import("@/components/calendar-view"))
const IntegrationsPanel = lazy(() => import("@/components/integrations-panel"))
const HomeView = lazy(() => import("@/components/home-view"))
const SettingsView = lazy(() => import("@/components/settings-view"))
const TaskHistory = lazy(() => import("@/components/task-history"))

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
)

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [username, setUsername] = useState("")
  const [activeView, setActiveView] = useState<"home" | "tasks" | "settings">("tasks")
  const [activeTab, setActiveTab] = useState("tasks")
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Initial notifications
  const initialNotifications: Notification[] = [
    {
      id: "1",
      title: "Task Reminder",
      message: "Complete project proposal is due in 30 minutes",
      time: new Date(),
      read: false,
      type: "reminder",
      taskId: "1",
    },
    {
      id: "2",
      title: "Calendar Event",
      message: "Team meeting starts in 15 minutes",
      time: new Date(Date.now() - 1000 * 60 * 30),
      read: true,
      type: "system",
    },
  ]

  const handleCompleteWelcome = (name: string) => {
    setUsername(name)
    setShowWelcome(false)
  }

  const handleTaskClick = (taskId: string) => {
    setHighlightedTaskId(taskId)
    setActiveView("tasks")
    setActiveTab("tasks")
  }

  const handleViewChange = (view: string) => {
    if (view === "home") {
      setActiveView("home")
    } else if (view === "tasks") {
      setActiveView("tasks")
    } else if (view === "settings") {
      setActiveView("settings")
    }
  }

  // Handle clicks outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Mobile sidebar handling logic would go here
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("username")

    if (savedUsername) {
      setUsername(savedUsername)
      setShowWelcome(false)
    }

    // Apply background if saved
    const savedBackground = localStorage.getItem("appBackground")
    if (savedBackground) {
      document.documentElement.style.setProperty(
        "--app-background",
        savedBackground.startsWith("linear-gradient") ? savedBackground : `url(${savedBackground})`,
      )
    }
  }, [])

  // Save username to localStorage when it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem("username", username)
    }
  }, [username])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BackgroundInitializer />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/50 transition-all duration-300 ease-in-out">
        {showWelcome ? (
          <WelcomeScreen onComplete={handleCompleteWelcome} />
        ) : (
          <div className="flex h-screen overflow-hidden relative">
            {/* Sidebar */}
            <div ref={sidebarRef} className="md:relative">
              <Sidebar username={username} onViewChange={handleViewChange} />
            </div>

            <div className="flex-1 overflow-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-end items-center mb-4 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ModeToggle />
                    <Notifications initialNotifications={initialNotifications} onTaskClick={handleTaskClick} />
                  </div>
                </div>

                <Suspense fallback={<LoadingFallback />}>
                  {activeView === "home" && <HomeView username={username} />}

                  {activeView === "tasks" && (
                    <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid grid-cols-4 mb-4 sm:mb-8 glass">
                        <TabsTrigger value="tasks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <ListTodo className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Tasks</span>
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Calendar</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <History className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>History</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="integrations"
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Plug className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Integrations</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="tasks">
                        <Suspense fallback={<LoadingFallback />}>
                          <TodoList highlightedTaskId={highlightedTaskId} />
                        </Suspense>
                      </TabsContent>

                      <TabsContent value="calendar" className="calendar-container">
                        <Suspense fallback={<LoadingFallback />}>
                          <CalendarView onTodayClick={() => {}} />
                        </Suspense>
                      </TabsContent>

                      <TabsContent value="history">
                        <Suspense fallback={<LoadingFallback />}>
                          <TaskHistory />
                        </Suspense>
                      </TabsContent>

                      <TabsContent value="integrations">
                        <Suspense fallback={<LoadingFallback />}>
                          <IntegrationsPanel />
                        </Suspense>
                      </TabsContent>
                    </Tabs>
                  )}

                  {activeView === "settings" && <SettingsView username={username} onUsernameChange={setUsername} />}
                </Suspense>
              </div>
            </div>
          </div>
        )}
        <Toaster />
      </main>
    </ThemeProvider>
  )
}

