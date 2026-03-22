'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import GenrePill from './GenrePill'

interface Genre {
  id: number
  value: string
}

interface GenreAutocompleteProps {
  selectedGenres: Genre[]
  onChange: (genres: Genre[]) => void
}

export default function GenreAutocomplete({ selectedGenres, onChange }: GenreAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateOption, setShowCreateOption] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setResults([])
      setShowCreateOption(false)
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/genres/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()

        const selectedIds = selectedGenres.map((g) => g.id)
        const filtered = data.filter((g: Genre) => !selectedIds.includes(g.id))

        setResults(filtered)
        setShowCreateOption(!data.some((g: Genre) => g.value.toLowerCase() === query.toLowerCase()))
        setIsOpen(true)
      } catch (err) {
        console.error('Genre search failed:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selectedGenres])

  const handleSelect = useCallback(
    (genre: Genre) => {
      onChange([...selectedGenres, genre])
      setQuery('')
      setIsOpen(false)
      inputRef.current?.focus()
    },
    [selectedGenres, onChange],
  )

  const handleRemove = useCallback(
    (id: number) => {
      onChange(selectedGenres.filter((g) => g.id !== id))
    },
    [selectedGenres, onChange],
  )

  const handleCreateNew = useCallback(async () => {
    if (!query.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: query.trim() }),
      })
      const newGenre = await res.json()
      onChange([...selectedGenres, newGenre])
      setQuery('')
      setIsOpen(false)
      setShowCreateOption(false)
    } catch (err) {
      console.error('Failed to create genre:', err)
    } finally {
      setIsLoading(false)
    }
  }, [query, selectedGenres, onChange])

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Type to search or create genres..."
          className="w-full border border-gray-300 rounded px-3 py-2"
          autoComplete="off"
        />

        {isOpen && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <li className="px-3 py-2 text-gray-500">Searching...</li>
            ) : results.length > 0 ? (
              results.map((genre) => (
                <li key={genre.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(genre)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 transition"
                  >
                    {genre.value}
                  </button>
                </li>
              ))
            ) : null}

            {showCreateOption && (
              <li className="border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 transition"
                >
                  + Create &quot;{query}&quot;
                </button>
              </li>
            )}

            {!isLoading && results.length === 0 && !showCreateOption && (
              <li className="px-3 py-2 text-gray-500">No matching genres</li>
            )}
          </ul>
        )}
      </div>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map((genre) => (
            <GenrePill
              key={genre.id}
              id={genre.id}
              value={genre.value}
              removable
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {selectedGenres.map((genre) => (
        <input key={genre.id} type="hidden" name="genreIds" value={genre.id} />
      ))}
    </div>
  )
}
