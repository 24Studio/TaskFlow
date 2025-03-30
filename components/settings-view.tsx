"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Palette, Upload } from "lucide-react"
import { useTheme } from "next-themes"
import { BackgroundSelector } from "@/components/background-selector"
import { useNotificationStore } from "@/stores/notification-store"
import { toast } from "@/components/ui/use-toast"

interface SettingsViewProps {
  username: string
  onUsernameChange?: (username: string) => void
}

export default function SettingsView({ username, onUsernameChange }: SettingsViewProps) {
  const [displayName, setDisplayName] = useState(username)
  const [email, setEmail] = useState("user@example.com")
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState("english")
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Pobierz stan i funkcje ze store powiadomień
  const { notificationsEnabled, soundEnabled, setNotificationsEnabled, setSoundEnabled } = useNotificationStore()

  // Załaduj avatar użytkownika
  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar")
    if (savedAvatar) {
      setUserAvatar(savedAvatar)
    }
  }, [])

  const saveProfile = () => {
    if (onUsernameChange) {
      onUsernameChange(displayName)
    }

    // Pokaż powiadomienie o zapisaniu
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageDataUrl = event.target.result as string
          setUserAvatar(imageDataUrl)
          localStorage.setItem("userAvatar", imageDataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const saveNotificationSettings = () => {
    // Zapisz ustawienia powiadomień
    setNotificationsEnabled(notificationsEnabled)
    setSoundEnabled(soundEnabled)

    // Pokaż powiadomienie o zapisaniu
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated",
    })
  }

  const saveAppearanceSettings = () => {
    // Zastosuj motyw
    setTheme(theme)

    // Pokaż powiadomienie o zapisaniu
    toast({
      title: "Appearance Settings Saved",
      description: "Your appearance preferences have been updated",
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and application settings.</p>
      </motion.div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="glass mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={userAvatar || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {displayName ? displayName[0]?.toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <Button variant="outline" className="glass gap-2" onClick={triggerFileInput}>
                      <Upload className="h-4 w-4" />
                      Change Avatar
                      <input
                        type="file"
                        ref={(ref) => (fileInputRef.current = ref)}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <Button className="w-full" onClick={saveProfile}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="glass-input">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger id="timezone" className="glass-input">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                        <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                        <SelectItem value="cet">Central European Time (GMT+1)</SelectItem>
                        <SelectItem value="jst">Japan Standard Time (GMT+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekStart">Start week on Monday</Label>
                        <p className="text-sm text-muted-foreground">Change the first day of the week in calendar</p>
                      </div>
                      <Switch id="weekStart" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="24hour">Use 24-hour time</Label>
                        <p className="text-sm text-muted-foreground">Display time in 24-hour format</p>
                      </div>
                      <Switch id="24hour" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for tasks and events</p>
                  </div>
                  <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch id="emailNotifications" defaultChecked disabled={!notificationsEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="soundEnabled">Sound Notifications</Label>
                      <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
                    </div>
                    <Switch
                      id="soundEnabled"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Preferences</h3>

                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">Default Reminder Time</Label>
                    <Select defaultValue="15">
                      <SelectTrigger id="reminderTime" className="glass-input">
                        <SelectValue placeholder="Select time" />
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="taskCompletionNotifications">Task Completion</Label>
                      <p className="text-sm text-muted-foreground">Notify when tasks are completed</p>
                    </div>
                    <Switch id="taskCompletionNotifications" defaultChecked disabled={!notificationsEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dueDateNotifications">Due Date Reminders</Label>
                      <p className="text-sm text-muted-foreground">Notify when tasks are approaching due date</p>
                    </div>
                    <Switch id="dueDateNotifications" defaultChecked disabled={!notificationsEnabled} />
                  </div>
                </div>

                <Button className="w-full" onClick={saveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme" className="glass-input">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Interface Options</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reducedMotion">Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">Minimize animations throughout the app</p>
                    </div>
                    <Switch id="reducedMotion" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="highContrast">High Contrast</Label>
                      <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                    </div>
                    <Switch id="highContrast" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="glassMorphism">Glass Effect</Label>
                      <p className="text-sm text-muted-foreground">Enable glass morphism effect on cards</p>
                    </div>
                    <Switch id="glassMorphism" defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 mt-4">
                  <Label>Background Image</Label>
                  <p className="text-sm text-muted-foreground mb-2">Change the app background to a custom image</p>
                  <BackgroundSelector />
                </div>

                <Button className="w-full" onClick={saveAppearanceSettings}>
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="privacy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy and data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Data Collection</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">Allow collection of anonymous usage data</p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="crashReports">Crash Reports</Label>
                      <p className="text-sm text-muted-foreground">Send crash reports to improve app stability</p>
                    </div>
                    <Switch id="crashReports" defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Account Privacy</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Select defaultValue="friends">
                      <SelectTrigger id="profileVisibility" className="w-[140px] glass-input">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Data Management</h3>

                  <Button variant="outline" className="w-full glass">
                    Export Your Data
                  </Button>

                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

