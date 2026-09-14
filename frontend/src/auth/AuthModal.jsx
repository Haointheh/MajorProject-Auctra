// MOCK 
// import { useState } from "react";
// import LoginForm from "./LoginForm";
// import SignupFlow from "./signup/SignupFlow";

// export default function AuthModal({ initialMode, onClose }) {
//   const [mode, setMode] = useState(initialMode);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

//       {mode === "login" ? (
//         <LoginForm
//           onClose={onClose}
//           switchToSignup={() => setMode("signup")}
//         />
//       ) : (
//         // <SignupForm
//         //   onClose={onClose}
//         //   switchToLogin={() => setMode("login")}
//         // />
//         <SignupFlow
//             onClose={onClose}
//             switchToLogin={() => setMode("login")}
//         />
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupFlow from "./signup/SignupFlow";
import ResumeKYC from "./ResumeKYC";

export default function AuthModal({ initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [resumeToken, setResumeToken] = useState(null);

  const handleResumeKyc = (token) => {
    setResumeToken(token);
    setMode("resume-kyc");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      {mode === "login" && (
        <LoginForm
          onClose={onClose}
          switchToSignup={() => setMode("signup")}
          onResumeKyc={handleResumeKyc}
        />
      )}

      {mode === "signup" && (
        <SignupFlow
          onClose={onClose}
          switchToLogin={() => setMode("login")}
        />
      )}

      {mode === "resume-kyc" && (
        <ResumeKYC
          onClose={onClose}
          switchToLogin={() => setMode("login")}
          resumeToken={resumeToken}
        />
      )}
    </div>
  );
}