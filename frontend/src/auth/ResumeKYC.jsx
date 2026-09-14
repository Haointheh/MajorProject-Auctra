import { useEffect, useState } from "react";
import SignupStep2 from "./signup/SignupStep2";
import { apiSubmitKYC, apiGetMyKYC } from "../api/auth";
import { getErrorMessage } from "../utils/getErrorMessage";
import InfoModal from "../ui/InfoModal";

export default function ResumeKYC({ onClose, switchToLogin, resumeToken }) {
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resubmitError, setResubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    dob: "",
    address: "",
    documentType: "",
    documentId: "",
    // Images can't be pre-filled — a browser can't reconstruct a File object
    // from a server path. Leaving these blank and not re-uploading keeps the previously submitted image (the backend falls back to the old file).
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

  // Opens the confirmation step — unlike first-time signup, fields left
  // blank here are intentional (the backend keeps whatever was submitted
  // last time for anything not re-sent), so this doesn't enforce "all
  // fields filled" the way SignupFlow's requestSignup does.
  const requestResubmit = () => {
    setResubmitError(null);
    setShowConfirmModal(true);
  };

  // Confirmation modal's primary action — the actual resubmission.
  const handleResubmit = async () => {
    setLoading(true);
    setResubmitError(null);
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

      setSuccessMessage(res.data?.message || "KYC resubmitted. Awaiting admin approval.");
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setResubmitError(getErrorMessage(error, "Resubmission failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    switchToLogin?.();
  };

  return (
    <>
      <SignupStep2
        onClose={onClose}
        previousStep={switchToLogin}
        formData={formData}
        updateField={updateField}
        onSubmitRequest={requestResubmit}
        loading={loading || prefilling}
      />

      {showConfirmModal && (
        <InfoModal
          eyebrow="Confirm Resubmission"
          message="Resubmit your KYC details for review? You won't be able to change them again until an admin responds."
          error={resubmitError}
          primaryLabel={loading ? "Submitting…" : "Confirm & Resubmit"}
          onPrimary={handleResubmit}
          secondaryLabel="Cancel"
          onSecondary={() => { setShowConfirmModal(false); setResubmitError(null); }}
          disabled={loading}
        />
      )}

      {showSuccessModal && (
        <InfoModal
          eyebrow="Resubmission Complete"
          message={successMessage}
          primaryLabel="Got it"
          onPrimary={handleCloseSuccessModal}
        />
      )}
    </>
  );
}
