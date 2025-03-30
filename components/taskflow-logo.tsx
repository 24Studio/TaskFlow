"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TaskflowLogoProps {
  className?: string
  variant?: "default" | "icon"
  animated?: boolean
}

export function TaskflowLogo({ className, variant = "default", animated = true }: TaskflowLogoProps) {
  if (variant === "icon") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <motion.div
          initial={animated ? { scale: 0.9, opacity: 0 } : false}
          animate={animated ? { scale: 1, opacity: 1 } : false}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path
              d="M9 11.5l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        initial={animated ? { scale: 0.9, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground"
        >
          <path
            d="M9 11.5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      <motion.div
        initial={animated ? { x: -10, opacity: 0 } : false}
        animate={animated ? { x: 0, opacity: 1 } : false}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-foreground font-semibold text-xl"
      >
        taskflow
      </motion.div>
    </div>
  )
}

