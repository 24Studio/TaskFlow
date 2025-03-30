"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Home,
  Star,
  Clock,
  Calendar,
  Users,
  Briefcase,
  Book,
  Music,
  Film,
  Coffee,
  Heart,
  Gift,
  Smile,
  Zap,
  Bookmark,
  Settings,
  Inbox,
  FileText,
  Image,
  ShoppingCart,
  Map,
  Headphones,
  Camera,
  Compass,
  Award,
  Truck,
  Umbrella,
  Cpu,
  Database,
  Folder,
  Globe,
  Key,
  Layers,
} from "lucide-react"

const ICONS = [
  { name: "Home", icon: Home },
  { name: "Star", icon: Star },
  { name: "Clock", icon: Clock },
  { name: "Calendar", icon: Calendar },
  { name: "Users", icon: Users },
  { name: "Briefcase", icon: Briefcase },
  { name: "Book", icon: Book },
  { name: "Music", icon: Music },
  { name: "Film", icon: Film },
  { name: "Coffee", icon: Coffee },
  { name: "Heart", icon: Heart },
  { name: "Gift", icon: Gift },
  { name: "Smile", icon: Smile },
  { name: "Zap", icon: Zap },
  { name: "Bookmark", icon: Bookmark },
  { name: "Settings", icon: Settings },
  { name: "Inbox", icon: Inbox },
  { name: "FileText", icon: FileText },
  { name: "Image", icon: Image },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Map", icon: Map },
  { name: "Headphones", icon: Headphones },
  { name: "Camera", icon: Camera },
  { name: "Compass", icon: Compass },
  { name: "Award", icon: Award },
  { name: "Truck", icon: Truck },
  { name: "Umbrella", icon: Umbrella },
  { name: "Cpu", icon: Cpu },
  { name: "Database", icon: Database },
  { name: "Folder", icon: Folder },
  { name: "Globe", icon: Globe },
  { name: "Key", icon: Key },
  { name: "Layers", icon: Layers },
]

const COLORS = [
  { name: "Blue", value: "text-blue-500", bg: "bg-blue-500" },
  { name: "Green", value: "text-green-500", bg: "bg-green-500" },
  { name: "Red", value: "text-red-500", bg: "bg-red-500" },
  { name: "Yellow", value: "text-yellow-500", bg: "bg-yellow-500" },
  { name: "Purple", value: "text-purple-500", bg: "bg-purple-500" },
  { name: "Pink", value: "text-pink-500", bg: "bg-pink-500" },
  { name: "Indigo", value: "text-indigo-500", bg: "bg-indigo-500" },
  { name: "Teal", value: "text-teal-500", bg: "bg-teal-500" },
  { name: "Orange", value: "text-orange-500", bg: "bg-orange-500" },
  { name: "Cyan", value: "text-cyan-500", bg: "bg-cyan-500" },
]

interface CreateSpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSpace: (space: { id: string; name: string; icon: string; color: string }) => void
}

export function CreateSpaceDialog({ open, onOpenChange, onCreateSpace }: CreateSpaceDialogProps) {
  const [spaceName, setSpaceName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("Home")
  const [selectedColor, setSelectedColor] = useState("text-blue-500")

  const handleCreateSpace = () => {
    if (spaceName.trim() === "") return

    const newSpace = {
      id: Date.now().toString(),
      name: spaceName,
      icon: selectedIcon,
      color: selectedColor,
    }

    onCreateSpace(newSpace)
    setSpaceName("")
    setSelectedIcon("Home")
    setSelectedColor("text-blue-500")
    onOpenChange(false)
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = ICONS.find((i) => i.name === iconName)?.icon || Home
    return <IconComponent size={18} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="space-name">Space Name</Label>
            <Input
              id="space-name"
              placeholder="Enter space name"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Icon</Label>
            <div className="space-icon-selector">
              {ICONS.map((icon) => (
                <div
                  key={icon.name}
                  className={`space-icon ${selectedIcon === icon.name ? "selected" : ""} ${selectedColor}`}
                  onClick={() => setSelectedIcon(icon.name)}
                >
                  <icon.icon size={18} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Color</Label>
            <div className="space-color-selector">
              {COLORS.map((color) => (
                <div
                  key={color.name}
                  className={`space-color ${selectedColor === color.value ? "selected" : ""} ${color.bg}`}
                  onClick={() => setSelectedColor(color.value)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 border rounded-md">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 mt-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${selectedColor}`}>
                {renderIcon(selectedIcon)}
              </div>
              <span className="font-medium">{spaceName || "New Space"}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSpace} disabled={!spaceName.trim()}>
            Create Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

