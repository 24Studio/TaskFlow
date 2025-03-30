"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart2,
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  Star,
  Clock,
  Calendar,
  Users,
  SortAsc,
  SortDesc,
  Filter,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { TaskflowLogo } from "./taskflow-logo"
import { CreateSpaceDialog } from "./create-space-dialog"
import { useNotificationStore } from "@/stores/notification-store"
import { BackgroundSelector } from "./background-selector"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SidebarProps {
  username: string
  onViewChange?: (view: string) => void
}

interface Space {
  id: string
  name: string
  icon: React.ReactNode | string
  count: number
  color?: string
  isCustom?: boolean
}

const ICONS = [
  { name: "Home", icon: BarChart2 },
  { name: "Settings", icon: Settings },
  { name: "LogOut", icon: LogOut },
  { name: "Search", icon: Search },
  { name: "ChevronLeft", icon: ChevronLeft },
  { name: "ChevronRight", icon: ChevronRight },
  { name: "Layers", icon: Layers },
  { name: "Star", icon: Star },
  { name: "Clock", icon: Clock },
  { name: "Calendar", icon: Calendar },
  { name: "Users", icon: Users },
  { name: "SortAsc", icon: SortAsc },
  { name: "SortDesc", icon: SortDesc },
  { name: "Filter", icon: Filter },
  { name: "Plus", icon: Plus },
]

