// import React from 'react'

// const AdminKYC = () => {
//   return (
//     <div>AdminKYC</div>
//   )
// }

// export default AdminKYC

// src/pages/admin/AdminKYC.jsx
// Lists pending KYC submissions. Approve/Reject call the real endpoints:
//   PATCH /kyc/{id}/approve
//   PATCH /kyc/{id}/reject
// GET /kyc/pending already exists in your backend — wire that in for the list.

import { useState } from "react";
import PageHeader from "../../ui/PageHeader";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";

// Mock — replace with: client.get('/kyc/pending')
const MOCK_PENDING_KYC = [
  {
    id: 101,
    date_of_birth: "1995-03-12",
    address: "Baneshwor, Kathmandu",
    front_image_path: "/uploads/kyc/14_front.jpg",
    back_image_path: "/uploads/kyc/14_back.jpg",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: { id: 14, name: "Bishal Khadka", email: "bishal@example.com" },
  },
  {
    id: 102,
    date_of_birth: "1990-11-02",
    address: "Lakeside, Pokhara",
    front_image_path: "/uploads/kyc/15_front.jpg",
    back_image_path: "/uploads/kyc/15_back.jpg",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    user: { id: 15, name: "Sarita Adhikari", email: "sarita@example.com" },
  },
];

function KYCCard({ kyc, onApprove, onReject }) {
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
          <Button variant="primaryBorder" size="xs" onClick={() => onReject(kyc.id)}>
            Reject
          </Button>
          <Button variant="secondary" size="xs" onClick={() => onApprove(kyc.id)}>
            Approve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-slate-500">
        <div><span className="font-bold text-slate-700 block">Date of Birth</span>{kyc.date_of_birth}</div>
        <div><span className="font-bold text-slate-700 block">Address</span>{kyc.address}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Front</p>
          <div className="aspect-video bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
            {kyc.front_image_path.split("/").pop()}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Back</p>
          <div className="aspect-video bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
            {kyc.back_image_path.split("/").pop()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminKYC() {
  const [pending, setPending] = useState(MOCK_PENDING_KYC);
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (kycId) => {
    setLoadingId(kycId);
    try {
      // TODO: await client.patch(`/kyc/${kycId}/approve`)
      await new Promise((r) => setTimeout(r, 400));
      setPending((prev) => prev.filter((k) => k.id !== kycId));
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (kycId) => {
    if (!confirm("Reject this KYC submission?")) return;
    setLoadingId(kycId);
    try {
      // TODO: await client.patch(`/kyc/${kycId}/reject`)
      await new Promise((r) => setTimeout(r, 400));
      setPending((prev) => prev.filter((k) => k.id !== kycId));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin Panel"
        title="KYC Reviews"
        subtitle={`${pending.length} submission${pending.length !== 1 ? "s" : ""} awaiting review`}
      />

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
        {pending.length === 0 ? (
          <EmptyState title="All caught up" subtitle="No KYC submissions are waiting for review." />
        ) : (
          pending.map((kyc) => (
            <KYCCard key={kyc.id} kyc={kyc} onApprove={handleApprove} onReject={handleReject} />
          ))
        )}
      </div>
    </div>
  );
}