import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/supabase/types'

interface StatusPillProps {
  status: OrderStatus
  className?: string
}

const statusConfig = {
  RECEIVED: {
    label: 'Received',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  PACKED: {
    label: 'Packed',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status]
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
      'shadow-sm',
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}