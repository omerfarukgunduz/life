import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  Bookmark,
  BookOpen,
  Camera,
  Coffee,
  Dumbbell,
  Flag,
  FolderOpen,
  Gift,
  Heart,
  Lightbulb,
  Map,
  Music,
  Palette,
  Plane,
  Star,
} from 'lucide-react'
import type { IconStyle } from './collectionIcons'

export const DEFAULT_COLLECTION_ICON_KEY = 'folder'
export const DEFAULT_COLLECTION_COLOR_KEY = 'blue'

export type CollectionIconKey =
  | 'folder'
  | 'book'
  | 'star'
  | 'heart'
  | 'camera'
  | 'gift'
  | 'lightbulb'
  | 'flag'
  | 'music'
  | 'map'
  | 'plane'
  | 'coffee'
  | 'dumbbell'
  | 'palette'
  | 'bookmark'
  | 'archive'

export type CollectionColorKey =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'teal'
  | 'indigo'

export const collectionIconCatalog: {
  key: CollectionIconKey
  label: string
  icon: LucideIcon
}[] = [
  { key: 'folder', label: 'Klasör', icon: FolderOpen },
  { key: 'book', label: 'Kitap', icon: BookOpen },
  { key: 'star', label: 'Yıldız', icon: Star },
  { key: 'heart', label: 'Kalp', icon: Heart },
  { key: 'camera', label: 'Kamera', icon: Camera },
  { key: 'gift', label: 'Hediye', icon: Gift },
  { key: 'lightbulb', label: 'Fikir', icon: Lightbulb },
  { key: 'flag', label: 'Bayrak', icon: Flag },
  { key: 'music', label: 'Müzik', icon: Music },
  { key: 'map', label: 'Harita', icon: Map },
  { key: 'plane', label: 'Seyahat', icon: Plane },
  { key: 'coffee', label: 'Kahve', icon: Coffee },
  { key: 'dumbbell', label: 'Spor', icon: Dumbbell },
  { key: 'palette', label: 'Sanat', icon: Palette },
  { key: 'bookmark', label: 'Yer imi', icon: Bookmark },
  { key: 'archive', label: 'Arşiv', icon: Archive },
]

export const collectionColorCatalog: {
  key: CollectionColorKey
  label: string
  swatch: string
  bg: string
  fg: string
}[] = [
  { key: 'blue', label: 'Mavi', swatch: '#007AFF', bg: 'bg-soft-blue', fg: 'text-accent' },
  {
    key: 'purple',
    label: 'Mor',
    swatch: '#5856D6',
    bg: 'bg-soft-purple',
    fg: 'text-[#5856D6] dark:text-[#5E5CE6]',
  },
  { key: 'pink', label: 'Pembe', swatch: '#FF3B30', bg: 'bg-soft-pink', fg: 'text-danger' },
  {
    key: 'green',
    label: 'Yeşil',
    swatch: '#34C759',
    bg: 'bg-soft-green',
    fg: 'text-[#248A3D] dark:text-[#30D158]',
  },
  { key: 'yellow', label: 'Sarı', swatch: '#FF9500', bg: 'bg-soft-yellow', fg: 'text-warning' },
  {
    key: 'orange',
    label: 'Turuncu',
    swatch: '#FF9500',
    bg: 'bg-soft-yellow',
    fg: 'text-[#C93400] dark:text-[#FF9F0A]',
  },
  { key: 'red', label: 'Kırmızı', swatch: '#FF3B30', bg: 'bg-soft-pink', fg: 'text-danger' },
  {
    key: 'teal',
    label: 'Turkuaz',
    swatch: '#5AC8FA',
    bg: 'bg-soft-blue',
    fg: 'text-[#007AFF] dark:text-[#64D2FF]',
  },
  {
    key: 'indigo',
    label: 'İndigo',
    swatch: '#5856D6',
    bg: 'bg-soft-purple',
    fg: 'text-[#5856D6] dark:text-[#5E5CE6]',
  },
]

const iconMap = Object.fromEntries(
  collectionIconCatalog.map((item) => [item.key, item.icon]),
) as Record<CollectionIconKey, LucideIcon>

const colorMap = Object.fromEntries(
  collectionColorCatalog.map((item) => [item.key, item]),
) as Record<CollectionColorKey, (typeof collectionColorCatalog)[number]>

export function normalizeCollectionIconKey(value?: string | null): CollectionIconKey {
  if (value && value in iconMap) return value as CollectionIconKey
  return DEFAULT_COLLECTION_ICON_KEY
}

export function normalizeCollectionColorKey(value?: string | null): CollectionColorKey {
  if (value && value in colorMap) return value as CollectionColorKey
  return DEFAULT_COLLECTION_COLOR_KEY
}

export function customCollectionAppearance(
  iconKey?: string | null,
  colorKey?: string | null,
): IconStyle {
  const icon = iconMap[normalizeCollectionIconKey(iconKey)]
  const color = colorMap[normalizeCollectionColorKey(colorKey)]
  return { icon, bg: color.bg, fg: color.fg }
}
