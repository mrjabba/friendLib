import {Book} from './models';

export default function BookDetail({book}: {book: Book}) {
    return (
        <>
        <h3>{book.title}</h3>
        <h4>{book.author}</h4>
        <h4>{book.pages}</h4>
        </>
    )
}