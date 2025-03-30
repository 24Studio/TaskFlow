"use client"

import { useEffect } from "react"

export function BackgroundInitializer() {
  useEffect(() => {
    // Sprawdź, czy jest zapisane tło
    const savedBackground = localStorage.getItem("appBackground")
    if (savedBackground) {
      // Zastosuj tło
      if (savedBackground.startsWith("linear-gradient")) {
        document.body.style.backgroundImage = savedBackground
      } else {
        document.body.style.backgroundImage = `url(${savedBackground})`
      }
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center"
      document.body.style.backgroundAttachment = "fixed"

      // Dodaj klasę dla dostosowań stylów
      document.body.classList.add("has-bg-image")
    }

    // Nasłuchuj zmian motywu, aby dostosować klasę body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "class" &&
          document.body.classList.contains("dark") &&
          document.body.style.backgroundImage
        ) {
          document.body.classList.add("has-bg-image")
        }
      })
    })

    observer.observe(document.body, { attributes: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}

