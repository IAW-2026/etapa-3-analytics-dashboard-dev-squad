import { Star, Store } from 'lucide-react'
import type { TopItem } from '@/lib/api'

interface Props {
  sellers: TopItem[]
}

export default function TopSellers({ sellers }: Props) {
  if (sellers.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          Top Vendedores
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos suficientes</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <Store className="w-4 h-4 text-emerald-600" />
        Top Vendedores
      </h3>
      <div className="space-y-2">
        {sellers.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 py-1.5">
            <span
              className={`text-xs font-bold w-5 text-right shrink-0 ${
                i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{s.nombre}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    {s.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {s.totalReviews}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
