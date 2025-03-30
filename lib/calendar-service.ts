// Calendar integration types
export type CalendarProvider = "google" | "outlook" | "apple" | "ical"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  startTime?: string
  endTime?: string
  isAllDay?: boolean
  location?: string
  url?: string
}

// Function to generate calendar URLs for different providers
export function generateCalendarUrl(event: CalendarEvent, provider: CalendarProvider): string {
  const title = encodeURIComponent(event.title)
  const description = encodeURIComponent(event.description || "")
  const location = encodeURIComponent(event.location || "")

  // Format dates for calendar URLs
  const formatDate = (date: Date, time?: string): string => {
    if (event.isAllDay) {
      // For all-day events, don't include time
      return date.toISOString().split("T")[0].replace(/-/g, "")
    }

    if (time) {
      // If time is provided, use it
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      return newDate.toISOString().replace(/-|:|\.\d+/g, "")
    }

    return date.toISOString().replace(/-|:|\.\d+/g, "")
  }

  let start: string
  let end: string

  if (event.isAllDay) {
    // For all-day events
    start = formatDate(event.startDate)

    // If no end date is provided, set it to the same day
    const endDate = event.endDate || new Date(event.startDate)

    // For all-day events in most calendar systems, the end date should be the next day
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    end = formatDate(nextDay)
  } else {
    // For time-specific events
    start = formatDate(event.startDate, event.startTime)

    // If no end date/time is provided, set it to 1 hour after start
    if (event.endDate && event.endTime) {
      end = formatDate(event.endDate, event.endTime)
    } else if (event.startTime) {
      // If only start time is provided, set end time to 1 hour later
      const [hours, minutes] = event.startTime.split(":").map(Number)
      const endDate = new Date(event.startDate)
      endDate.setHours(hours + 1, minutes, 0, 0)
      end = endDate.toISOString().replace(/-|:|\.\d+/g, "")
    } else {
      // Default: 1 hour duration
      end = formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000))
    }
  }

  switch (provider) {
    case "google":
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`

    case "outlook":
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${event.startDate.toISOString()}&enddt=${event.endDate?.toISOString() || new Date(event.startDate.getTime() + 60 * 60 * 1000).toISOString()}&body=${description}&location=${location}&allday=${event.isAllDay ? "true" : "false"}`

    case "apple":
      // Apple Calendar uses .ics files, but we can use iCloud web calendar as an alternative
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`

    case "ical":
      // Generate iCal format
      const icalContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${event.title}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        event.isAllDay ? "X-MICROSOFT-CDO-ALLDAYEVENT:TRUE" : "",
        event.description ? `DESCRIPTION:${event.description}` : "",
        event.location ? `LOCATION:${event.location}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
      ]
        .filter(Boolean)
        .join("\n")

      return `data:text/calendar;charset=utf-8,${encodeURIComponent(icalContent)}`
  }
}

// Function to add an event to the calendar
export function addToCalendar(event: CalendarEvent, provider: CalendarProvider): void {
  const url = generateCalendarUrl(event, provider)
  window.open(url, "_blank")
}

// Function to create a calendar event from a task
export function createCalendarEventFromTask(task: any): CalendarEvent {
  // Calculate end date based on task properties
  let endDate: Date | undefined

  if (task.dueDate) {
    if (task.isAllDay) {
      // For all-day tasks, end date is the same as start date
      endDate = new Date(task.dueDate)
    } else if (task.startTime && task.endTime) {
      // If we have specific start and end times
      endDate = new Date(task.dueDate)

      // Parse end time
      const [endHours, endMinutes] = task.endTime.split(":").map(Number)
      endDate.setHours(endHours, endMinutes, 0, 0)
    } else {
      // Default: 1 hour duration
      endDate = new Date(task.dueDate.getTime() + 60 * 60 * 1000)
    }
  }

  // Create the calendar event
  return {
    id: task.id,
    title: task.title,
    description: `Task from TaskFlow: ${task.title}`,
    startDate: task.dueDate || new Date(),
    endDate: endDate,
    startTime: task.startTime,
    endTime: task.endTime,
    isAllDay: task.isAllDay,
  }
}

