import React, {useState} from 'react';
import Button from './Button';
import LoginForm from './LoginForm';

export default function Navbar() {
const [showLogin, setShowLogin] = useState(false);

  return (
    <nav className="">
      {/* Top Section */}
      <div className="flex items-center justify-between px-8 pt-4">
        {/* LOGO */}
        <a href="/" className="flex items-center gap-2">
          <img 
            src="./src/assets/auctra_logo.svg" 
            alt="Auctra Logo"  
            className="w-26 h-26 object-contain"
          />
        </a>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-12">
          <div className="relative bg-slate-50">
            <input
              type="text"
              placeholder="Search"
              className="w-full border-slate-700 py-3 pl-12 pr-4 text-black placeholder-neutral-4 focus:ring-2 focus:ring-neutral5 focus:outline-none transition"
            />

            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Notification */}
          {/* <button className="text-neutral3 hover:text-neutral7">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.5-1.5A2.12 2.12 0 0118 14V11a6 6 0 10-12 0v3c0 .6-.2 1.2-.5 1.5L4 17h5m6 0a3 3 0 11-6 0h6z"
              />
            </svg>
          </button> */}

          {/* Profile Placeholder */}
          {/* <div className="w-11 h-11 rounded-full border-2 border-slate-600 flex items-center justify-center cursor-pointer hover:border-slate-500">
            <span className="text-neutral3 font-medium">
              U
            </span>
          </div> */}

          {/* <button className="text-neutral6 hover:text-neutral8">Log In</button> */}
          <Button variant="blank" size="small" onClick={() => setShowLogin(true)}>
            Log In
          </Button>
          <Button variant="secondary" size="small">
            Join
          </Button>

          
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-8 pb-2 border-b border-slate-300">
        <div className="flex items-center justify-center gap-6">
          <button className="px-5 py-3 text-neutral3 hover:text-neutral7 rounded-lg transition">
            Dashboard
          </button>

          <button className="px-5 py-3 text-neutral3 hover:text-neutral7 rounded-lg transition">
            Team
          </button>

          <button className="px-5 py-3 text-neutral3 hover:text-neutral7 rounded-lg transition">
            Projects
          </button>

          <button className="px-5 py-3 text-neutral3 hover:text-neutral7 rounded-lg transition">
            Calendar
          </button>
        </div>
      </div>

       {showLogin && (
        <LoginForm onClose={() => setShowLogin(false)} />
      )}
    </nav>
  );
}