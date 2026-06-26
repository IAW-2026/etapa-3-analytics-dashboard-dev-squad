
import PaymentsAnalyticsClient from './PaymentsAnalyticsClient'
import { getPaymentsStats } from '@/lib/api' // ajustar al path real de tu lib

export default async function PaymentsPage() {
  let stats = null
  let error: string | null = null

  try {
    stats = await getPaymentsStats()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error al cargar estadísticas de pagos'
  }

  return <PaymentsAnalyticsClient initialStats={stats} initialError={error} />
}