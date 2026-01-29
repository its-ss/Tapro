import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className="flex justify-between items-center px-10 py-6 bg-white border-b border-gray-200">
    {/* Logo & Title */}
    <div className="flex items-center space-x-3">
      <img src="/assets/tapro_logo.png" alt="Tapro Logo" className="h-11 w-12" />
      <h1 className="text-xl font-bold">Tapro</h1>
    </div>

    {/* Navigation Links */}
    <nav className="flex items-center space-x-8 text-sm font-medium">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/about" className="hover:underline">About</Link>
      <Link to="/blogs" className="hover:underline">Blogs</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>

      {/* Login Button */}
      <Link
        to="/login"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        Login
      </Link>
    </nav>
  </header>
);

export default Header;
