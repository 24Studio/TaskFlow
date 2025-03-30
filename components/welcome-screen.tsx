"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

interface WelcomeScreenProps {
  onComplete: (username: string) => void
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleComplete = () => {
    if (username.trim() === "") {
      setUsername("user")
    }
    localStorage.setItem("userAvatar", avatar)
    onComplete(username || "user")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card rounded-xl shadow-lg overflow-hidden"
      >
        <div className="h-48 bg-gradient-to-r from-blue-300 to-orange-200 dark:from-blue-600 dark:to-orange-400 relative overflow-hidden">
          {/* Background image removed */}
        </div>

        <div className="p-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-2"
          >
            Welcome, you&apos;re starting your first journey here!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center text-sm mb-6"
          >
            Add your avatar and pick a username for quick start.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 p-3 glass rounded-lg mb-4"
          >
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {username ? username[0]?.toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Your avatar</p>
              <p className="text-xs text-muted-foreground">PNG or JPG (max 10MB)</p>
            </div>

            <Button size="sm" variant="secondary" className="gap-1 glass" onClick={triggerFileInput}>
              <Upload size={14} /> Upload
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <label className="text-sm font-medium block mb-2">Display name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                className="pl-7 glass-input"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button className="w-full glass" size="lg" onClick={handleComplete}>
              Create an account
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

