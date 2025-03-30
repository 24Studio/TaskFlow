"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, RefreshCw, ImageIcon, Link } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Domyślne tła
const DEFAULT_BACKGROUNDS = [
  {
    name: "Gradient 1",
    url: "linear-gradient(to right, #8e2de2, #4a00e0)",
    type: "gradient",
  },
  {
    name: "Gradient 2",
    url: "linear-gradient(to right, #ff416c, #ff4b2b)",
    type: "gradient",
  },
  {
    name: "Gradient 3",
    url: "linear-gradient(to right, #00b09b, #96c93d)",
    type: "gradient",
  },
  {
    name: "Gradient 4",
    url: "linear-gradient(to right, #4facfe, #00f2fe)",
    type: "gradient",
  },
  {
    name: "Mountains",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop",
    type: "image",
  },
  {
    name: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1470&auto=format&fit=crop",
    type: "image",
  },
  {
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1473&auto=format&fit=crop",
    type: "image",
  },
  {
    name: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1444&auto=format&fit=crop",
    type: "image",
  },
]

export function BackgroundSelector() {
  const [activeTab, setActiveTab] = useState("default")
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Załaduj aktualne tło przy montowaniu
  useEffect(() => {
    const savedBackground = localStorage.getItem("appBackground")
    if (savedBackground) {
      setSelectedBackground(savedBackground)

      // Określ, która zakładka powinna być aktywna na podstawie zapisanego tła
      if (DEFAULT_BACKGROUNDS.some((bg) => bg.url === savedBackground)) {
        setActiveTab("default")
      } else if (savedBackground.startsWith("data:")) {
        setActiveTab("upload")
        setUploadedImage(savedBackground)
      } else {
        setActiveTab("url")
        setCustomUrl(savedBackground)
      }
    }
  }, [])

  // Zastosuj tło, gdy zostanie wybrane
  const applyBackground = (backgroundUrl: string) => {
    try {
      // Zastosuj bezpośrednio do body
      if (backgroundUrl.startsWith("linear-gradient")) {
        document.body.style.backgroundImage = backgroundUrl
      } else {
        document.body.style.backgroundImage = `url(${backgroundUrl})`
      }
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center"
      document.body.style.backgroundAttachment = "fixed"
      document.body.classList.add("has-bg-image")

      // Zapisz w localStorage
      localStorage.setItem("appBackground", backgroundUrl)

      // Ustaw jako wybrane tło
      setSelectedBackground(backgroundUrl)

      // Pokaż powiadomienie o sukcesie
      toast({
        title: "Background Updated",
        description: "Your background has been updated successfully",
      })
    } catch (error) {
      console.error("Error applying background:", error)
      toast({
        title: "Error",
        description: "Failed to apply background. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectBackground = (url: string) => {
    applyBackground(url)
  }

  const handleCustomUrlSubmit = () => {
    if (!customUrl) {
      setError("Please enter a valid URL")
      return
    }

    setError(null)
    applyBackground(customUrl)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result as string
        setUploadedImage(imageDataUrl)
        applyBackground(imageDataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const resetBackground = () => {
    document.body.style.backgroundImage = "none"
    document.body.classList.remove("has-bg-image")
    localStorage.removeItem("appBackground")
    setSelectedBackground(null)
    setCustomUrl("")
    setUploadedImage(null)

    toast({
      title: "Background Reset",
      description: "Background has been reset to default",
    })
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="default" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Default</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span>URL</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEFAULT_BACKGROUNDS.map((bg, index) => (
              <div
                key={index}
                className={`
                  relative aspect-video rounded-md overflow-hidden cursor-pointer
                  ${selectedBackground === bg.url ? "ring-2 ring-primary ring-offset-2" : ""}
                `}
                onClick={() => handleSelectBackground(bg.url)}
                style={{
                  background: bg.type === "gradient" ? bg.url : `url(${bg.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 flex items-end p-2">
                  <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">{bg.name}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCustomUrlSubmit}>Apply</Button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {selectedBackground && activeTab === "url" && (
              <div className="mt-4">
                <div
                  className="aspect-video rounded-md overflow-hidden"
                  style={{
                    background: `url(${selectedBackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="flex gap-2">
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileUpload} className="flex-1" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {uploadedImage && (
              <div className="mt-4">
                <div
                  className="aspect-video rounded-md overflow-hidden"
                  style={{
                    background: `url(${uploadedImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={resetBackground} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset to Default
        </Button>
      </div>
    </div>
  )
}

