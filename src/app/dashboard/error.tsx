'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-sm rounded-xl border border-red-200 dark:border-red-800 bg-[var(--background)] p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Error al cargar datos</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error.message || 'Ocurrió un error inesperado'}</p>
        <button
          onClick={reset}
          className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
