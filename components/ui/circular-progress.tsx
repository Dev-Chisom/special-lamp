"use client"

interface CircularProgressProps {
  value: number
  size?: "sm" | "md" | "lg" | "xl"
  strokeWidth?: number
  className?: string
}

export function CircularProgress({ value, size = "md", strokeWidth, className = "" }: CircularProgressProps) {
  const sizes = {
    sm: { width: 64, height: 64, stroke: strokeWidth || 4 },
    md: { width: 160, height: 160, stroke: strokeWidth || 8 },
    lg: { width: 192, height: 192, stroke: strokeWidth || 10 },
    xl: { width: 240, height: 240, stroke: strokeWidth || 12 },
  }

  const { width, height, stroke } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={width} height={height} className={className} style={{ transform: "rotate(-90deg)" }}>
      {/* Background circle */}
      <circle cx={width / 2} cy={height / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      {/* Progress circle */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.5s ease-in-out",
        }}
      />
    </svg>
  )
}
