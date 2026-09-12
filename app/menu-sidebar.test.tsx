import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'

import { render } from '@/test/utils/render'
import MenuSidebar from './menu-sidebar'

describe('MenuSidebar', () => {
  it('links to every section of the app', () => {
    render(<MenuSidebar />)

    const links: Array<[string, string]> = [
      ['Home', '/'],
      ['Add', '/actions/book-add'],
      ['Search', '/actions/book-search'],
      ['My Borrows', '/actions/my-borrows'],
      ['Borrow Requests', '/actions/borrow-requests'],
      ['Returns', '/actions/return-confirmation'],
    ]

    for (const [name, href] of links) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('offers the language switcher', () => {
    render(<MenuSidebar />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('translates the navigation for the active locale', () => {
    render(<MenuSidebar />, { locale: 'de' })

    expect(screen.getByRole('link', { name: 'Startseite' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Meine Ausleihen' })).toBeInTheDocument()
    expect(screen.getByText('Verwaltung')).toBeInTheDocument()
  })
})
