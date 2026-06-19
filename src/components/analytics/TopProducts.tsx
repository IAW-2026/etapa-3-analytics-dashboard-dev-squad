import { Star, Package } from 'lucide-react'
import type { TopItem } from '@/lib/api'

interface Props {
  products: TopItem[]
}

export default function TopProducts({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          Top Productos
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos suficientes</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-blue-600" />
        Top Productos
      </h3>
      <div className="space-y-2">
        {products.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 py-1.5">
            <span
              className={`text-xs font-bold w-5 text-right shrink-0 ${
                i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{p.nombre}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    {p.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {p.totalReviews}
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
