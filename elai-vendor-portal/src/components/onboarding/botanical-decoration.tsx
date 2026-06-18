export function BotanicalDecoration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M90 0 Q100 140 70 240 Q45 340 85 480 Q105 560 75 640"
        stroke="#34421E"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
      <path
        d="M88 60 Q45 90 25 140"
        stroke="#34421E"
        strokeWidth="1.2"
        strokeOpacity="0.28"
      />
      <path
        d="M82 160 Q125 175 148 215"
        stroke="#34421E"
        strokeWidth="1.2"
        strokeOpacity="0.28"
      />
      <path
        d="M78 280 Q35 305 12 355"
        stroke="#34421E"
        strokeWidth="1.2"
        strokeOpacity="0.28"
      />
      <ellipse
        cx="18"
        cy="140"
        rx="20"
        ry="11"
        transform="rotate(-28 18 140)"
        fill="#34421E"
        fillOpacity="0.12"
      />
      <ellipse
        cx="152"
        cy="215"
        rx="20"
        ry="11"
        transform="rotate(18 152 215)"
        fill="#34421E"
        fillOpacity="0.12"
      />
      <ellipse
        cx="8"
        cy="355"
        rx="20"
        ry="11"
        transform="rotate(-22 8 355)"
        fill="#34421E"
        fillOpacity="0.12"
      />
    </svg>
  )
}
