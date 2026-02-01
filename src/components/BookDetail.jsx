export default function BookDetail({book}) {
    return (
        <>
        <h2>{book.title}</h2>
        <h4>{book.author}</h4>
        <h4>{book.genres}</h4>
        </>
    )
}