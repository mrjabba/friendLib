import {Book} from './models';

export default function BookDetail({book}: {book: Book}) {
    return (
        <>
        <h2>{book.title}</h2>
        <h4>{book.author}</h4>
        <h4>{book.pages}</h4>
        </>
    )
}