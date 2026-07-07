// import { useState } from "react";
// import { MdClose } from "react-icons/md";
// import logo from "../assets/auctra_logo.svg";
// import Button from "../ui/Button";
// import { apiLogin } from "../api/auth";
// import { useAuthStore } from "../store/useAuthStore";

// const LoginForm = ({ onClose, switchToSignup }) => {
//   const { setAuth } = useAuthStore();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await apiLogin({ email, password });
//       setAuth(res.data.user, res.data.access_token);
//       onClose();
//     } catch (err) {
//       setError(err?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative mx-4 w-full max-w-xs bg-neutral1 p-6 shadow-lg sm:mx-0 sm:max-w-md sm:p-8 md:max-w-lg">
//       <div className="flex cursor-pointer justify-end hover:text-neutral6">
//         <MdClose onClick={onClose} />
//       </div>

//       <div className="text-center">
//         <img src={logo} alt="Logo" className="mx-auto h-20 w-auto sm:h-28" />

//         <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
//           Sign in to your account
//         </h2>
//       </div>

//       <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//         {error && (
//           <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
//             {error}
//           </div>
//         )}

//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-neutral9">
//             Email
//           </label>

//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter email"
//             className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none focus:placeholder:text-transparent sm:px-4 sm:py-3"
//           />
//         </div>

//         <div>
//           <div className="flex items-center justify-between">
//             <label htmlFor="password" className="block text-sm font-medium text-neutral9">
//               Password
//             </label>

//             <button type="button" className="text-sm text-neutral6 hover:text-neutral8">
//               Forgot password?
//             </button>
//           </div>

//           <input
//             id="password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//             className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none focus:placeholder:text-transparent sm:px-4 sm:py-3"
//           />
//         </div>

//         <Button type="submit" variant="secondary" size="md" className="w-full" disabled={loading}>
//           {loading ? "Signing in…" : "Sign In"}
//         </Button>
//       </form>

//       <div className="mt-6 flex items-center justify-center gap-2 text-sm">
//         <span className="text-neutral7">Not a member?</span>
//         <button
//           type="button"
//           onClick={(event) => {
//             event.preventDefault();
//             switchToSignup?.();
//           }}
//           className="font-medium text-primary hover:text-secondaryd-hover"
//         >
//           Sign Up
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import logo from "../assets/auctra_logo.svg";
import Button from "../ui/Button";
import { apiLogin } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

const LoginForm = ({ onClose, switchToSignup }) => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiLogin({ email, password });
      const { user, access_token } = res.data;
      setAuth(user, access_token);
      onClose();

      // Send sellers straight to the Seller Hub, admins to the admin panel.
      if (user.role === "seller") {
        navigate("/seller/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-4 w-full max-w-xs bg-neutral1 p-6 shadow-lg sm:mx-0 sm:max-w-md sm:p-8 md:max-w-lg">
      <div className="flex cursor-pointer justify-end hover:text-neutral6">
        <MdClose onClick={onClose} />
      </div>

      <div className="text-center">
        <img src={logo} alt="Logo" className="mx-auto h-20 w-auto sm:h-28" />

        <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
          Sign in to your account
        </h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral9">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none focus:placeholder:text-transparent sm:px-4 sm:py-3"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-neutral9">
              Password
            </label>

            <button type="button" className="text-sm text-neutral6 hover:text-neutral8">
              Forgot password?
            </button>
          </div>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none focus:placeholder:text-transparent sm:px-4 sm:py-3"
          />
        </div>

        <Button type="submit" variant="secondary" size="md" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

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
};

export default LoginForm;