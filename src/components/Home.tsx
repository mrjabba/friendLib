import logo from '../assets/logo-small.png';

function HomePage() {
  return (
    <>
      <img src={logo} className="h-64 w-auto object-contain" />
      <h2>Search, borrow and loan books with friends.</h2>
    </>
  );
}

export default HomePage;
