import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useEffect, useState } from "react";
import Header from "./components/Header";
import MenuSidebar from "./components/MenuSidebar";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import { Book } from "./components/models";
import RootLayout from "./components/Root";
import HomePage from "./components/Home";
import BookSearch from './components/BookSearch';
import BooksRootLayout from './components/BooksRoot';

  const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    //errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'books',
        element: <BooksRootLayout />,
        children: [
          {
            // need to figure this out
            index: true,
            element: <BookList books={[]} />,
            //loader: eventsLoader,
          },
          {
            path: 'new',
            element: <BookAdd/>
            //             {editing ? <BookAdd onSave={handleOnSave} selectedBook={selectedBook} /> : <BookList books={books.items} />}
            //action: manipulateEventAction,
          },
          {
            path: 'search',
            element: <BookSearch/>
          },
        ],
      },
    ],
  },
]);

function App() {
  const [books, setBooks] = useState({
    items: [],
  });
  const [selectedBook, setSelectedBook] = useState(undefined);

  // until we replace with a context provider
  function handleOnSave(book: Book) {
    console.log(`>> handleOnSave`, book);
    setBooks((prev) => {
      return {
        ...prev, book
      }
    });
  }


  return <RouterProvider router={router} />;
}


export default App;


//function App() {
  //console.log(`>> App start`);
//   const [books, setBooks] = useState({
//     items: [],
//   });
//   const [editing, setEditing] = useState(false);
//   const [selectedBook, setSelectedBook] = useState(undefined);

//   useEffect(() => {
//       async function fetchBooks() {
//           console.log(`>> fetchBooks from app`);
//           const response = await fetch('http://localhost:3000/books');
//           const resData = await response.json();
//           setBooks(resData.books);
//       }
//       // TODO error handler if we fail to fetch books
//       fetchBooks();


//       /*
// feb 7 2026. playing around. moved this fetchbooks effect up
// b/c that needs to happen early. we are sharing state between BookList (which was retrieving the books)
// and here in handleOnSave triggered from BookAdd. so I think it wasn't working b/c it didn't know about the state
// I think I'm gonna create a provider though

//       */



// }, []);

  



  //   /*
  //   ok this isn't working yet. and I think rather than using simple state
  //   we might consider doing useContext? maybe rewatch that chapter
  //   a good code example for the context provider we can take is from 
  //   chapter 10 -> 08. see shoppin-cart-context.jsx
    
  //   */
  //   console.log(`>> handleOnSave current books`, books);
  //   setEditing(false);
  // }

//   return (
    // <div className="h-screen flex flex-col">
    //   {/* Header spans full width */}
    //   <Header />

    //   {/* Below header: sidebar and content side by side */}
    //   <div className="flex flex-1">
    //     {/* Sidebar on left - fixed width, full height */}
    //     <aside className="w-64 flex-shrink-0 bg-stone-900 text-stone-50 overflow-y-auto">
    //       <MenuSidebar
    //         onSelectAdd={() => handleAddBookClick()}
    //         onSelectHome={() => handleHomeClick()}
    //       />
    //     </aside>

    //     {/* Main content on right - fills remaining space */}
    //     <main className="flex-1 overflow-y-auto p-8">
    //       <div className="max-w-3xl">
    //         {editing ? <BookAdd onSave={handleOnSave} selectedBook={selectedBook} /> : <BookList books={books.items} />}
    //       </div>
    //       <h3>savedBooks</h3>
    //       <div>{books.items}</div>
    //     </main>
    //   </div>
    // </div>
//   );
// }
