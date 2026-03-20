//import { Link } from 'react-router-dom';
import Link from 'next/link';

export default function MenuSidebar() {
  return (
    <>
      <ul className="my-5 px-8 md:text-xl">
        <li>
          <button className="py-2"><Link href="/">Home</Link></button>
        </li>
        <li>
          <button className="py-2"><Link href="/actions/book-add">Add</Link></button>
        </li>
        <li>
          <button className="py-2"><Link href="/actions/book-search">Search</Link></button>
        </li>
      </ul>
    </>
  );
}
