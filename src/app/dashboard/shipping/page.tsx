import { Suspense } from "react"
import ShippingAnalyticsClient from "./ShippingAnalyticsClient"
import type { ShippingSummary } from "../../../components/shipments/types"

function ShippingSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="h-7 w-56 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
      <div className="h-4 w-80 rounded bg-gray-100 dark:bg-gray-800 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border)] p-6 h-72" />
        <div className="rounded-xl border border-[var(--border)] p-6 h-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border)] p-6 h-56" />
        <div className="rounded-xl border border-[var(--border)] p-6 h-56" />
      </div>
    </div>
  )
}

// Fetch server-side: la INTERNAL_API_KEY nunca llega al navegador.
// Acepta un mes opcional (formato "YYYY-MM") que se reenvía tal cual al backend.
async function getShippingSummary(month?: string): Promise<ShippingSummary | null> {
  try {
    const url = new URL(`${process.env.SHIPPING_APP_URL}/api/analytics`)
    if (month) url.searchParams.set("month", month)

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": process.env.INTERNAL_API_KEY! },
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
    <Suspense key={month ?? "all"} fallback={<ShippingSkeleton />}>
      <ShippingAnalyticsContent month={month} />
    </Suspense>
  )
}