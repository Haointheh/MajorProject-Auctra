import { create } from 'zustand'

export const useSignupStore = create((set) => ({
  // Form state
  formData: {
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    documentType: "",
    frontImage: null,
    backImage: null,
  },
  
  step: 1,
  
  // Update a single field
  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value }
  })),
  
  // Move to next step (with validation)
  nextStep: () => set((state) => {
    if (state.formData.password !== state.formData.confirmPassword) {
      alert("Passwords do not match")
      return state
    }
    return { step: 2 }
  }),
  
  // Move to previous step
  previousStep: () => set({ step: 1 }),
  
  // Submit signup (will call FastAPI later)
  submitSignup: async () => {
    // TODO: Call FastAPI endpoint: POST /api/auth/signup
    // const response = await fetch('http://localhost:8000/api/auth/signup', {
    //   method: 'POST',
    //   body: formDataToMultipart(formData)
    // })
    set({ 
      step: 1,
      formData: {
        name: "", phone: "", password: "", confirmPassword: "",
        dob: "", address: "", documentType: "",
        frontImage: null, backImage: null,
      }
    })
  },
  
  // Reset form
  resetForm: () => set({ 
    step: 1,
    formData: {
      name: "", phone: "", password: "", confirmPassword: "",
      dob: "", address: "", documentType: "",
      frontImage: null, backImage: null,
    }
  }),
}))