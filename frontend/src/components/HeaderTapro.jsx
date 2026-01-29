import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ active }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', route: '/explore' },
    { label: 'Starred', route: '/starred' },
    { label: 'Message', route: '/messages' },
    { label: 'Discover', route: '/discover' },
    { label: 'Profile', route: '/profile/manage' }, // Updated to go to profile management
    { label: 'List Startup', route: '/list-startup' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2 w-1/3">
          <img
            src="/assets/tapro_logo.png"
            alt="Tapro Logo"
            className="h-10 w-10 object-cover rounded-full"
          />
          <h1 className="text-base font-semibold">Tapro</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 grid grid-cols-6 gap-4 text-sm text-center">
          {navItems.map(({ label, route }) => {
            const isAlwaysActive = label === 'List Startup';
            const isActive = active === label;

            return (
              <button
                key={label}
                onClick={() => navigate(route)}
                className={`px-3 py-1 rounded-md transition ${
                  isAlwaysActive || isActive
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;