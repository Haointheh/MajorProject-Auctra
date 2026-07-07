import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#f8f9fa] text-[#1a1a1a] font-sans px-6 py-12 md:px-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-12 border-b border-gray-200">
          
          {/* Left Column: Branding */}
          <div className="max-w-md">
            <h2 className="text-lg font-extrabold tracking-wider uppercase mb-4">
              Auctra
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The world's leading institutional marketplace for high-value collectibles, fine art, and luxury assets. 
              Precision-engineered for trust and transparency.
            </p>
          </div>

          {/* Right Columns: Links */}
          <div className="flex gap-16 md:gap-24">
            
            {/* Platform Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Platform
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><a href="#how-it-works" className="hover:text-black transition-colors duration-200">How it Works</a></li>
                <li><a href="#newsletter" className="hover:text-black transition-colors duration-200">Newsletter</a></li>
                <li><a href="#about-us" className="hover:text-black transition-colors duration-200">About Us</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Legal
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><a href="#terms" className="hover:text-black transition-colors duration-200">Terms</a></li>
                <li><a href="#privacy" className="hover:text-black transition-colors duration-200">Privacy</a></li>
                <li><a href="#agreement" className="hover:text-black transition-colors duration-200">Bidder Agreement</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-xs text-gray-500 gap-4">
          
          {/* Dynamic Copyright */}
          <p>&copy; {currentYear} Auctra. All rights reserved.</p>
          
          {/* Right Utility Icons */}
          <div className="flex items-center gap-4 text-gray-600">
            
            {/* Global Language Toggle */}
            <button className="hover:text-black transition-colors duration-200" aria-label="Select Language">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.6 9h16.8M3.6 15h16.8" />
                <path strokeWidth="1.5" d="M12 3a15.3 15.3 0 014.5 9 15.3 15.3 0 01-4.5 9 15.3 15.3 0 01-4.5-9 15.3 15.3 0 014.5-9z" />
              </svg>
            </button>
            
            {/* Regional Location Toggle */}
            <button className="hover:text-black transition-colors duration-200" aria-label="Select Region">
              
            </button>

          </div>
        </div>

      </div>
    </footer>
  );
}
