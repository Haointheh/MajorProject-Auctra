import React from 'react';
import Button from './Button';

export default function ProductCard({ 
  imageUrl = "https://unsplash.com",
  title = "Obsidian Core...",
  idTag = "98",
  activeBidsCount = 8,
  bidAmount = "1,240.00",
  timeLeft = "12:45:03",
  isAiVerified = true,
  onBidClick = () => console.log("Bid clicked!")
}) {
  return (
    /* Outer card container - completely sharp corners (rounded-none) */
    <div className="w-57 bg-white border border-slate-100 rounded-none shadow-sm font-sans flex flex-col">
      
      {/* Top Media Section */}
      <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden rounded-none">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover rounded-none"
        />

        {/* Floating Overlay Tags */}
        <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
          {/* AI Verified Badge */}
          {isAiVerified && (
            <div className="bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-none flex items-center space-x-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
              <span>AI Verified</span>
            </div>
          )}
          
          {/* Countdown Timer Badge */}
          <div className="bg-slate-950/70 backdrop-blur-sm text-[10px] font-semibold text-white px-2 py-0.5 rounded-none flex items-center space-x-1 border border-white/10">
            <span className="w-1 h-1 rounded-none bg-rose-500 animate-pulse"></span>
            <span className="font-mono">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Card Info Details Section */}
      <div className="p-3 flex flex-col grow">
        
        {/* Title and ID Row */}
        <div className="flex items-start justify-between space-x-2">
          <h3 className="text-sm font-bold text-slate-800 truncate tracking-tight">{title}</h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-100 rounded-none shrink-0">
            {idTag}
          </span>
        </div>

        {/* Mock Bidder Avatars & Total Counts */}
        <div className="flex items-center space-x-1.5 mt-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 bg-slate-300 border border-white rounded-none shrink-0" />
            <div className="w-4 h-4 bg-slate-400 border border-white rounded-none shrink-0" />
            <div className="w-4 h-4 bg-slate-500 text-[8px] font-bold text-white flex items-center justify-center border border-white rounded-none shrink-0">
              +{activeBidsCount - 2 > 0 ? activeBidsCount - 2 : 1}
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {activeBidsCount} active bids
          </span>
        </div>

        <hr className="border-slate-100 my-3" />

        {/* Pricing & Call to Action Row */}
        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Bid</span>
            <span className="text-base font-black text-slate-900 leading-none mt-1">
              ${bidAmount}
            </span>
          </div>
          
          {/* Action Button */}
          {/* <button 
            onClick={onBidClick}
            className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-3 py-2 rounded-none transition-colors shadow-sm"
          >
            Place Bid
          </button> */}
          <Button variant="secondary" size="xs">
            Place Bid
          </Button>
        </div>

      </div>
    </div>
  );
}
