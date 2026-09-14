import Button from "../ui/Button";

export default function CollateralConfirmModal({
  amount,
  paymentLabel,
  depositing,
  depositError,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-sm p-6 space-y-4 shadow-xl">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Confirm Collateral Deposit
          </p>

          <p className="text-sm text-slate-600">
            Deposit{" "}
            <span className="font-bold text-slate-900">{amount}</span> via{" "}
            <span className="font-bold text-slate-900">{paymentLabel}</span>?
            This collateral is locked to this auction and refunded automatically
            if you don't win.
          </p>
        </div>

        {depositError && (
          <p className="text-sm text-rose-600">
            {depositError}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfirm}
            disabled={depositing}
          >
            {depositing
              ? "Depositing…"
              : `Confirm & Pay with ${paymentLabel}`}
          </Button>

          <button
            type="button"
            onClick={onCancel}
            disabled={depositing}
            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}