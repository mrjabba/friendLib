'use client'

import { useFormStatus } from 'react-dom'
import Button from '@/components/Button'
import { useTranslations } from '@/i18n/I18nProvider'

export function SubmitButton() {
  const t = useTranslations()
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('common.saving') : t('common.save')}
    </Button>
  )
}
