// // store/useAuthStore.js
// import { create } from 'zustand'

// export const useAuthStore = create((set) => ({
//   user: null,
//   isLoggedIn: false,
//   login: (userData) => set({ user: userData, isLoggedIn: true }),
//   logout: () => set({ user: null, isLoggedIn: false }),
//   setUser: (userData) => set({ user: userData }),
// }))

// // store/useAuctionStore.js
// export const useAuctionStore = create((set) => ({
//   auctions: [],
//   selectedAuction: null,
//   setAuctions: (auctions) => set({ auctions }),
//   setSelectedAuction: (auction) => set({ selectedAuction: auction }),
// }))