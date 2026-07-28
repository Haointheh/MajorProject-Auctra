import { useState } from "react";
import SignupStep1 from "./SignupStep1";
import SignupStepOTP from "./SignupStepOTP";
import SignupStep2 from "./SignupStep2";
import { apiRequestSignupOTP, apiVerifySignupOTP, apiResumeKYC, apiSubmitKYC } from "../../api/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";

// 1 = basic info, "otp" = email verification, 2 = KYC documents.
// The account isn't actually created until step "otp" succeeds — /signup/request
// just emails a code and holds the details server-side for 10 minutes.
export default function SignupFlow({ onClose, switchToLogin }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step1Error, setStep1Error] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [otp, setOtp] = useState("");

  // Set once /signup/verify succeeds — used to fetch the kyc_pending token
  // via /kyc/resume (verify creates the account but doesn't hand back a
  // token itself).
  const [kycPendingToken, setKycPendingToken] = useState(null);

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

  // OTP step -> verify (this is what actually creates the account), then
  // immediately fetch a kyc_pending token so step 2 can submit documents.
  const handleVerifyOtp = async () => {
    setOtpError(null);
    setLoading(true);
    try {
      await apiVerifySignupOTP({ email: formData.email, otp });

      const resumeRes = await apiResumeKYC({
        email: formData.email,
        password: formData.password,
      });
      setKycPendingToken(resumeRes.data.access_token);
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
    } catch (error) {
      setOtpError(getErrorMessage(error, "Couldn't resend code."));
    } finally {
      setResending(false);
    }
  };

  const previousFromOtp = () => setStep(1);
  const previousFromDocs = () => setStep("otp");

  // Step 2 -> submit KYC documents using the token fetched after verify.
  const handleSignup = async () => {
    setLoading(true);
    try {
      const kycForm = new FormData();
      kycForm.append("date_of_birth", formData.dob);
      kycForm.append("address", formData.address);
      kycForm.append("document_type", formData.documentType);
      kycForm.append("document_number", formData.documentId);
      kycForm.append("front_image", formData.frontImage);
      kycForm.append("back_image", formData.backImage);

      await apiSubmitKYC(kycForm, kycPendingToken);

      alert(
        "Signup successful! Your documents have been submitted for review. " +
          "You'll be able to log in once an admin approves your KYC."
      );
      switchToLogin?.();
    } catch (error) {
      alert(getErrorMessage(error, "Signup failed"));
    } finally {
      setLoading(false);
    }
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
    <SignupStep2
      onClose={onClose}
      previousStep={previousFromDocs}
      formData={formData}
      updateField={updateField}
      handleSignup={handleSignup}
      loading={loading}
    />
  );
}
