import { IconTile } from './IconTile'
import {
  collectionColorCatalog,
  collectionIconCatalog,
  customCollectionAppearance,
  type CollectionColorKey,
  type CollectionIconKey,
} from '../utils/customCollectionTheme'
import { cn } from '../utils/cn'

type CustomCollectionAppearancePickerProps = {
  iconKey: CollectionIconKey
  colorKey: CollectionColorKey
  onIconChange: (key: CollectionIconKey) => void
  onColorChange: (key: CollectionColorKey) => void
}

export function CustomCollectionAppearancePicker({
  iconKey,
  colorKey,
  onIconChange,
  onColorChange,
}: CustomCollectionAppearancePickerProps) {
  const preview = customCollectionAppearance(iconKey, colorKey)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <IconTile {...preview} size="lg" />
        <p className="subheadline text-secondary">Önizleme</p>
      </div>

      <div>
        <p className="section-header mb-2 px-0.5">İkon</p>
        <div className="grid grid-cols-4 gap-2">
          {collectionIconCatalog.map((item) => {
            const active = item.key === iconKey
            const tone = customCollectionAppearance(item.key, colorKey)
            return (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                onClick={() => onIconChange(item.key)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-[10px] px-1 py-2 active:opacity-70',
                  active && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
                )}
              >
                <IconTile {...tone} size="sm" />
                <span className="caption-text max-w-full truncate text-secondary">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="section-header mb-2 px-0.5">Renk</p>
        <div className="flex flex-wrap gap-3">
          {collectionColorCatalog.map((item) => {
            const active = item.key === colorKey
            return (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                onClick={() => onColorChange(item.key)}
                className={cn(
                  'size-9 rounded-full border-2 transition-transform active:scale-95',
                  active ? 'border-accent scale-105' : 'border-transparent',
                )}
                style={{ backgroundColor: item.swatch }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
