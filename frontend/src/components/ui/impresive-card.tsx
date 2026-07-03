"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ImpresiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dotSpacing?: number
  dotRadius?: number
  maxDotRadius?: number
  speed?: number
}

const ImpresiveCard = React.forwardRef<HTMLDivElement, ImpresiveCardProps>(
  (
    {
      className,
      children,
      dotSpacing = 24,
      dotRadius = 1,
      maxDotRadius = 5,
      speed = 0.5,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const dotsRef = React.useRef<{ x: number; y: number }[]>([])
    const waveRef = React.useRef({ x: 0, y: 0 })
    const targetRef = React.useRef({ x: 0, y: 0 })
    const rafRef = React.useRef<number>(0)

    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let width = 0
      let height = 0
      let pageVisible = true

      const pickTarget = () => {
        targetRef.current.x = Math.random() * (width + 200) - 100
        targetRef.current.y = Math.random() * (height + 200) - 100
      }

      const buildDots = () => {
        const d: { x: number; y: number }[] = []
        const ox = dotSpacing / 2
        const oy = dotSpacing / 2
        for (let y = oy; y < height; y += dotSpacing) {
          for (let x = ox; x < width; x += dotSpacing) {
            d.push({ x, y })
          }
        }
        dotsRef.current = d
      }

      const resize = () => {
        const rect = container.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        width = rect.width
        height = rect.height
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        buildDots()
        if (waveRef.current.x === 0 && waveRef.current.y === 0) {
          waveRef.current.x = width / 2
          waveRef.current.y = height / 2
        }
        pickTarget()
      }

      const sizeRange = maxDotRadius - dotRadius

      const draw = () => {
        const wx = waveRef.current.x
        const wy = waveRef.current.y

        ctx.clearRect(0, 0, width, height)

        const dots = dotsRef.current
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i]
          const dx = d.x - wx
          const dy = d.y - wy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const influence = Math.exp(-dist * 0.01)

          const size = dotRadius + influence * sizeRange
          const r = Math.round(120 - influence * 37)
          const g = Math.round(120 - influence * 22)
          const b = Math.round(120 + influence * 111)
          const alpha = 0.2 + influence * 0.8

          ctx.beginPath()
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
          ctx.arc(d.x, d.y, Math.max(size, 0.3), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const animate = () => {
        if (!pageVisible) {
          rafRef.current = requestAnimationFrame(animate)
          return
        }

        const tdx = targetRef.current.x - waveRef.current.x
        const tdy = targetRef.current.y - waveRef.current.y
        const distToTarget = Math.sqrt(tdx * tdx + tdy * tdy)

        if (distToTarget < 20) {
          pickTarget()
        }

        const dirX = tdx / distToTarget
        const dirY = tdy / distToTarget
        const step = speed * 3
        const jitter = step * 0.5
        waveRef.current.x += dirX * step + (Math.random() - 0.5) * jitter
        waveRef.current.y += dirY * step + (Math.random() - 0.5) * jitter

        draw()
        rafRef.current = requestAnimationFrame(animate)
      }

      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)

      const onVisibilityChange = () => {
        pageVisible = !document.hidden
      }
      document.addEventListener("visibilitychange", onVisibilityChange)

      rafRef.current = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(rafRef.current)
        resizeObserver.disconnect()
        document.removeEventListener("visibilitychange", onVisibilityChange)
      }
    }, [dotSpacing, dotRadius, maxDotRadius, speed])

    return (
      <div
        ref={mergedRef}
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow",
          className,
        )}
        {...props}
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        />
        <div className="relative z-10">{children}</div>
      </div>
    )
  },
)
ImpresiveCard.displayName = "ImpresiveCard"

export { ImpresiveCard }
