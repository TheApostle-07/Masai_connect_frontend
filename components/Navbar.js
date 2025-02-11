import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/">Masai Connect</Link>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-8 text-lg font-medium">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/">Connect</Link>
          </li>
          <li>
            <Link href="/">Events</Link>
          </li>
          <li>
            <Link href="/">About Us</Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Links */}
      {isOpen && (
        <ul className="md:hidden bg-blue-700 text-white space-y-4 py-4 px-6">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/">Connect</Link>
          </li>
          <li>
            <Link href="/">Events</Link>
          </li>
          <li>
            <Link href="/">About Us</Link>
          </li>
        </ul>
      )}
    </header>
  );
}