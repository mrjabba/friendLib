'use client'

interface GenrePillProps {
  id: number
  value: string
  removable?: boolean
  onRemove?: (id: number) => void
}

export default function GenrePill({ id, value, removable, onRemove }: GenrePillProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition cursor-default">
      {value}
      {removable && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-300 rounded-full p-0.5"
          aria-label={`Remove ${value}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
