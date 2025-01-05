import { ERROR_MESSAGES, VALIDATION_RULES } from '../constants'
import type { SystemLog, AppEvent, WithTimestamp, SyncEvent, MessageEvent } from '../types'

// Error Handling
export const createError = (code: keyof typeof ERROR_MESSAGES, details?: string) => {
  const baseMessage = ERROR_MESSAGES[code] || 'An unknown error occurred'
  return new Error(`${baseMessage}${details ? `: ${details}` : ''}`)
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('network') ||
    error.message.includes('internet') ||
    error.message.includes('offline')
  )
}

// Date & Time Formatting
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return `${formatDate(d)} ${formatTime(d)}`
}

export const getRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return formatDate(date)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

// String Manipulation
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Validation
export const validateName = (name: string): boolean => {
  return (
    name.length >= VALIDATION_RULES.NAME.MIN_LENGTH &&
    name.length <= VALIDATION_RULES.NAME.MAX_LENGTH &&
    VALIDATION_RULES.NAME.PATTERN.test(name)
  )
}

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email)
}

export const validatePassword = (password: string): boolean => {
  const hasLength = password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH
  const hasUpper = VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE ? /[A-Z]/.test(password) : true
  const hasLower = VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE ? /[a-z]/.test(password) : true
  const hasNumber = VALIDATION_RULES.PASSWORD.REQUIRE_NUMBER ? /\d/.test(password) : true
  const hasSpecial = VALIDATION_RULES.PASSWORD.REQUIRE_SPECIAL ? /[!@#$%^&*]/.test(password) : true

  return hasLength && hasUpper && hasLower && hasNumber && hasSpecial
}

// Array Manipulation
export const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
  const seen = new Set()
  return arr.filter(item => {
    const k = item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export const sortBy = <T>(arr: T[], key: keyof T, descending = false): T[] => {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return descending ? 1 : -1
    if (a[key] > b[key]) return descending ? -1 : 1
    return 0
  })
}

// Object Manipulation
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key]
  })
  return result
}

// System Logs
export const createSystemLog = (
  message: string,
  type: SystemLog['type'] = 'info',
  metadata?: Record<string, any>
): SystemLog => ({
  timestamp: new Date().toISOString(),
  message,
  type,
  metadata
})

// Event Handling
export const createEvent = (
  type: AppEvent['type'],
  status: 'start' | 'complete' | 'error' | 'sent' | 'received',
  details?: { messageId?: string; error?: string }
): AppEvent => {
  const baseEvent = {
    timestamp: new Date().toISOString(),
    error: details?.error
  }

  if (type === 'sync') {
    return {
      ...baseEvent,
      type: 'sync',
      status: status as SyncEvent['status']
    }
  } else {
    if (!details?.messageId) {
      throw new Error('messageId is required for message events')
    }
    return {
      ...baseEvent,
      type: 'message',
      status: status as MessageEvent['status'],
      messageId: details.messageId
    }
  }
}

// Data Transformation
export const addTimestamps = <T extends object>(obj: T): T & WithTimestamp => {
  const now = new Date().toISOString()
  return {
    ...obj,
    createdAt: now,
    updatedAt: now
  }
}

export const updateTimestamp = <T extends WithTimestamp>(obj: T): T => ({
  ...obj,
  updatedAt: new Date().toISOString()
})

// File Handling
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Color Manipulation
export const hexToRGBA = (hex: string, alpha = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const lighten = (hex: string, amount: number): string => {
  const num = parseInt(hex.slice(1), 16)
  const amt = Math.round(2.55 * amount)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return `#${(0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1)}`
}

export const darken = (hex: string, amount: number): string => {
  return lighten(hex, -amount)
}
