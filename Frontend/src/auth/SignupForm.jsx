// import { MdClose } from "react-icons/md";
// import logo from "../assets/auctra_logo.svg";

// export default function SignupForm({
//     onClose,
//     switchToLogin,
// }) {
//     return (
//         <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg bg-neutral1 p-6 sm:p-8 shadow-lg mx-4 sm:mx-0">

//             <div className="flex justify-end">
//                 <MdClose
//                     onClick={onClose}
//                     className="cursor-pointer hover:text-neutral6"
//                 />
//             </div>

//             <div className="text-center">
//                 <img src={logo} alt="Logo" className="mx-auto h-20 sm:h-28 w-auto" />

//                 <h2 className="text-xl sm:text-2xl font-bold text-primary">
//                     Create an account
//                 </h2>
//             </div>

//             <form className="mt-8 space-y-6">

//                 <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-neutral9">Name</label>
//                     <input
//                         id="name"
//                         placeholder="Enter name"
//                         className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none"
//                     />
//                 </div>

//                 <div>
//                     <label htmlFor="phone" className="block text-sm font-medium text-neutral9">Phone Number</label>
//                     <input
//                         id="phone"
//                         placeholder="Enter phone number"
//                         className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none"
//                     />
//                 </div>

//                 <div>
//                     <label htmlFor="signup-password" className="block text-sm font-medium text-neutral9">Password</label>
//                     <input
//                         id="signup-password"
//                         type="password"
//                         placeholder="Enter password"
//                         className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none"
//                     />
//                 </div>

//                 <button type="submit" className="w-full bg-secondaryd px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-secondaryd-hover">
//                     Sign Up
//                 </button>

//             </form>

//             <div className="mt-6 text-center text-sm text-neutral7">
//                 Already have an account?

//                 <button
//                     type="button"
//                     onClick={switchToLogin}
//                     className="ml-2 font-medium text-primary hover:text-primary-hover"
//                 >
//                     Log In
//                 </button>

//             </div>

//         </div>
//     );
// }