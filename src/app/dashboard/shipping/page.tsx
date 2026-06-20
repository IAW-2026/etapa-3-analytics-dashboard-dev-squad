import { Suspense } from "react"
import ShippingAnalyticsClient from "./ShippingAnalyticsClient"
import type { ShippingSummary } from "../../../components/shipments/types"
import DashboardLoading from "../loading"

// Fetch server-side: la SHIPPING_API_KEY nunca llega al navegador.
// Acepta un mes opcional (formato "YYYY-MM") que se reenvía tal cual al backend.
async function getShippingSummary(month?: string): Promise<ShippingSummary | null> {
  try {
    const url = new URL(`${process.env.SHIPPING_APP_URL}/api/analytics`)
    if (month) url.searchParams.set("month", month)

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": process.env.SHIPPING_API_KEY! },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch (err) {
    console.error("Error fetching shipping summary:", err)
    return null
  }
}

async function ShippingAnalyticsContent({ month }: { month?: string }) {
  const data = await getShippingSummary(month)

  if (!data) {
    return (
      <div className="m-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
        No se pudieron cargar las métricas de envíos
      </div>
    )
  }

  return <ShippingAnalyticsClient data={data} selectedMonth={month ?? null} />
}

export default async function ShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams

  return (
    <Suspense key={month ?? "all"} fallback={<DashboardLoading />}>
      <ShippingAnalyticsContent month={month} />
    </Suspense>
  )
}