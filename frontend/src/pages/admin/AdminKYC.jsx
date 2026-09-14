// Approve/Reject call the real endpoints: for KYC reviews
//   GET   /kyc/pending
//   PATCH /kyc/{id}/approve
//   PATCH /kyc/{id}/reject

import { useEffect, useState } from "react";
import PageHeader from "../../ui/PageHeader";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import { apiGetPendingKYc, apiApproveKYC, apiRejectKYC } from "../../api/admin";
import { getErrorMessage } from "../../utils/getErrorMessage";

// Uploaded KYC images are served by the backend's /uploads static mount —
// point at the API origin
const BACKEND_URL = "http://localhost:8000";

function KYCCard({ kyc, onApprove, onReject, busy }) {
  return (
    <div className="bg-white border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold text-slate-900">{kyc.user.name}</p>
          <p className="text-xs text-slate-400">{kyc.user.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Submitted {new Date(kyc.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="primaryBorder" size="xs" disabled={busy} onClick={() => onReject(kyc.id)}>
            Reject
          </Button>
          <Button variant="secondary" size="xs" disabled={busy} onClick={() => onApprove(kyc.id)}>
            Approve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-slate-500">
        <div><span className="font-bold text-slate-700 block">Date of Birth</span>{kyc.date_of_birth}</div>
        <div><span className="font-bold text-slate-700 block">Address</span>{kyc.address}</div>
        <div><span className="font-bold text-slate-700 block">Document Type</span>{kyc.document_type}</div>
        <div><span className="font-bold text-slate-700 block">Document Number</span>{kyc.document_number}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Front</p>
          <a href={`${BACKEND_URL}/${kyc.front_image_path}`} target="_blank" rel="noreferrer">
            <img
              src={`${BACKEND_URL}/${kyc.front_image_path}`}
              alt="ID front"
              className="aspect-video w-full object-cover bg-slate-100 border border-slate-200"
            />
          </a>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Back</p>
          <a href={`${BACKEND_URL}/${kyc.back_image_path}`} target="_blank" rel="noreferrer">
            <img
              src={`${BACKEND_URL}/${kyc.back_image_path}`}
              alt="ID back"
              className="aspect-video w-full object-cover bg-slate-100 border border-slate-200"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

// Backend role is "user" for bidders, "seller" for sellers — see
// utils/getRole.js. KYCResponse nests this at kyc.user.role.
const KYC_TABS = [
  { key: "seller", label: "Sellers", backendRole: "seller" },
  { key: "bidder", label: "Bidders", backendRole: "user" },
];

export default function AdminKYC() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [activeTab, setActiveTab] = useState("seller");

  const loadPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetPendingKYc();
      setPending(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load KYC submissions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (kycId) => {
    setBusyId(kycId);
    try {
      await apiApproveKYC(kycId);
      setPending((prev) => prev.filter((k) => k.id !== kycId));
    } catch (err) {
      alert(getErrorMessage(err, "Failed to approve KYC."));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (kycId) => {
    if (!confirm("Reject this KYC submission?")) return;
    setBusyId(kycId);
    try {
      await apiRejectKYC(kycId);
      setPending((prev) => prev.filter((k) => k.id !== kycId));
    } catch (err) {
      alert(getErrorMessage(err, "Failed to reject KYC."));
    } finally {
      setBusyId(null);
    }
  };

  const activeRole = KYC_TABS.find((t) => t.key === activeTab)?.backendRole;
  const filteredPending = pending.filter((kyc) => kyc.user.role === activeRole);

  return (
    <div>
      <PageHeader
        eyebrow="Admin Panel"
        title="KYC Reviews"
        subtitle={
          loading
            ? "Loading submissions…"
            : `${filteredPending.length} ${activeTab} submission${filteredPending.length !== 1 ? "s" : ""} awaiting review`
        }
      />

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
        {/* Seller / Bidder tabs — approving one role never shows the other
            role's documents, so admins can't accidentally cross-review. */}
        <div className="flex gap-1 border-b border-slate-200">
          {KYC_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && filteredPending.length === 0 && !error ? (
          <EmptyState
            title="All caught up"
            subtitle={`No ${activeTab} KYC submissions are waiting for review.`}
          />
        ) : (
          filteredPending.map((kyc) => (
            <KYCCard
              key={kyc.id}
              kyc={kyc}
              onApprove={handleApprove}
              onReject={handleReject}
              busy={busyId === kyc.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
