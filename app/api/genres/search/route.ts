import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { genre } from '@/db/schema'
import { ilike } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const results = await db
      .select({ id: genre.id, value: genre.value })
      .from(genre)
      .where(ilike(genre.value, `%${query}%`))
      .orderBy(genre.value)
      .limit(10)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Failed to search genres:', error)
    return NextResponse.json({ error: 'Failed to search genres' }, { status: 500 })
  }
}
