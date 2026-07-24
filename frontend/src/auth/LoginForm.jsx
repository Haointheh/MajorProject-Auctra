// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { MdClose } from "react-icons/md";
// import logo from "../assets/auctra_logo.svg";
// import Button from "../ui/Button";
// import Input from "../ui/Input";
// import { apiLogin, apiResumeKYC } from "../api/auth";
// import { useAuthStore } from "../store/useAuthStore";

// const LoginForm = ({ onClose, switchToSignup, onResumeKyc }) => {
//     const { setAuth } = useAuthStore();
//     const navigate = useNavigate();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState(null);
//     const [kycBlocked, setKycBlocked] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [resuming, setResuming] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);
//         setKycBlocked(false);
//         setLoading(true);

//         try {
//             const res = await apiLogin({ email, password });
//             const { user, access_token } = res.data;

//             setAuth(user, access_token);
//             onClose();

//             if (user.role === "seller") {
//                 navigate("/seller/dashboard");
//             } else if (user.role === "admin") {
//                 navigate("/admin");
//             }
//         } catch (err) {
//             setError(
//                 err?.response?.data?.detail ||
//                 err?.message ||
//                 "Login failed"
//             );

//             setKycBlocked(err?.response?.status === 403);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleResumeVerification = async () => {
//         setResuming(true);
//         setError(null);

//         try {
//             const res = await apiResumeKYC({
//                 email,
//                 password,
//             });

//             onResumeKyc(res.data.access_token, email);
//         } catch (err) {
//             setError(
//                 err?.response?.data?.detail ||
//                 err?.message ||
//                 "Could not resume verification"
//             );
//         } finally {
//             setResuming(false);
//         }
//     };

//     return (
//         <div className="relative mx-4 w-full max-w-xs bg-neutral1 p-6 shadow-lg sm:mx-0 sm:max-w-md sm:p-8 md:max-w-lg">
//             <div className="flex justify-end">
//                 <MdClose
//                     onClick={onClose}
//                     className="cursor-pointer hover:text-neutral6"
//                 />
//             </div>

//             <div className="text-center">
//                 <img
//                     src={logo}
//                     alt="Logo"
//                     className="mx-auto h-20 w-auto sm:h-28"
//                 />

//                 <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
//                     Sign in to your account
//                 </h2>
//             </div>

//             <form
//                 className="mt-8 space-y-6"
//                 onSubmit={handleSubmit}
//             >
//                 {error && (
//                     <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
//                         <p>{error}</p>

//                         {kycBlocked && (
//                             <button
//                                 type="button"
//                                 onClick={handleResumeVerification}
//                                 disabled={resuming}
//                                 className="mt-2 font-medium text-primary hover:text-secondaryd-hover"
//                             >
//                                 {resuming
//                                     ? "Checking..."
//                                     : "Resume verification →"}
//                             </button>
//                         )}
//                     </div>
//                 )}

//                 <Input
//                     id="email"
//                     label="Email"
//                     type="email"
//                     placeholder="Enter email"
//                     value={email}
//                     onChange={(e) =>
//                         setEmail(e.target.value)
//                     }
//                 />

//                 <div>
//                     <div className="flex justify-between items-center">
//                         <label
//                             htmlFor="password"
//                             className="block text-sm font-medium text-neutral9"
//                         >
//                             Password
//                         </label>

//                         <button
//                             type="button"
//                             className="text-sm text-neutral6 hover:text-neutral8"
//                         >
//                             Forgot password?
//                         </button>
//                     </div>

//                     <Input
//                         id="password"
//                         type="password"
//                         placeholder="Enter your password"
//                         value={password}
//                         onChange={(e) =>
//                             setPassword(e.target.value)
//                         }
//                     />
//                 </div>

//                 <Button
//                     type="submit"
//                     variant="secondary"
//                     size="md"
//                     className="w-full"
//                     disabled={loading}
//                 >
//                     {loading
//                         ? "Signing in..."
//                         : "Sign In"}
//                 </Button>
//             </form>

//             <div className="mt-6 flex items-center justify-center gap-2 text-sm">
//                 <span className="text-neutral7">
//                     Not a member?
//                 </span>

//                 <button
//                     type="button"
//                     onClick={(e) => {
//                         e.preventDefault();
//                         switchToSignup?.();
//                     }}
//                     className="font-medium text-primary hover:text-secondaryd-hover"
//                 >
//                     Sign Up
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default LoginForm;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import logo from "../assets/auctra_logo.svg";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { apiLogin, apiResumeKYC } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

const LoginForm = ({ onClose, switchToSignup, onResumeKyc }) => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  // "pending" -> account hasn't been reviewed yet, nothing to do but wait
  // "rejected" -> account was reviewed and rejected, can resubmit
  const [kycState, setKycState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resuming, setResuming] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setKycState(null);
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
      const detail = err?.response?.data?.detail || err?.message || "Login failed";
      setError(detail);

      // The backend's KYC-gate error looks like:
      //   "Login not allowed. KYC status: pending"
      //   "Login not allowed. KYC status: rejected"
      // Anything else (wrong password etc.) is a normal 401, no kycState set.
      if (err?.response?.status === 403) {
        if (detail.includes("rejected")) {
          setKycState("rejected");
        } else if (detail.includes("pending")) {
          setKycState("pending");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeVerification = async () => {
    setResuming(true);
    setError(null);
    try {
      const res = await apiResumeKYC({ email, password });
      onResumeKyc(res.data.access_token, email);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Could not resume verification");
    } finally {
      setResuming(false);
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
            <p>{error}</p>

            {kycState === "pending" && (
              <p className="mt-2 text-rose-500">
                Your account is still awaiting admin review. No action is needed —
                you'll be able to log in once it's approved.
              </p>
            )}

            {kycState === "rejected" && (
              <button
                type="button"
                onClick={handleResumeVerification}
                disabled={resuming}
                className="mt-2 font-medium text-primary hover:text-secondaryd-hover"
              >
                {resuming ? "Checking…" : "Resume verification →"}
              </button>
            )}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral9">
            Email
          </label>

          <Input
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

         <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
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