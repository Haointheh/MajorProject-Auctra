import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // Session state
  user: null,
  isAuthenticated: false,
  token: null,
  
  // Login action (will call FastAPI later)
  login: async (email, password) => {
    // TODO: Call FastAPI endpoint: POST /api/auth/login
    // const response = await fetch('http://localhost:8000/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // })
    // const data = await response.json()
    set({ 
      user: { email }, 
      isAuthenticated: true,
      token: 'token_here'
    })
  },
  
  // Logout action
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
    token: null
  }),
  
  // Set user data (from profile, etc)
  setUser: (userData) => set({ user: userData }),
}))