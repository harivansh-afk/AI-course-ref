import React from 'react'
import { Card } from '../ui/card'

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend: {
    value: string
    label: string
  }
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">
          <span className="text-green-600">{trend.value}</span> {trend.label}
        </p>
      </div>
    </Card>
  )
}
