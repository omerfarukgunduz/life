const tones = [
  { bg: '#E7EEF8', fg: '#1E3A5F' },
  { bg: '#F3EDE4', fg: '#5C4632' },
  { bg: '#E8F0EA', fg: '#234033' },
  { bg: '#F6E8EA', fg: '#5C2E36' },
  { bg: '#EEEAF6', fg: '#3D315C' },
]

function toneFor(title: string) {
  let hash = 0
  for (const char of title) hash = (hash + char.charCodeAt(0)) % tones.length
  return tones[hash] ?? { bg: '#E7EEF8', fg: '#1E3A5F' }
}

export function BookCover({ title, author }: { title: string; author: string }) {
  const tone = toneFor(title)
  return (
    <span
      className="flex h-[68px] w-[46px] shrink-0 flex-col justify-end rounded-[8px] p-1.5"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
      aria-hidden
    >
      <span className="line-clamp-3 text-[8px] font-semibold leading-tight tracking-tight">
        {title}
      </span>
      <span className="mt-1 truncate text-[7px] opacity-70">{author}</span>
    </span>
  )
}
