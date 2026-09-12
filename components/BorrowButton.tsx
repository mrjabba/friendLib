'use client'

import { useState } from 'react'

import { useTranslations } from '@/i18n/I18nProvider'

interface BorrowButtonProps {
  onBorrow: (bookId: number) => Promise<{ success: boolean; error?: string }>
  bookId: number
  disabled?: boolean
}

export default function BorrowButton({ onBorrow, bookId, disabled = false }: BorrowButtonProps) {
  const t = useTranslations()
  const [isBorrowing, setIsBorrowing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBorrow = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsBorrowing(true)
    setError(null)

    const result = await onBorrow(bookId)

    if (!result.success) {
      setError(result.error || t('borrow.failed'))
      setIsBorrowing(false)
      setShowConfirm(false)
      return
    }

    setShowConfirm(false)
    setIsBorrowing(false)
    window.location.reload()
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{t('borrow.confirm')}</span>
        <button
          onClick={handleBorrow}
          disabled={isBorrowing}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isBorrowing ? t('borrow.sending') : t('borrow.yesBorrow')}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
        >
          {t('common.cancel')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBorrow}
        disabled={disabled || isBorrowing}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isBorrowing ? t('borrow.borrowing') : t('borrow.borrow')}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
