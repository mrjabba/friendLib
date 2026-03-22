import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { borrows } from '@/db/schema'
import { eq, and, isNull, isNotNull } from 'drizzle-orm'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const { bookId } = await params
    const id = parseInt(bookId, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    const activeBorrow = await db
      .select()
      .from(borrows)
      .where(and(eq(borrows.bookId, id), isNotNull(borrows.approvedAt), isNull(borrows.returnedAt)))
      .limit(1)

    const pendingRequest = await db
      .select()
      .from(borrows)
      .where(and(eq(borrows.bookId, id), isNull(borrows.approvedAt), isNull(borrows.rejectedAt)))
      .limit(1)

    let status: 'available' | 'borrowed' | 'pending' = 'available'
    let borrowData = null

    if (activeBorrow.length > 0) {
      status = 'borrowed'
      borrowData = activeBorrow[0]
    } else if (pendingRequest.length > 0) {
      status = 'pending'
      borrowData = pendingRequest[0]
    }

    return NextResponse.json({
      status,
      borrow: borrowData,
    })
  } catch (error) {
    console.error('Failed to fetch borrow status:', error)
    return NextResponse.json({ error: 'Failed to fetch borrow status' }, { status: 500 })
  }
}
