import Link from "next/link";

const Navbar = () => {
  return (
    <header className="w-full">
      <nav className=" flex items-center justify-center w-full nav">
        <Link href="/" className="flex items-center gap-1">
          <p className="nav-logo">
            Track<span className="text-primary">Price</span>
          </p>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
