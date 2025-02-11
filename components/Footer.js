import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Logo / Title */}
        <div className="text-xl font-bold mb-4 md:mb-0">
          <Link href="/">Masai Connect</Link>
        </div>

        {/* Footer Links */}
        <ul className="flex space-x-6 text-sm font-medium">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms-of-service">Terms of Service</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
        </ul>
      </div>

      {/* Copyright Section */}
      <div className="mt-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Masai Connect. All rights reserved.
      </div>
    </footer>
  );
}