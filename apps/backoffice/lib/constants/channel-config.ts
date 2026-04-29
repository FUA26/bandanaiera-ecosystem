/**
 * Channel Configuration
 *
 * Central configuration for all channel types including icons, colors, and labels.
 */

import {
  Globe,
  Link as LinkIcon,
  Box,
  Code,
  Smartphone,
  Megaphone,
} from "lucide-react"
import type { ChannelConfig, ChannelType } from "@/lib/types/apps"

/**
 * Channel type configuration mapping
 * Provides visual styling and metadata for each channel type
 */
export const CHANNEL_CONFIG: Record<ChannelType, ChannelConfig> = {
  WEB_FORM: {
    label: "Web Form",
    icon: Globe,
    color: "text-primary",
    bgLight: "bg-primary/10",
    bgDark: "dark:bg-primary/20",
  },
  PUBLIC_LINK: {
    label: "Public Link",
    icon: LinkIcon,
    color: "text-success",
    bgLight: "bg-success/10",
    bgDark: "dark:bg-success/20",
  },
  WIDGET: {
    label: "Widget",
    icon: Box,
    color: "text-secondary",
    bgLight: "bg-secondary/10",
    bgDark: "dark:bg-secondary/20",
  },
  INTEGRATED_APP: {
    label: "Integrated App",
    icon: Code,
    color: "text-warning",
    bgLight: "bg-warning/10",
    bgDark: "dark:bg-warning/20",
  },
  WHATSAPP: {
    label: "WhatsApp",
    icon: Smartphone,
    color: "text-success",
    bgLight: "bg-success/10",
    bgDark: "dark:bg-success/20",
  },
  TELEGRAM: {
    label: "Telegram",
    icon: Megaphone,
    color: "text-muted-foreground",
    bgLight: "bg-muted",
    bgDark: "dark:bg-muted/80",
  },
} as const

/** Channel type options for select dropdowns */
export const CHANNEL_TYPE_OPTIONS: Array<{
  value: ChannelType
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = Object.entries(CHANNEL_CONFIG).map(([key, config]) => ({
  value: key as ChannelType,
  label: config.label,
  icon: config.icon,
  color: config.color,
}))

/** Default channel type */
export const DEFAULT_CHANNEL_TYPE: ChannelType = "WEB_FORM"

/** Helper to get channel config */
export function getChannelConfig(type: ChannelType): ChannelConfig {
  return CHANNEL_CONFIG[type]
}

/** Helper to get channel config by type string (with fallback) */
export function getChannelConfigUnsafe(type: string): ChannelConfig | null {
  return CHANNEL_CONFIG[type as ChannelType] ?? null
}
