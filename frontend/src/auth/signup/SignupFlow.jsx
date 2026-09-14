import { useState } from "react";
import SignupStep1 from "./SignupStep1";
import SignupStepOTP from "./SignupStepOTP";
import SignupStep2 from "./SignupStep2";
import { apiRequestSignupOTP, apiVerifySignupOTP, apiCompleteSignup } from "../../api/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import InfoModal from "../../ui/InfoModal";

// 1 = basic info, "otp" = email verification, 2 = KYC documents.
// The account isn't created until step 2 (KYC) actually succeeds —
// /signup/request just emails a code and holds the details server-side for
// 10 minutes, and /signup/verify only confirms the code and hands back a
// signup_pending token. Nothing is written to the users table until
// /signup/complete creates the account and the KYC document together, in
// one commit — so backing out anywhere before that leaves no trace at all.
export default function SignupFlow({ onClose, switchToLogin }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step1Error, setStep1Error] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [otp, setOtp] = useState("");

  // Set once /signup/verify succeeds — a signup_pending token authorizing
  // the final /signup/complete call. No account exists yet at this point.
  const [kycPendingToken, setKycPendingToken] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [step2Error, setStep2Error] = useState(null);

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
    documentId: "", // sent to the backend as "document_number"

    frontImage: null,
    backImage: null,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Step 1 -> request an OTP for the entered email.
  const nextStep = async () => {
    setStep1Error(null);

    if (formData.password !== formData.confirmPassword) {
      setStep1Error("Passwords do not match.");
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      setStep1Error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await apiRequestSignupOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setOtp("");
      setStep("otp");
    } catch (error) {
      setStep1Error(getErrorMessage(error, "Couldn't send verification code."));
    } finally {
      setLoading(false);
    }
  };

  // OTP step -> verify only. No account exists yet — confirms the code and hands back a signup_pending token for the final step.
  const handleVerifyOtp = async () => {
    setOtpError(null);
    setLoading(true);
    try {
      const res = await apiVerifySignupOTP({ email: formData.email, otp });
      setKycPendingToken(res.data.access_token);
      setStep(2);
    } catch (error) {
      setOtpError(getErrorMessage(error, "Invalid or expired code."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(null);
    setResending(true);
    try {
      await apiRequestSignupOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setKycPendingToken(null);
      setOtp("");
    } catch (error) {
      setOtpError(getErrorMessage(error, "Couldn't resend code."));
    } finally {
      setResending(false);
    }
  };

  const previousFromOtp = () => setStep(1);

  // Going back from the KYC step means the signup_pending token from verify
  // is about to become unusable the moment they touch anything here again
  // (re-verifying needs a fresh code) — so instead of silently letting them
  // sit on a token that's about to stop working, clear it now and tell them
  // plainly what to do next.
  const previousFromDocs = () => {
    setKycPendingToken(null);
    setOtp("");
    setOtpError("Please resend the verification code to continue.");
    setStep("otp");
  };

  // Step 3 (KYC form) -> validate everything's filled in first (this step
  // never checked before — the backend's raw 422 "field required" was
  // leaking straight through to the confirmation step otherwise), then
  // open the confirmation. The actual API call only happens once that's
  // confirmed.
  const requestSignup = () => {
    if (
      !formData.dob ||
      !formData.address ||
      !formData.documentType ||
      !formData.documentId ||
      !formData.frontImage ||
      !formData.backImage
    ) {
      setStep2Error("Please fill in all fields and upload both images before continuing.");
      return;
    }
    setStep2Error(null);
    setSignupError(null);
    setShowConfirmModal(true);
  };

  // Confirmation modal's primary action -> the actual final step. Creates
  // the account and the KYC document together, using the signup_pending
  // token from verify.
  const handleSignup = async () => {
    setLoading(true);
    setSignupError(null);
    try {
      const kycForm = new FormData();
      kycForm.append("date_of_birth", formData.dob);
      kycForm.append("address", formData.address);
      kycForm.append("document_type", formData.documentType);
      kycForm.append("document_number", formData.documentId);
      kycForm.append("front_image", formData.frontImage);
      kycForm.append("back_image", formData.backImage);

      await apiCompleteSignup(kycForm, kycPendingToken);

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setSignupError(getErrorMessage(error, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    switchToLogin?.();
  };

  if (step === 1) {
    return (
      <SignupStep1
        onClose={onClose}
        switchToLogin={switchToLogin}
        formData={formData}
        updateField={updateField}
        nextStep={nextStep}
        loading={loading}
        error={step1Error}
      />
    );
  }

  if (step === "otp") {
    return (
      <SignupStepOTP
        onClose={onClose}
        previousStep={previousFromOtp}
        formData={formData}
        otp={otp}
        setOtp={setOtp}
        handleVerifyOtp={handleVerifyOtp}
        handleResendOtp={handleResendOtp}
        loading={loading}
        resending={resending}
        error={otpError}
      />
    );
  }

  return (
    <>
      <SignupStep2
        onClose={onClose}
        previousStep={previousFromDocs}
        formData={formData}
        updateField={updateField}
        onSubmitRequest={requestSignup}
        loading={loading}
        error={step2Error}
      />

      {showConfirmModal && (
        <InfoModal
          eyebrow="Confirm Signup"
          message="Submit your details for identity verification? You won't be able to change them until an admin reviews your submission."
          error={signupError}
          primaryLabel={loading ? "Submitting…" : "Confirm & Submit"}
          onPrimary={handleSignup}
          secondaryLabel="Cancel"
          onSecondary={() => { setShowConfirmModal(false); setSignupError(null); }}
          disabled={loading}
        />
      )}

      {showSuccessModal && (
        <InfoModal
          eyebrow="Signup Complete"
          message="Your documents have been submitted for review. You'll be able to log in once an admin approves your KYC."
          primaryLabel="Got it"
          onPrimary={handleCloseSuccessModal}
        />
      )}
    </>
  );
}
