import { create } from "zustand"
import type { Notification } from "@/components/notifications"

interface NotificationState {
  notifications: Notification[]
  notificationsEnabled: boolean
  soundEnabled: boolean
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
}

// Inicjalizacja z wartościami domyślnymi
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  notificationsEnabled: true,
  soundEnabled: true,

  addNotification: (notification) => {
    // Sprawdź, czy powiadomienia są włączone
    if (!get().notificationsEnabled) return

    // Odtwórz dźwięk, jeśli jest włączony
    if (get().soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.type = "sine"
        oscillator.frequency.value = 800
        gainNode.gain.value = 0.1

        oscillator.start()
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5)

        setTimeout(() => {
          oscillator.stop()
        }, 500)
      } catch (e) {
        console.error("Error playing notification sound:", e)
      }
    }

    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),

  markAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),

  setNotificationsEnabled: (enabled: boolean) => {
    // Zapisz ustawienie w localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("notificationsEnabled", String(enabled))
    }
    set({ notificationsEnabled: enabled })
  },

  setSoundEnabled: (enabled: boolean) => {
    // Zapisz ustawienie w localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEnabled", String(enabled))
    }
    set({ soundEnabled: enabled })
  },
}))

// Załaduj ustawienia z localStorage przy inicjalizacji
if (typeof window !== "undefined") {
  const notificationsEnabled = localStorage.getItem("notificationsEnabled")
  const soundEnabled = localStorage.getItem("soundEnabled")

  if (notificationsEnabled !== null) {
    useNotificationStore.getState().setNotificationsEnabled(notificationsEnabled === "true")
  }

  if (soundEnabled !== null) {
    useNotificationStore.getState().setSoundEnabled(soundEnabled === "true")
  }
}

