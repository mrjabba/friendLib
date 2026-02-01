import { useState } from "react";
import Header from "./components/Header";
import MenuSidebar from "./components/MenuSidebar";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import { Book } from "./components/models";

function App() {
  //console.log(`>> App start`);
  const [books, setBooks] = useState({
    items: [],
  });
  const [editing, setEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState(undefined);

  function handleAddBookClick() {
    // TODO we aren't see this function being invoked
    console.log(`add button clicked`);
    setEditing(true);
  }

  function handleHomeClick() {
    console.log(`handleHomeClick - we prob need a router`);
    setEditing(false);
  }

  function handleOnSave(book: Book) {
    console.log(`>> handleOnSave`, book);
    setBooks((prev) => {
      return {
        ...prev, book
      }
    });
    /*
    ok this isn't working yet. and I think rather than using simple state
    we might consider doing useContext? maybe rewatch that chapter
    a good code example for the context provider we can take is from 
    chapter 10 -> 08. see shoppin-cart-context.jsx
    
    */
    console.log(`>> current books`, books);
    setEditing(false);
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header spans full width */}
      <Header />

      {/* Below header: sidebar and content side by side */}
      <div className="flex flex-1">
        {/* Sidebar on left - fixed width, full height */}
        <aside className="w-64 flex-shrink-0 bg-stone-900 text-stone-50 overflow-y-auto">
          <MenuSidebar
            onSelectAdd={() => handleAddBookClick()}
            onSelectHome={() => handleHomeClick()}
          />
        </aside>

        {/* Main content on right - fills remaining space */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl">
            {editing ? <BookAdd onSave={handleOnSave} selectedBook={selectedBook} /> : <BookList />}
          </div>
          <h3>savedBooks</h3>
          <div>{books.items}</div>
        </main>
      </div>
    </div>
  );
}

export default App;
