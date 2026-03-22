import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { genre } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allGenres = await db
      .select({ id: genre.id, value: genre.value })
      .from(genre)
      .orderBy(genre.value)

    return NextResponse.json(allGenres)
  } catch (error) {
    console.error('Failed to fetch genres:', error)
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { value } = await request.json()

    if (!value?.trim()) {
      return NextResponse.json({ error: 'Genre value is required' }, { status: 400 })
    }

    const trimmedValue = value.trim()

    const existing = await db
      .select({ id: genre.id, value: genre.value })
      .from(genre)
      .where(eq(genre.value, trimmedValue))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(existing[0])
    }

    const [created] = await db
      .insert(genre)
      .values({ value: trimmedValue })
      .returning({ id: genre.id, value: genre.value })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to create genre:', error)
    return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 })
  }
}
