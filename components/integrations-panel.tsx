"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plug,
  Calendar,
  Mail,
  Trello,
  Slack,
  Github,
  ChromeIcon as Google,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  category: "productivity" | "communication" | "calendar"
  authUrl?: string
  configOptions?: {
    name: string
    type: "text" | "select" | "toggle"
    options?: string[]
    value?: string | boolean
  }[]
}

export default function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your tasks with Google Calendar",
      icon: <Calendar className="h-6 w-6 text-red-500" />,
      connected: false,
      category: "calendar",
      authUrl: "https://accounts.google.com/o/oauth2/auth",
      configOptions: [
        {
          name: "Default reminder time",
          type: "select",
          options: ["5 minutes", "15 minutes", "30 minutes", "1 hour", "1 day"],
          value: "30 minutes",
        },
        {
          name: "Sync completed tasks",
          type: "toggle",
          value: true,
        },
      ],
    },
    {
      id: "outlook",
      name: "Outlook",
      description: "Connect with your Outlook calendar",
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      connected: false,
      category: "calendar",
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      configOptions: [
        {
          name: "Default reminder time",
          type: "select",
          options: ["5 minutes", "15 minutes", "30 minutes", "1 hour", "1 day"],
          value: "15 minutes",
        },
      ],
    },
    {
      id: "trello",
      name: "Trello",
      description: "Import boards and cards from Trello",
      icon: <Trello className="h-6 w-6 text-blue-400" />,
      connected: false,
      category: "productivity",
      authUrl: "https://trello.com/1/authorize",
      configOptions: [
        {
          name: "Default board",
          type: "text",
          value: "TaskFlow",
        },
      ],
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications in your Slack channels",
      icon: <Slack className="h-6 w-6 text-purple-500" />,
      connected: false,
      category: "communication",
      authUrl: "https://slack.com/oauth/v2/authorize",
      configOptions: [
        {
          name: "Default channel",
          type: "text",
          value: "#general",
        },
        {
          name: "Notify on task completion",
          type: "toggle",
          value: true,
        },
      ],
    },
    {
      id: "github",
      name: "GitHub",
      description: "Link tasks to GitHub issues",
      icon: <Github className="h-6 w-6" />,
      connected: false,
      category: "productivity",
      authUrl: "https://github.com/login/oauth/authorize",
      configOptions: [
        {
          name: "Default repository",
          type: "text",
          value: "username/repo",
        },
      ],
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Attach files from Google Drive",
      icon: <Google className="h-6 w-6 text-yellow-500" />,
      connected: false,
      category: "productivity",
      authUrl: "https://accounts.google.com/o/oauth2/auth",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Sync with your Notion workspace",
      icon: <FileText className="h-6 w-6" />,
      connected: false,
      category: "productivity",
      authUrl: "https://api.notion.com/v1/oauth/authorize",
    },
    {
      id: "time-doctor",
      name: "Time Doctor",
      description: "Track time spent on tasks",
      icon: <Clock className="h-6 w-6 text-green-500" />,
      connected: false,
      category: "productivity",
      authUrl: "https://webapi.timedoctor.com/oauth/authorize",
    },
  ])

  const [filter, setFilter] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Load integration states from localStorage
  useEffect(() => {
    const savedIntegrations = localStorage.getItem("integrations")
    if (savedIntegrations) {
      try {
        const parsed = JSON.parse(savedIntegrations)
        setIntegrations((prev) =>
          prev.map((integration) => {
            const saved = parsed.find((i: any) => i.id === integration.id)
            return saved ? { ...integration, connected: saved.connected } : integration
          }),
        )
      } catch (e) {
        console.error("Error parsing integrations:", e)
      }
    }
  }, [])

  // Save integration states to localStorage
  useEffect(() => {
    localStorage.setItem("integrations", JSON.stringify(integrations.map(({ id, connected }) => ({ id, connected }))))
  }, [integrations])

  const toggleConnection = (id: string) => {
    if (integrations.find((i) => i.id === id)?.connected) {
      // If already connected, just disconnect
      setIntegrations(
        integrations.map((integration) => (integration.id === id ? { ...integration, connected: false } : integration)),
      )
      return
    }

    // If not connected, show the connection dialog
    const integration = integrations.find((i) => i.id === id)
    if (integration) {
      setSelectedIntegration(integration)
    }
  }

  const handleConnect = () => {
    if (!selectedIntegration) return

    setIsConnecting(true)

    // Simulate connection process
    setTimeout(() => {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === selectedIntegration.id ? { ...integration, connected: true } : integration,
        ),
      )
      setIsConnecting(false)
      setSelectedIntegration(null)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1500)
  }

  const filteredIntegrations = filter
    ? integrations.filter((integration) => integration.category === filter)
    : integrations

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-500/10 border-green-500 text-green-700 dark:text-green-300">
          <AlertTitle>Integration connected successfully!</AlertTitle>
          <AlertDescription>Your integration has been set up and is ready to use.</AlertDescription>
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <Card className="glass-card p-6">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Plug className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">Integrations Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We're working on integrations with your favorite services. Check back soon for updates!
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-500" />
                </div>
                <span className="text-xs">Google Calendar</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <span className="text-xs">Outlook</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Trello className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-xs">Trello</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Slack className="h-6 w-6 text-purple-500" />
                </div>
                <span className="text-xs">Slack</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Github className="h-6 w-6" />
                </div>
                <span className="text-xs">GitHub</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Google className="h-6 w-6 text-yellow-500" />
                </div>
                <span className="text-xs">Google Drive</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Integrations are currently in development and will be available in a future update.
              </p>
            </div>

            <Button className="w-full mt-4" disabled>
              Check for Updates
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

