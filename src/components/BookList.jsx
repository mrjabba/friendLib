import { useState, useEffect } from 'react';
import logo from '../assets/logo-small.png';
//import { DUMMY_BOOKS } from '../dummy-books';
import BookDetail from './BookDetail';


export default function BookList() {

const [selectedBook, setSelectedBook] = useState();
const [books, setBooks] = useState([]);
console.log(`>> BookList start`);
let bookContent = <p>Please select a book.</p>;

useEffect(() => {
    async function fetchBooks() {
        const response = await fetch('http://localhost:3000/books');
        const resData = await response.json();
        setBooks(resData.books);
    }
    fetchBooks();
}, []);

  if (selectedBook) {
    bookContent = (
      <div id="tab-content">
        <h3>{selectedBook.title}</h3>
        <p>{selectedBook.author}</p>
        <pre>
          <code>{selectedBook.pages}</code>
        </pre>
      </div>
    );
  }

function handleMouseOver(book) {
    // TODO reset the selected book state when the page initially loads?
    //console.log(`>> handleMouseOver`, book);
    setSelectedBook(book);
}

function handleMouseOut(book) {
    //console.log(`>> handleMouseOut`, book);
    setSelectedBook('');
}

return (
      <div className="flex gap-8">
        {/* Content on left */}
        <div className="flex-1">
          <h2 className="text-stone-700 text-2xl font-bold mb-4">Books</h2>
          <ul className="text-slate-800 space-y-2">

            {
                books && books.map((book) => {
                    return <li key={book.isbn13} 
                    onMouseOver={() => handleMouseOver(book)}
                    onMouseOut={() => handleMouseOut(book)}
                    >{book.title}</li>
                })
            }

          </ul>
        </div>
        
        {/* Image on right */}
        <div className="flex-shrink-0">
          <img src={logo} className="h-64 w-auto object-contain" />
          {bookContent}
        </div>
      </div>
    );
}