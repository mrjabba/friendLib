'use client'

import { useState } from 'react'

interface ReturnButtonProps {
  onReturn: (borrowId: string) => Promise<{ success: boolean; error?: string }>
  borrowId: string
  disabled?: boolean
}

export default function ReturnButton({ onReturn, borrowId, disabled = false }: ReturnButtonProps) {
  const [isReturning, setIsReturning] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReturn = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsReturning(true)
    setError(null)

    const result = await onReturn(borrowId)

    if (!result.success) {
      setError(result.error || 'Failed to mark book as returned')
      setIsReturning(false)
      setShowConfirm(false)
      return
    }

    setShowConfirm(false)
    setIsReturning(false)
    window.location.reload()
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Mark book as returned?</span>
        <button
          onClick={handleReturn}
          disabled={isReturning}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isReturning ? 'Returning...' : 'Yes, Returned'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleReturn}
        disabled={disabled || isReturning}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isReturning ? 'Returning...' : 'Mark as Returned'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
