import { Suspense } from 'react'

import DashboardLoading from '../loading'
import SellerAnalyticsClient, {
  type Summary,
} from './SellerAnalyticsClient'

const SELLER_API = process.env.NEXT_PUBLIC_SELLER_APP_URL
const API_KEY    = process.env.NEXT_PUBLIC_SUPERADMIN_KEY

async function getSellerSummary(): Promise<Summary | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SELLER_APP_URL}/api/admin/summary`,
      {
        headers: {
          'X-Superadmin-Key': process.env.NEXT_PUBLIC_SUPERADMIN_KEY!,
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching seller summary:', error)
    return null
  }
}

async function SellerAnalyticsContent() {
  const data = await getSellerSummary()

  if (!data) {
    return (
      <div className="m-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        No se pudieron cargar las métricas
      </div>
    )
  }

  return <SellerAnalyticsClient data={data} />
}

export default function SellerPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SellerAnalyticsContent />
    </Suspense>
  )
}