// src/pages/admin/AdminUsers.jsx
// Lists every registered account, split by role (Seller / Bidder).
// Expects: GET /admin/users -> UserResponse[] (id, name, email, role,
// kyc_status, created_at). Backend role is "user" for bidders, "seller"
// for sellers — see utils/getRole.js.
//
// Risk score is a placeholder column: the AI scoring model isn't wired up
// yet, so every row just shows "-" until that's integrated. Once the
// backend adds a real field (e.g. `risk_score` / `risk_label` on
// UserResponse), swap RISK_PLACEHOLDER below for the real value.

import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../ui/PageHeader";
import EmptyState from "../../ui/EmptyState";
import { apiGetAllUsers } from "../../api/admin";
import { getErrorMessage } from "../../utils/getErrorMessage";

const RISK_PLACEHOLDER = "-";

const TABS = [
  { key: "seller", label: "Sellers", backendRole: "seller" },
  { key: "bidder", label: "Bidders", backendRole: "user" },
];

function KYCStatusBadge({ status }) {
  const styles = {
    approved: "text-emerald-700 bg-emerald-50",
    pending: "text-amber-700 bg-amber-50",
    rejected: "text-rose-600 bg-rose-50",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest ${styles[status] || "text-slate-500 bg-slate-100"}`}>
      {status || "unknown"}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("seller");

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetAllUsers();
        if (!cancelled) setUsers(res.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load users."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRole = TABS.find((t) => t.key === activeTab)?.backendRole;
  const filteredUsers = useMemo(
    () => users.filter((u) => u.role === activeRole),
    [users, activeRole]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Admin Panel"
        title="All Users"
        subtitle={
          loading
            ? "Loading users…"
            : `${filteredUsers.length} ${activeTab === "seller" ? "seller" : "bidder"}${filteredUsers.length !== 1 ? "s" : ""}`
        }
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Role tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {TABS.map((tab) => (
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
          <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            subtitle={`There are no ${activeTab === "seller" ? "sellers" : "bidders"} to show yet.`}
          />
        ) : (
          !error && (
            <div className="bg-white border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">KYC Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <KYCStatusBadge status={u.kyc_status} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                        {/* AI risk scoring isn't integrated yet — placeholder until then */}
                        <td className="px-4 py-3 text-slate-400">{RISK_PLACEHOLDER}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
