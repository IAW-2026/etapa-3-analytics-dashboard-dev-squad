'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  index?: number
  className?: string
}

export default function AnimatedCard({ children, index = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${visible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {children}
    </div>
  )
}
