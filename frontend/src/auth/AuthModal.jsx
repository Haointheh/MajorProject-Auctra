import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupFlow from "./signup/SignupFlow";

export default function AuthModal({ initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      {mode === "login" ? (
        <LoginForm
          onClose={onClose}
          switchToSignup={() => setMode("signup")}
        />
      ) : (
        // <SignupForm
        //   onClose={onClose}
        //   switchToLogin={() => setMode("login")}
        // />
        <SignupFlow
            onClose={onClose}
            switchToLogin={() => setMode("login")}
        />
      )}
    </div>
  );
}