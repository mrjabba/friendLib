CREATE TABLE "borrow" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id INTEGER NOT NULL REFERENCES "book"(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL,
    borrower_id TEXT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    owner_confirmed_return_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX one_active_request_per_book 
ON "borrow" (book_id) 
WHERE approved_at IS NULL AND rejected_at IS NULL;

CREATE INDEX borrow_book_id_idx ON "borrow" (book_id);
CREATE INDEX borrow_owner_id_idx ON "borrow" (owner_id);
CREATE INDEX borrow_borrower_id_idx ON "borrow" (borrower_id);
