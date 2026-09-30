import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react'
import { parseDateOnly, toDateOnly } from '../utils'
import { cn } from '../utils/cn'

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> & {
  label?: string
  error?: string
  mode?: 'date' | 'time' | 'datetime-local'
  value?: string
  minYear?: number
  maxYear?: number
}

const weekdayLabels = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'] as const

function monthGrid(anchor: Date): Date[] {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = (first.getDay() + 6) % 7
  const cellCount = Math.ceil((startPad + last.getDate()) / 7) * 7
  const days: Date[] = []
  for (let i = 0; i < cellCount; i += 1) {
    days.push(new Date(year, month, 1 - startPad + i))
  }
  return days
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(
    {
      className,
      label,
      error,
      id,
      mode = 'date',
      name,
      onChange,
      onBlur,
      disabled,
      required,
      defaultValue,
      value: valueProp,
      minYear,
      maxYear,
      ...props
    },
    ref,
  ) {
    const inputId = id ?? name
    const hiddenRef = useRef<HTMLInputElement>(null)
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        hiddenRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const initialIso =
      (typeof valueProp === 'string' ? valueProp : undefined) ??
      (typeof defaultValue === 'string' ? defaultValue : '') ??
      ''

    const minIso = minYear != null ? `${minYear}-01-01` : undefined
    const maxIso = maxYear != null ? `${maxYear}-12-31` : undefined

    const [selectedIso, setSelectedIso] = useState(initialIso)
    const [anchor, setAnchor] = useState(() =>
      initialIso ? parseDateOnly(initialIso) : new Date(),
    )

    useEffect(() => {
      if (valueProp !== undefined) {
        setSelectedIso(valueProp)
        if (valueProp) setAnchor(parseDateOnly(valueProp))
      }
    }, [valueProp])

    const emitChange = useCallback(
      (iso: string) => {
        onChange?.({
          target: { name: name ?? '', value: iso },
        } as ChangeEvent<HTMLInputElement>)
      },
      [name, onChange],
    )

    const selectIso = useCallback(
      (iso: string) => {
        setSelectedIso(iso)
        setAnchor(parseDateOnly(iso))
        emitChange(iso)
      },
      [emitChange],
    )

    const isDisabledDay = useCallback(
      (iso: string) => {
        if (minIso && iso < minIso) return true
        if (maxIso && iso > maxIso) return true
        return false
      },
      [minIso, maxIso],
    )

    const monthLabel = useMemo(
      () =>
        new Intl.DateTimeFormat('tr-TR', {
          month: 'long',
          year: 'numeric',
        }).format(anchor),
      [anchor],
    )

    const days = useMemo(() => monthGrid(anchor), [anchor])
    const viewMonth = anchor.getMonth()

    if (mode !== 'date') {
      return (
        <div className="flex w-full flex-col gap-1.5">
          {label ? (
            <label htmlFor={inputId} className="subheadline font-medium text-text">
              {label}
            </label>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={mode}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            defaultValue={defaultValue}
            className={cn(
              'min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-[17px] text-text',
              error && 'border-red-500',
              className,
            )}
            {...props}
          />
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )
    }

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {label ? (
          <span className="subheadline font-medium text-text">{label}</span>
        ) : null}
        <input
          type="hidden"
          ref={mergedRef}
          id={inputId}
          name={name}
          value={selectedIso}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          readOnly
          aria-hidden
          tabIndex={-1}
        />
        <div
          className={cn(
            'grouped-list overflow-hidden p-3',
            error && 'ring-1 ring-red-500',
            disabled && 'pointer-events-none opacity-40',
          )}
          role="group"
          aria-label={label ?? 'Tarih'}
        >
          <div className="mb-2 flex h-11 items-center justify-between px-1">
            <button
              type="button"
              className="min-h-11 min-w-11 px-2 text-[17px] text-accent active:opacity-70"
              disabled={disabled}
              onClick={() =>
                setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <p className="headline capitalize text-text">{monthLabel}</p>
            <button
              type="button"
              className="min-h-11 min-w-11 px-2 text-[17px] text-accent active:opacity-70"
              disabled={disabled}
              onClick={() =>
                setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {weekdayLabels.map((d) => (
              <div key={d} className="py-1 text-[12px] font-medium text-secondary">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const key = toDateOnly(day)
              const inMonth = day.getMonth() === viewMonth
              const selected = key === selectedIso
              const dayDisabled = isDisabledDay(key)
              return (
                <button
                  key={key}
                  type="button"
                  disabled={dayDisabled}
                  onClick={() => selectIso(key)}
                  className={cn(
                    'mx-auto flex size-11 items-center justify-center rounded-full text-[17px] active:opacity-70',
                    !inMonth && 'text-tertiary',
                    dayDisabled && 'cursor-not-allowed opacity-30',
                    selected && 'bg-accent font-semibold text-white',
                    !selected && inMonth && !dayDisabled && 'text-text',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
