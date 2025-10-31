'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface KpiChipProps {
  title: string
  value: number
  className?: string
  delay?: number
}

export function KpiChip({ title, value, className, delay = 0 }: KpiChipProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const increment = value / 30
      const counter = setInterval(() => {
        start += increment
        if (start >= value) {
          setDisplayValue(value)
          clearInterval(counter)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 50)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className={cn(
      'gradient-border bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2 animate-count-up">
          {displayValue.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {title}
        </div>
      </div>
    </div>
  )
}