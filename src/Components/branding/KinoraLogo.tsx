
import { type CSSProperties } from 'react'

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
        className="kinora-mark grid shrink-0 place-items-center overflow-hidden rounded-[10px]"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          width={size * 0.7}
          height={size * 0.7}
          fill="none"
          className="text-white"
          role="img"
          aria-label="Kinora symbol"
        >
          <path d="M24 39s-15-8.4-15-19a8 8 0 0 1 15-3.8A8 8 0 0 1 39 20c0 10.6-15 19-15 19Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {showWordmark && (
        <div className="min-w-0">
          <span className="block text-[18px] font-semibold tracking-[-0.02em] text-[var(--app-text)]">
            Kinora
          </span>

          {showTagline && (
            <span className="mt-1 block text-[11px] font-medium text-[var(--app-text-muted)]">
              Stay close to what matters
            </span>
          )}
        </div>
      )}
    </div>
  )
}
