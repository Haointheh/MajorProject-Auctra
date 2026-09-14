// Reusable popup — same overlay pattern as auth/AuthModal.jsx (fixed,centered, dark backdrop, white card). 
//   - Plain info/acknowledgement: just primaryLabel + onPrimary.
//   - Confirm/cancel: also pass secondaryLabel + onSecondary for a second
//     button (e.g. "Cancel"), and `disabled` while an action is in flight.
//
// Usage (info-only):
//   <InfoModal
//     eyebrow="Signup Complete"
//     message="Your documents have been submitted for review..."
//     primaryLabel="Got it"
//     onPrimary={() => setShowInfo(false)}
//   />
//
// Usage (confirm/cancel, e.g. collateral deposit):
//   <InfoModal
//     eyebrow="Confirm Collateral Deposit"
//     message={<>Deposit <strong>{amount}</strong> via <strong>{method}</strong>?</>}
//     error={depositError}
//     primaryLabel={depositing ? "Depositing…" : `Confirm & Pay with ${method}`}
//     onPrimary={onConfirm}
//     secondaryLabel="Cancel"
//     onSecondary={onCancel}
//     disabled={depositing}
//   />

import Button from "./Button";

export default function InfoModal({
  eyebrow,
  message,
  error,
  primaryLabel = "OK",
  onPrimary,
  secondaryLabel,
  onSecondary,
  disabled = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-sm p-6 space-y-4 shadow-xl">
        <div>
          {eyebrow && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {eyebrow}
            </p>
          )}
          <p className="text-sm text-slate-600">{message}</p>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <Button variant="secondary" size="sm" onClick={onPrimary} disabled={disabled}>
            {primaryLabel}
          </Button>
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              disabled={disabled}
              className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-50"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}