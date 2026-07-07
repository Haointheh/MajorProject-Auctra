// import { useState } from "react";
// import SignupStep1 from "./SignupStep1";
// import SignupStep2 from "./SignupStep2";
// import { apiSignup } from "../../api/auth";
// import { useAuthStore } from "../../store/useAuthStore";

// export default function SignupFlow({ onClose, switchToLogin }) {
//   const { setAuth } = useAuthStore();
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",

//     dob: "",
//     address: "",
//     documentType: "",
//     documentId: "",

//     frontImage: null,
//     backImage: null,
//   });

//   const updateField = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const nextStep = () => {
//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords do not match.");
//       return;
//     }

//     setStep(2);
//   };

//   const previousStep = () => {
//     setStep(1);
//   };

//   const handleSignup = async () => {
//     setLoading(true);
//     try {
//       const res = await apiSignup({
//         name: formData.name,
//         email: `${formData.name?.toLowerCase().replace(/\s+/g, "")}@example.com`,
//         password: formData.password,
//         phone: formData.phone,
//         role: "user",
//       });

//       setAuth(res.data.user, res.data.access_token);
//       onClose?.();
//     } catch (error) {
//       alert(error?.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {step === 1 ? (
//         <SignupStep1
//           onClose={onClose}
//           switchToLogin={switchToLogin}
//           formData={formData}
//           updateField={updateField}
//           nextStep={nextStep}
//         />
//       ) : (
//         <SignupStep2
//           onClose={onClose}
//           previousStep={previousStep}
//           formData={formData}
//           updateField={updateField}
//           handleSignup={handleSignup}
//           loading={loading}
//         />
//       )}
//     </>
//   );
// }

import { useState } from "react";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";
import { apiSignup, apiSubmitKYC } from "../../api/auth";

export default function SignupFlow({ onClose, switchToLogin }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user", // "user" (buyer) | "seller"
    phone: "",
    password: "",
    confirmPassword: "",

    dob: "",
    address: "",
    documentType: "",
    documentNumber: "",

    frontImage: null,
    backImage: null,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setStep(2);
  };

  const previousStep = () => {
    setStep(1);
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      // Step 1: create the account. The backend returns a short-lived
      // "kyc_pending" token — the account can't log in normally until an
      // admin approves the KYC submission below.
      const signupRes = await apiSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const kycPendingToken = signupRes.data.access_token;

      // Step 2: submit the KYC documents using that pending token.
      const kycForm = new FormData();
      kycForm.append("date_of_birth", formData.dob);
      kycForm.append("address", formData.address);
      kycForm.append("document_type", formData.documentType);
      kycForm.append("document_number", formData.documentNumber);
      kycForm.append("front_image", formData.frontImage);
      kycForm.append("back_image", formData.backImage);

      await apiSubmitKYC(kycForm, kycPendingToken);

      alert(
        "Signup successful! Your documents have been submitted for review. " +
          "You'll be able to log in once an admin approves your KYC."
      );
      switchToLogin?.();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 1 ? (
        <SignupStep1
          onClose={onClose}
          switchToLogin={switchToLogin}
          formData={formData}
          updateField={updateField}
          nextStep={nextStep}
        />
      ) : (
        <SignupStep2
          onClose={onClose}
          previousStep={previousStep}
          formData={formData}
          updateField={updateField}
          handleSignup={handleSignup}
          loading={loading}
        />
      )}
    </>
  );
}