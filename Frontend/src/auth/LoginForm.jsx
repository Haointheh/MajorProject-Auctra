import React, {useState} from 'react'
import { MdClose } from "react-icons/md";
import logo from "../assets/auctra_logo.svg";
import Button from '../ui/Button';

const LoginForm = ({ onClose, switchToSignup, }) => {

  // const [visible, setVisible] = useState(true)  
  //  if (!visible) return null; //  removes component from UI

  return (
    <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg bg-neutral1 p-6 sm:p-8 shadow-lg mx-4 sm:mx-0">
      <div className="flex justify-end hover:text-neutral6 cursor-pointer">
        <MdClose onClick={onClose} />
      </div>
        {/* Logo */}
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto h-20 sm:h-28 w-auto" />

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Sign in to your account
          </h2>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral9"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter email"
              className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none focus:placeholder:text-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral9"
              >
                Password
              </label>

              <button
                type="button"
                className="text-sm text-neutral6 hover:text-neutral8"
              >
                Forgot password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none focus:placeholder:text-transparent"
            />
          </div>

          <Button type="submit" variant="secondary" size="md" className="w-full">
  Sign In
</Button>
        </form>
        {/* Signup Link */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-neutral7">Not a member?</span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              switchToSignup?.();
            }}
            className="font-medium text-primary hover:text-secondaryd-hover"
          >
            Sign Up
          </button>
        </div>
      </div>
    
    
  );
}

export default LoginForm;