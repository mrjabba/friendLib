'use client'

import { useState } from 'react'

interface DeleteButtonProps {
  deleteAction: (id: number) => Promise<void>
  id: number
  label?: string
  variant?: 'primary' | 'danger'
}

export default function DeleteButton({
  deleteAction,
  id,
  label = 'Delete',
  variant = 'danger',
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }
    setIsDeleting(true)
    await deleteAction(id)
  }

  const baseClasses =
    variant === 'danger'
      ? 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
      : 'bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700'

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
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
    <button onClick={handleDelete} className={baseClasses}>
      {label}
    </button>
  )
}
