import headerLogo from "../assets/book-logo-small.png";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b">
      <h1 className="text-2xl font-bold">Friend Lib</h1>
      <img
        src={headerLogo}
        alt="Friend Library logo"
        className="h-20 w-auto object-contain"
      />
    </header>
  );
}
