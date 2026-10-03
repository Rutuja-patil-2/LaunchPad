export const LAUNCHPAD_COLORS = {
  white: '#ffffff',
  yellow: '#fff275',
  brightYellow: '#f9e830',
  purple: '#3A0CA3',
}

const SIZE_CLASS = {
  sm: { icon: 'h-7', iconWidth: '2.3rem', word: 'h-4' },
  md: { icon: 'h-9', iconWidth: '3rem', word: 'h-5' },
  lg: { icon: 'h-11', iconWidth: '3.7rem', word: 'h-7' },
  xl: { icon: 'h-14', iconWidth: '4.6rem', word: 'h-8' },
}

const ICON_FILTER =
  'hue-rotate(68deg) saturate(1.35)'

export function LaunchpadLogo({
  size = 'md',
  className = '',
  alt = 'Launchpad',
  showWordmark = true,
}) {
  const cfg = SIZE_CLASS[size] ?? SIZE_CLASS.md

  const icon = (
    <span
      aria-hidden="true"
      className={`${cfg.icon} aspect-[1.31] shrink-0 bg-no-repeat`}
      style={{
        width: cfg.iconWidth,
        backgroundImage: 'url(/launchpad-logo.png)',
        backgroundSize: '188% auto',
        backgroundPosition: '50% 33%',
        filter: ICON_FILTER,
        mixBlendMode: 'multiply',
      }}
    />
  )

  if (!showWordmark) {
    return (
      <div className={className} role="img" aria-label={alt}>
        {icon}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      role="img"
      aria-label={alt}
    >
      {icon}
      <img
        src="/launchpad-icon.png"
        alt=""
        aria-hidden="true"
        className={`${cfg.word} w-auto shrink-0 object-contain`}
      />
    </div>
  )
}
