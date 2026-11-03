
import { useId, type CSSProperties } from 'react'

interface KinoraLogoProps {
  showWordmark?: boolean
  showTagline?: boolean
  size?: number
  className?: string
}

export default function KinoraLogo({
  showWordmark = true,
  showTagline = false,
  size = 44,
  className = '',
}: KinoraLogoProps) {
  const gradientId = `kinora-mint-${useId().replace(/:/g, '')}`
  const style = {
    '--logo-size': `${size}px`,
  } as CSSProperties

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      style={style}
      aria-label="Kinora"
    >
      <div
        className="kinora-mark grid shrink-0 place-items-center overflow-hidden rounded-[17px] shadow-lg shadow-emerald-950/10"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          width={size * 0.7}
          height={size * 0.7}
          fill="none"
          role="img"
          aria-label="Kinora symbol"
        >
          <defs>
            <linearGradient id={gradientId} x1="8" y1="8" x2="40" y2="40">
              <stop offset="0%" stopColor="var(--kinora-mark-start)" />
              <stop offset="100%" stopColor="var(--kinora-mark-end)" />
            </linearGradient>
          </defs>

          <path d="M24 23C20 17 14 14 9 17 2 21 5 30 11 35l10 8-1-7" stroke={`url(#${gradientId})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 23c4-6 10-9 15-6 7 4 4 13-2 18l-10 8 1-7" stroke={`url(#${gradientId})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {showWordmark && (
        <div className="min-w-0">
          <span className="block text-[21px] font-bold tracking-[-0.04em] text-[var(--app-text)]">
            kinora<span className="text-[var(--app-accent)]">.</span>
          </span>

          {showTagline && (
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
              Stay close to what matters
            </span>
          )}
        </div>
      )}
    </div>
  )
}
