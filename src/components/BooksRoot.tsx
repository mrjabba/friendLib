import { Outlet } from 'react-router-dom';
import BookList from './BookList';

export default function BooksRootLayout() {
    return (
        <>
            <h2>books root layout</h2>
            <BookList books={[]} />
            <Outlet />
        </>
    )
}