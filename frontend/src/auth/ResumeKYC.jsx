// // src/auth/ResumeKYC.jsx
// // Shown after a user successfully calls /kyc/resume (from LoginForm's
// // "Resume verification" link). Reuses the exact same SignupStep2 UI/fields
// // used during normal signup, just pointed at the resume token instead of a
// // fresh signup token.
// import { useState } from "react";
// import SignupStep2 from "./signup/SignupStep2";
// import { apiSubmitKYC } from "../api/auth";

// export default function ResumeKYC({ onClose, switchToLogin, resumeToken }) {
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     dob: "",
//     address: "",
//     documentType: "",
//     documentId: "",
//     frontImage: null,
//     backImage: null,
//   });

//   const updateField = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleResubmit = async () => {
//     setLoading(true);
//     try {
//       const kycForm = new FormData();
//       kycForm.append("date_of_birth", formData.dob);
//       kycForm.append("address", formData.address);
//       kycForm.append("document_type", formData.documentType);
//       kycForm.append("document_number", formData.documentId);
//       kycForm.append("front_image", formData.frontImage);
//       kycForm.append("back_image", formData.backImage);

//       const res = await apiSubmitKYC(kycForm, resumeToken);

//       alert(res.data?.message || "KYC resubmitted. Awaiting admin approval.");
//       switchToLogin?.();
//     } catch (error) {
//       alert(error?.response?.data?.detail || error?.message || "Resubmission failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SignupStep2
//       onClose={onClose}
//       previousStep={switchToLogin}
//       formData={formData}
//       updateField={updateField}
//       handleSignup={handleResubmit}
//       loading={loading}
//     />
//   );
// }

// src/auth/ResumeKYC.jsx
// Shown after a user successfully calls /kyc/resume (from LoginForm's
// "Resume verification" link, shown only for rejected accounts). Reuses the
// exact same SignupStep2 UI/fields used during normal signup, pre-filled
// with whatever was submitted last time so the user only has to fix what
// actually got rejected instead of re-typing everything.
import { useEffect, useState } from "react";
import SignupStep2 from "./signup/SignupStep2";
import { apiSubmitKYC, apiGetMyKYC } from "../api/auth";

export default function ResumeKYC({ onClose, switchToLogin, resumeToken }) {
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(true);

  const [formData, setFormData] = useState({
    dob: "",
    address: "",
    documentType: "",
    documentId: "",
    // Images can't be pre-filled — a browser can't reconstruct a File object
    // from a server path. Leaving these blank and not re-uploading keeps the
    // previously submitted image (the backend falls back to the old file).
    frontImage: null,
    backImage: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiGetMyKYC(resumeToken);
        const kyc = res.data;
        if (cancelled) return;
        setFormData((prev) => ({
          ...prev,
          dob: kyc.date_of_birth || "",
          address: kyc.address || "",
          documentType: kyc.document_type || "",
          documentId: kyc.document_number || "",
        }));
      } catch (err) {
        // 404 just means no previous submission exists yet — start blank,
        // nothing to warn about.
        if (err?.response?.status !== 404) {
          console.error("Failed to load previous KYC submission", err);
        }
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resumeToken]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResubmit = async () => {
    setLoading(true);
    try {
      const kycForm = new FormData();
      // Only send what's actually filled in — the backend keeps whatever
      // was there before for anything left blank.
      if (formData.dob) kycForm.append("date_of_birth", formData.dob);
      if (formData.address) kycForm.append("address", formData.address);
      if (formData.documentType) kycForm.append("document_type", formData.documentType);
      if (formData.documentId) kycForm.append("document_number", formData.documentId);
      if (formData.frontImage) kycForm.append("front_image", formData.frontImage);
      if (formData.backImage) kycForm.append("back_image", formData.backImage);

      const res = await apiSubmitKYC(kycForm, resumeToken);

      alert(res.data?.message || "KYC resubmitted. Awaiting admin approval.");
      switchToLogin?.();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || "Resubmission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupStep2
      onClose={onClose}
      previousStep={switchToLogin}
      formData={formData}
      updateField={updateField}
      handleSignup={handleResubmit}
      loading={loading || prefilling}
    />
  );
}