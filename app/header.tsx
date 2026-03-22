//import headerLogo from "../assets/book-logo-small.png";
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b">
      <h1 className="text-2xl font-bold">Friend Lib</h1>
      <Image
      src="/images/book-logo-small.png"
      alt='logo-small'
      width={75}
      height={75}
      />
      {/* <img
        src={headerLogo}
        alt="Friend Library logo"
        className="h-20 w-auto object-contain"
      /> */}
    </header>
  );
}
