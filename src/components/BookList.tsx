import { useState, useEffect } from 'react';
// import logo from '../assets/logo-small.png';
import {Book} from './models';
import BookDetail from './BookDetail';


export default function BookList({ books }: { books: Book[] }) {

const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
//const [books, setBooks] = useState<Book[]>([]);
console.log(`>> BookList start books`, books);
let bookContent = <p>Please select a book.</p>;

// useEffect(() => {
//     async function fetchBooks() {
//         console.log(`>> fetchBooks`);
//         const response = await fetch('http://localhost:3000/books');
//         const resData = await response.json();
//         setBooks(resData.books);
//     }
//     // TODO error handler if we fail to fetch books
//     fetchBooks();
// }, []);

function handleMouseOver(book: Book) {
    // TODO reset the selected book state when the page initially loads?
    //console.log(`>> handleMouseOver`, book);
    setSelectedBook(book);
}

function handleMouseOut(book: Book | undefined) {
    //console.log(`>> handleMouseOut`, book);
    setSelectedBook(undefined);
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
          {/* <img src={logo} className="h-64 w-auto object-contain" /> */}
          {
            selectedBook && <BookDetail book={selectedBook} />
          }
        </div>
      </div>
    );
}