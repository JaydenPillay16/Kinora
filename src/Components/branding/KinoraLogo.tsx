
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
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          <path
            d="M12 8V40"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M35 10L15 25"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M20 26L36 39"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
          />
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
