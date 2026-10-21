
import type { CSSProperties } from 'react'

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
        className="grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#073b30] shadow-sm"
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
            <linearGradient id="kinora-mint" x1="8" y1="8" x2="40" y2="40">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          <path
            d="M12 8V40"
            stroke="url(#kinora-mint)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M35 10L15 25"
            stroke="url(#kinora-mint)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M20 26L36 39"
            stroke="url(#kinora-mint)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="min-w-0">
          <span className="block text-xl font-bold tracking-tight text-[var(--app-text)]">
            Kinora
          </span>

          {showTagline && (
            <span className="block text-xs text-[var(--app-text-muted)]">
              Stay close to what matters.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