export default function Sidebar({ username, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSpace, setActiveSpace] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState<"all" | "completed" | "incomplete" | "priority">("all")
  const [showSettings, setShowSettings] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false)
  const [showManageSpacesDialog, setShowManageSpacesDialog] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [editSpaceName, setEditSpaceName] = useState("")
  const [settingsTab, setSettingsTab] = useState("profile")

  // Pobierz stan i funkcje ze store powiadomień
  const { notificationsEnabled, soundEnabled, setNotificationsEnabled, setSoundEnabled } = useNotificationStore()

  const { theme, setTheme } = useTheme()

  const [spaces, setSpaces] = useState<Space[]>([
    { id: "all", name: "All Tasks", icon: <Layers size={18} />, count: 0 },
    { id: "important", name: "Important", icon: <Star size={18} />, count: 0, color: "text-yellow-500" },
    { id: "upcoming", name: "Upcoming", icon: <Clock size={18} />, count: 0, color: "text-blue-500" },
    { id: "today", name: "Today", icon: <Calendar size={18} />, count: 0, color: "text-green-500" },
    { id: "team", name: "Team Projects", icon: <Users size={18} />, count: 0, color: "text-purple-500" },
  ])

  // Załaduj avatar użytkownika
  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar")
    if (savedAvatar) {
      setUserAvatar(savedAvatar)
    }
  }, [])

  // Załaduj i aktualizuj przestrzenie z localStorage
  useEffect(() => {
    const updateSpaceCounts = () => {
      try {
        // Załaduj zadania z localStorage
        const savedTodos = localStorage.getItem("todos")
        if (!savedTodos) return

        const todos = JSON.parse(savedTodos)

        // Oblicz liczby dla każdej przestrzeni
        const allCount = todos.length
        const importantCount = todos.filter((todo: any) => todo.isPriority).length
        const upcomingCount = todos.filter((todo: any) => {
          if (!todo.completed && todo.dueDate) {
            const dueDate = new Date(todo.dueDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            return dueDate >= tomorrow
          }
          return false
        }).length

        const todayCount = todos.filter((todo: any) => {
          if (!todo.completed && todo.dueDate) {
            const dueDate = new Date(todo.dueDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            return dueDate >= today && dueDate < tomorrow
          }
          return false
        }).length

        const teamCount = todos.filter(
          (todo: any) => todo.tags && todo.tags.some((tag: string) => tag.toLowerCase().includes("team")),
        ).length

        // Aktualizuj przestrzenie z rzeczywistymi liczbami
        setSpaces((prev) =>
          prev.map((space) => {
            switch (space.id) {
              case "all":
                return { ...space, count: allCount }
              case "important":
                return { ...space, count: importantCount }
              case "upcoming":
                return { ...space, count: upcomingCount }
              case "today":
                return { ...space, count: todayCount }
              case "team":
                return { ...space, count: teamCount }
              default:
                return space
            }
          }),
        )
      } catch (e) {
        console.error("Error updating space counts:", e)
      }
    }

    // Aktualizuj liczby na początku
    updateSpaceCounts()

    // Ustaw nasłuchiwanie na zmiany zadań
    window.addEventListener("todosUpdated", updateSpaceCounts)

    return () => {
      window.removeEventListener("todosUpdated", updateSpaceCounts)
    }
  }, [])

  // Załaduj niestandardowe przestrzenie z localStorage
  useEffect(() => {
    const savedCustomSpaces = localStorage.getItem("customSpaces")
    if (savedCustomSpaces) {
      try {
        const parsed = JSON.parse(savedCustomSpaces)
        // Dodaj niestandardowe przestrzenie do tablicy przestrzeni
        setSpaces((prev) => {
          // Odfiltruj istniejące niestandardowe przestrzenie, aby uniknąć duplikatów
          const defaultSpaces = prev.filter((space) => !space.isCustom)
          return [...defaultSpaces, ...parsed]
        })
      } catch (e) {
        console.error("Error parsing custom spaces:", e)
      }
    }
  }, [])

  // Sortowanie i filtrowanie spaces
  const filteredAndSortedSpaces = useMemo(() => {
    // Najpierw filtruj według wyszukiwania
    let result = spaces.filter((space) => space.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Sortuj według nazwy lub liczby zadań
    if (sortOrder === "asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name))
    }

    return result
  }, [spaces, searchQuery, sortOrder])

  // Aktualizuj localStorage, gdy zmienia się kolejność sortowania, filtr lub aktywna przestrzeń
  useEffect(() => {
    localStorage.setItem("sortOrder", sortOrder)
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "sortOrder",
        newValue: sortOrder,
      }),
    )
  }, [sortOrder])

  useEffect(() => {
    localStorage.setItem("filterType", filterType)
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "filterType",
        newValue: filterType,
      }),
    )
  }, [filterType])

  useEffect(() => {
    localStorage.setItem("activeSpace", activeSpace)
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "activeSpace",
        newValue: activeSpace,
      }),
    )
  }, [activeSpace])

  const handleSpaceClick = (spaceId: string) => {
    setActiveSpace(spaceId)
    if (onViewChange) {
      onViewChange("tasks")
    }
  }

  const handleStatisticsClick = () => {
    // Resetuj do domyślnego widoku
    setActiveSpace("all")
    setSortOrder("desc")
    if (onViewChange) {
      onViewChange("home")
    }
  }

  const handleSettingsClick = () => {
    setShowSettings(true)
  }

  const handleLogout = () => {
    // Otwórz dialog potwierdzenia wylogowania
    setShowLogoutDialog(true)
  }

  const saveSettings = () => {
    // Zapisz ustawienia powiadomień w localStorage
    setNotificationsEnabled(notificationsEnabled)
    setSoundEnabled(soundEnabled)

    // Zastosuj motyw
    setTheme(theme)

    setShowSettings(false)

    // Pokaż powiadomienie o zapisaniu
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    })
  }

  // Załaduj ustawienia z localStorage przy montowaniu
  useEffect(() => {
    // Ustawienia są już załadowane przez useNotificationStore
    const savedFilterType = localStorage.getItem("filterType") as "all" | "completed" | "incomplete" | "priority" | null
    if (savedFilterType) {
      setFilterType(savedFilterType)
    }

    const savedSortOrder = localStorage.getItem("sortOrder") as "asc" | "desc" | null
    if (savedSortOrder) {
      setSortOrder(savedSortOrder)
    }
  }, [])

  const confirmLogout = () => {
    // Wyczyść wszystkie dane localStorage
    localStorage.clear()
    // Przeładuj stronę, aby zresetować stan aplikacji
    window.location.reload()
  }

  const handleCreateSpace = (space: { id: string; name: string; icon: string; color: string }) => {
    // Utwórz nową przestrzeń z podanymi szczegółami
    const newSpace = {
      id: space.id,
      name: space.name,
      icon: space.icon,
      count: 0,
      color: space.color,
      isCustom: true,
    }

    // Dodaj do przestrzeni
    setSpaces([...spaces, newSpace])

    // Zapisz w localStorage
    const customSpaces = spaces.filter((s) => s.isCustom).concat(newSpace)
    localStorage.setItem("customSpaces", JSON.stringify(customSpaces))

    toast({
      title: "Space Created",
      description: `Space "${space.name}" has been created successfully.`,
    })
  }

  const handleEditSpace = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId)
    if (space) {
      setEditingSpaceId(spaceId)
      setEditSpaceName(space.name)
    }
  }

  const saveSpaceEdit = () => {
    if (!editingSpaceId || editSpaceName.trim() === "") return

    setSpaces(spaces.map((space) => (space.id === editingSpaceId ? { ...space, name: editSpaceName } : space)))

    // Zapisz zaktualizowane niestandardowe przestrzenie
    const customSpaces = spaces
      .filter((s) => s.isCustom)
      .map((s) => (s.id === editingSpaceId ? { ...s, name: editSpaceName } : s))

    localStorage.setItem("customSpaces", JSON.stringify(customSpaces))

    setEditingSpaceId(null)
    setEditSpaceName("")

    toast({
      title: "Space Updated",
      description: "Space name has been updated successfully.",
    })
  }

  const cancelSpaceEdit = () => {
    setEditingSpaceId(null)
    setEditSpaceName("")
  }

  const deleteSpace = (spaceId: string) => {
    // Sprawdź, czy to nie jest domyślna przestrzeń
    const spaceToDelete = spaces.find((s) => s.id === spaceId)
    if (!spaceToDelete?.isCustom) {
      toast({
        title: "Cannot Delete",
        description: "Default spaces cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    // Usuń przestrzeń
    const updatedSpaces = spaces.filter((s) => s.id !== spaceId)
    setSpaces(updatedSpaces)

    // Jeśli usuwana przestrzeń jest aktywna, przełącz na "all"
    if (activeSpace === spaceId) {
      setActiveSpace("all")
      localStorage.setItem("activeSpace", "all")
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "activeSpace",
          newValue: "all",
        }),
      )
    }

    // Zapisz zaktualizowane niestandardowe przestrzenie
    const customSpaces = updatedSpaces.filter((s) => s.isCustom)
    localStorage.setItem("customSpaces", JSON.stringify(customSpaces))

    toast({
      title: "Space Deleted",
      description: `Space "${spaceToDelete.name}" has been deleted.`,
    })
  }

  const renderIcon = (icon: React.ReactNode | string) => {
    if (typeof icon === "string") {
      // Znajdź ikonę w tablicy ICONS
      const IconComponent = ICONS.find((i) => i.name === icon)?.icon || BarChart2
      return <IconComponent size={18} />
    }
    return icon
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageDataUrl = event.target.result as string
          setUserAvatar(imageDataUrl)
          localStorage.setItem("userAvatar", imageDataUrl)

          toast({
            title: "Avatar Updated",
            description: "Your profile picture has been updated.",
          })
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

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={cn("h-full glass-card border-r border-border/40 flex flex-col", collapsed ? "items-center" : "")}
    >
      {/* Nagłówek */}
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed ? <TaskflowLogo /> : <TaskflowLogo variant="icon" />}

        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="rounded-full">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Informacje o użytkowniku */}
      <div className={cn("p-4 flex items-center gap-3", collapsed ? "justify-center" : "")}>
        <Avatar className="h-9 w-9 border-2 border-primary/20">
          <AvatarImage src={userAvatar || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {username ? username[0]?.toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-w-0"
          >
            <p className="font-medium truncate">Hi, @{username}</p>
            <p className="text-xs text-muted-foreground">Free Account</p>
          </motion.div>
        )}
      </div>

      {/* Wyszukiwanie */}
      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search spaces..."
              className="pl-9 glass-input vision-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* Opcje sortowania */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-4 py-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <SortDesc className="h-3.5 w-3.5 mr-1" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass">
                <DropdownMenuRadioGroup
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                >
                  <DropdownMenuRadioItem value="asc">
                    <SortAsc className="h-3.5 w-3.5 mr-2" />
                    Ascending
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc">
                    <SortDesc className="h-3.5 w-3.5 mr-2" />
                    Descending
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass">
                <DropdownMenuRadioGroup value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <DropdownMenuRadioItem value="all">All Tasks</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="incomplete">Incomplete</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      )}

      {/* Przestrzenie */}
      <div className="flex-1 overflow-auto py-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3">
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-xs font-medium text-muted-foreground">SPACES</p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setShowManageSpacesDialog(true)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setShowCreateSpaceDialog(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1 px-2">
          {filteredAndSortedSpaces.map((space) => (
            <Button
              key={space.id}
              variant="ghost"
              className={cn(
                "w-full justify-start transition-all duration-300",
                collapsed ? "px-0 justify-center" : "",
                activeSpace === space.id ? "bg-primary/10 dark:bg-primary/20" : "",
                "hover:bg-primary/5 dark:hover:bg-primary/15",
              )}
              onClick={() => handleSpaceClick(space.id)}
            >
              <motion.div
                className={cn("flex items-center gap-3", space.color)}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                {renderIcon(space.icon)}
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span>{space.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {space.count}
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            </Button>
          ))}
        </div>
      </div>

      {/* Stopka */}
      <div className="p-4 mt-auto">
        <Separator className="mb-4 opacity-50" />
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={cn("w-full justify-start", collapsed ? "px-0 justify-center" : "")}
            onClick={handleStatisticsClick}
          >
            <BarChart2 className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Statistics</span>}
          </Button>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", collapsed ? "px-0 justify-center" : "")}
                onClick={handleSettingsClick}
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Settings</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card vision-card max-w-3xl">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>Customize your TaskFlow experience</DialogDescription>
              </DialogHeader>

              <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                <TabsList className="glass mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Profile Information</h3>

                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={userAvatar || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {username ? username[0]?.toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>

                      <Button variant="outline" className="glass gap-2" onClick={triggerFileInput}>
                        <Upload className="h-4 w-4" />
                        Change Avatar
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" value={username} className="glass-input vision-input" readOnly />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Theme</h3>

                    <div className="space-y-2">
                      <Label htmlFor="theme">Select Theme</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger id="theme" className="glass-input vision-input">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label>Background Image</Label>
                      <p className="text-sm text-muted-foreground mb-2">Change the app background</p>
                      <BackgroundSelector />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Settings</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Enable Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications for tasks and events</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
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
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSettings} className="vision-button">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className={cn("w-full justify-start text-red-500", collapsed ? "px-0 justify-center" : "")}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Exit</span>}
          </Button>
        </div>
      </div>

      {/* Dialog wylogowania */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="glass-card vision-card">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Logout</DialogTitle>
            <DialogDescription>
              Warning: All your data will be deleted from this device. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Logout and Delete Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog tworzenia przestrzeni */}
      <CreateSpaceDialog
        open={showCreateSpaceDialog}
        onOpenChange={setShowCreateSpaceDialog}
        onCreateSpace={handleCreateSpace}
      />

      {/* Dialog zarządzania przestrzeniami */}
      <Dialog open={showManageSpacesDialog} onOpenChange={setShowManageSpacesDialog}>
        <DialogContent className="glass-card vision-card">
          <DialogHeader>
            <DialogTitle>Manage Spaces</DialogTitle>
            <DialogDescription>Edit or delete your custom spaces</DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto space-y-2 py-2">
            {spaces.map((space) => (
              <div key={space.id} className="space-item">
                {editingSpaceId === space.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", space.color)}>
                      {renderIcon(space.icon)}
                    </div>
                    <Input
                      value={editSpaceName}
                      onChange={(e) => setEditSpaceName(e.target.value)}
                      className="glass-input vision-input flex-1"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={saveSpaceEdit} disabled={editSpaceName.trim() === ""}>
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelSpaceEdit}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", space.color)}>
                        {renderIcon(space.icon)}
                      </div>
                      <span className="font-medium">{space.name}</span>
                      {!space.isCustom && (
                        <Badge variant="outline" className="ml-1">
                          Default
                        </Badge>
                      )}
                    </div>

                    <div className="space-actions flex items-center">
                      {space.isCustom && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleEditSpace(space.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteSpace(space.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageSpacesDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowManageSpacesDialog(false)
                setShowCreateSpaceDialog(true)
              }}
              className="vision-button"
            >
              Create New Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

