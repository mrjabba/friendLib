import Header from './header';
import MenuSidebar from './menu-sidebar';
import TestClient from './test-client';

/*
TODO stop here mar 4

resume in copilot window with this..
How to prove hot reload is working

Move the client component to a different route that does not contain a Server Action.

and restore your example from sublime that does this
// File: app/page.tsx
import { neon } from '@neondatabase/serverless';
import { is } from 'drizzle-orm';

export default function Page() {

async function create(formData: FormData) {
  'use server';

  console.log(`>> this will run on the server`);
  const sql = neon(process.env.DATABASE_URL!);

  const author = formData.get('author') as string;
  const title = formData.get('title') as string;
  const pages = formData.get('pages') as string;
  const genres = formData.get('genres') as string;
  const isbn13 = formData.get('isbn13') as string;

  if (!title || title.trim().length === 0) {
    throw new Error('Title cannot be empty');
  }

  await sql`INSERT INTO book (author, title, pages, genres, isbn13) VALUES (${author}, ${title}, ${pages}, ${genres}, ${isbn13})`;
}


  return (
    <>
    <div>kevin222</div>
    <form action={create}>
      <input type="text" placeholder="write a author" name="author" />
      <input type="text" placeholder="write a title" name="title" />
      <input type="text" placeholder="write a pages" name="pages" />
      <input type="text" placeholder="write a genres" name="genres" />
      <input type="text" placeholder="write a isbn13" name="isbn13" />

      <button type="submit">Submit</button>
    </form>
    </>
  );
}

*/

export default function Page() {
  return (
    <>
      <div className="h-screen flex flex-col">
        {/* Header spans full width */}
        <Header />

        {/* Below header: sidebar and content side by side */}
        <div className="flex flex-1">
          {/* Sidebar on left - fixed width, full height */}
          <aside className="w-64 flex-shrink-0 bg-stone-900 text-stone-50 overflow-y-auto">
            <MenuSidebar/>
          </aside>

          {/* Main content on right - fills remaining space */}
          <main className="flex-1 overflow-y-auto p-8">
              formerlyOutlet. maybe children now?
            <TestClient />
            <div>kevin2222333</div>
          </main>
        </div>
      </div>
    </>
  );
}
