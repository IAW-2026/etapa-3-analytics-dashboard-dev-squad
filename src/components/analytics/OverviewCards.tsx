import { MessageSquare, TrendingUp, Star, Calendar, Medal } from 'lucide-react'
import StatCard from './StatCard'
import type { HomeStats } from '@/lib/api'

interface Props {
  stats: HomeStats
}

export default function OverviewCards({ stats }: Props) {
  const topProduct = stats.topProduct ?? stats.topReviewed
  const topProductLabel = stats.topProduct ? 'Mejor producto' : 'Más reseñado'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Reseñas totales"
        value={stats.totalReviews.toLocaleString()}
        icon={<MessageSquare className="w-5 h-5" />}
      />
      <StatCard
        label="Reseñas este año"
        value={stats.reviewsThisYear.toLocaleString()}
        icon={<Calendar className="w-5 h-5" />}
        trend={{
          value: `${((stats.reviewsThisYear / Math.max(stats.totalReviews, 1)) * 100).toFixed(0)}% del total`,
          positive: true,
        }}
      />
      <StatCard
        label={topProductLabel}
        value={topProduct?.averageRating.toFixed(1) ?? '—'}
        icon={stats.topProduct ? <Star className="w-5 h-5" /> : <Medal className="w-5 h-5" />}
        trend={topProduct ? { value: topProduct.nombre, positive: true } : undefined}
      />
      <StatCard
        label="Mejor vendedor"
        value={stats.topSeller?.averageRating.toFixed(1) ?? '—'}
        icon={<TrendingUp className="w-5 h-5" />}
        trend={stats.topSeller ? { value: stats.topSeller.nombre, positive: true } : undefined}
      />
    </div>
  )
}
