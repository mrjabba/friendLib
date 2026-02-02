import { useRef } from 'react';
import {Book} from './models';

export default function BookAdd({onSave, selectedBook}: {onSave: Function, selectedBook: Book | undefined}) {
   console.log(`>> BookAdd start`);
   const titleRef = useRef<HTMLInputElement>(null);
   const authorRef = useRef<HTMLInputElement>(null);
   const pagesRef = useRef<HTMLInputElement>(null);

   function handleSave() {
    const state = {
        title: titleRef.current?.value || '',
        author: authorRef.current?.value || '',
        pages: pagesRef.current?.value || ''
      };
    onSave(state);
   }

  return (
    <>
<h2 className="text-xl font-semibold mb-4">Book Information</h2>

<fieldset className="border border-gray-300 rounded-md p-4 mb-6">
  <legend className="font-medium px-1"> Details</legend>

  <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
    <label htmlFor="title" className="md:w-40 font-medium">Title</label>
    <input
      ref={titleRef}
      type="text"
      id="title"
      name="title"
      required
      className="border border-gray-300 rounded px-3 py-2 flex-1"
    />
  </div>

  <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
    <label htmlFor="author" className="md:w-40 font-medium">Author</label>
    <input
      ref={authorRef}
      type="text"
      id="author"
      name="author"
      required
      className="border border-gray-300 rounded px-3 py-2 flex-1"
    />
  </div>

  <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
    <label htmlFor="pages" className="md:w-40 font-medium">Pages</label>
    <input
      ref={pagesRef}
      type="number"
      id="pages"
      name="pages"
      required
      className="border border-gray-300 rounded px-3 py-2 flex-1"
    />
  </div>
</fieldset>

<button
  type="submit"
  onClick={() => handleSave()}
  className="bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition"
>
  Save
</button>
    </>
  );
}
