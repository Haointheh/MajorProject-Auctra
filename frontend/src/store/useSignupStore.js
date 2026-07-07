// src/store/useSignupStore.js
import { create } from "zustand";

export const useSignupStore = create((set) => ({
  kycToken: null,              // the kyc_pending token from /signup
  setKycToken: (token) => set({ kycToken: token }),
  resetForm: () => set({ kycToken: null }),
}));