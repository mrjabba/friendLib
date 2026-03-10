import Image from 'next/image';

export default function Page() {
  return (
    <>
      <Image
        src="/images/logo-small.png"
        alt='logo-small'
        width={640}
        height={427}
      />
      <h2>Search, borrow and loan books with friends.</h2>
    </>
  );
}
