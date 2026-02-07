import { Link } from 'react-router-dom';

export default function MenuSidebar() {
  return (
    <>
      <ul className="my-5 px-8 md:text-xl">
        <li>
          <button className="py-2"><Link to="/">Home</Link></button>
        </li>
        <li>
          <button className="py-2"><Link to="/books/new">Add</Link></button>
        </li>
        <li>
          <button className="py-2"><Link to="/books/search">Search</Link></button>
        </li>
      </ul>
    </>
  );
}
