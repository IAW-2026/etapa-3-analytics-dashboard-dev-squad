'use client'

export function PageSizeSelector({ limit }: { limit: number }) {
  return (
    <select
      className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)]"
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('limit', e.target.value)
        url.searchParams.set('page', '1')
        window.location.href = url.toString()
      }}
      value={limit}
    >
      {[5, 10, 20, 50].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  )
}
