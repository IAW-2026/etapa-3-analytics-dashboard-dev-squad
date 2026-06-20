export interface ShippingSummary {
  kpis: {
    totalShipments: number
    activeShipments: number
    onTimeRate: number
    avgDeliveryDays: number
    shippingRevenue: number
  }
  funnel: { status: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
  monthlyTrend: { month: string; created: number; delivered: number }[]
  carrierComparison: {
    carrier: string
    count: number
    avgDeliveryDays: number
    onTimeRate: number
  }[]
  stageTimes: { stage: string; avgDays: number }[]
  discounts: {
    avgShippingCost: number
    discountUsageRate: number
  }
  staleShipments: {
    orderId: string
    status: string
    daysSinceUpdate: number
  }[]
  topDestinations: {
    name: string
    count: number
  }[]
}