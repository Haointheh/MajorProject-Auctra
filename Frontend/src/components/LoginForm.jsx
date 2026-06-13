import React, {useState} from 'react'
import { MdClose } from "react-icons/md";
import logo from "../assets/auctra_logo.svg";


const LoginForm = ({ onClose }) => {

  // const [visible, setVisible] = useState(true)  
  //  if (!visible) return null; //  removes component from UI

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">  
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="flex justify-end hover:text-gray-500 cursor-pointer">
          <MdClose onClick={onClose} />
        </div>
        {/* Logo */}
        <div className="text-center">
          <img
            src={logo} 
            alt="Logo"
            className="mx-auto h-30 w-auto"
          />

          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-900"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="Enter your username"
              className="mt-2 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>

              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="mt-2 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Sign In
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-600">Not a member?</span>
          <a
            href="#"
            className="font-medium text-gray-800 hover:text-gray-500"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
    
  );
}

export default LoginForm;