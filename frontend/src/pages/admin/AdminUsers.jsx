// import { useEffect, useMemo, useState } from "react";
// import PageHeader from "../../ui/PageHeader";
// import Avatar from "../../ui/Avatar";
// import InfoModal from "../../ui/InfoModal";
// import { apiGetAllUsers, apiBlockUser, apiUnblockUser } from "../../api/admin";
// import { getErrorMessage } from "../../utils/getErrorMessage";
// import DataTable from "../../ui/DataTable";

// const RISK_PLACEHOLDER = "-";

// const TABS = [
//   { key: "seller", label: "Sellers", backendRole: "seller" },
//   { key: "bidder", label: "Bidders", backendRole: "user" },
// ];

// function KYCStatusBadge({ status }) {
//   const styles = {
//     approved: "text-emerald-700 bg-emerald-50",
//     pending: "text-amber-700 bg-amber-50",
//     rejected: "text-rose-600 bg-rose-50",
//   };
//   return (
//     <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest ${styles[status] || "text-slate-500 bg-slate-100"}`}>
//       {status || "unknown"}
//     </span>
//   );
// }

// // Same visual language as BidFeed.jsx's FraudBadge — rose/amber/emerald by
// // severity — so this slots in without a redesign once real scores exist.
// function RiskCell({ score }) {
//   if (score == null) return <span className="text-slate-300">{RISK_PLACEHOLDER}</span>;
//   const color = score >= 70 ? "text-rose-600" : score >= 40 ? "text-amber-600" : "text-emerald-600";
//   return <span className={`font-bold tabular-nums ${color}`}>{score}</span>;
// }

// export default function AdminUsers() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState("seller");

//   // { user, action: "block" | "unblock" } while the confirm modal is open
//   const [pendingAction, setPendingAction] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [actionError, setActionError] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     const loadUsers = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await apiGetAllUsers();
//         if (!cancelled) setUsers(res.data);
//       } catch (err) {
//         if (!cancelled) setError(getErrorMessage(err, "Failed to load users."));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadUsers();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const activeRole = TABS.find((t) => t.key === activeTab)?.backendRole;
//   const filteredUsers = useMemo(
//     () => users.filter((u) => u.role === activeRole),
//     [users, activeRole]
//   );

//   const requestBlock = (user) => {
//     setActionError(null);
//     setPendingAction({ user, action: "block" });
//   };
//   const requestUnblock = (user) => {
//     setActionError(null);
//     setPendingAction({ user, action: "unblock" });
//   };

//   const confirmAction = async () => {
//     if (!pendingAction) return;
//     const { user, action } = pendingAction;
//     setActionLoading(true);
//     setActionError(null);
//     try {
//       if (action === "block") {
//         await apiBlockUser(user.id);
//       } else {
//         await apiUnblockUser(user.id);
//       }

//       // Backend confirmed to only forbid blocking an admin — no reason to
//       // re-fetch the whole list just to flip one flag.
//       setUsers((prev) =>
//         prev.map((u) => (u.id === user.id ? { ...u, is_blocked: action === "block" } : u))
//       );
//       setPendingAction(null);
//     } catch (err) {
//       setActionError(getErrorMessage(err, `Failed to ${action} user.`));
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         eyebrow="Admin Panel"
//         title="All Users"
//         subtitle={
//           loading
//             ? "Loading users…"
//             : `${filteredUsers.length} ${activeTab === "seller" ? "seller" : "bidder"}${filteredUsers.length !== 1 ? "s" : ""}`
//         }
//       />

//       <div className="mx-auto max-w-6xl px-6 py-8">
//         {/* Role tabs */}
//         <div className="flex gap-1 border-b border-slate-200 mb-6">
//           {TABS.map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
//                 activeTab === tab.key
//                   ? "border-slate-900 text-slate-900"
//                   : "border-transparent text-slate-400 hover:text-slate-700"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {error && (
//           <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 mb-6">
//             {error}
//           </div>
//         )}

//         {!error && (
//           <DataTable
//             columns={[
//               { key: "name", label: "Name" },
//               { key: "email", label: "Email" },
//               { key: "kyc", label: "KYC Status" },
//               { key: "joined", label: "Joined" },
//               { key: "risk", label: "Risk", align: "right", className: "text-rose-400" },
//               { key: "action", label: "Action", align: "right" },
//             ]}
//             data={loading ? [] : filteredUsers}
//             emptyTitle={loading ? "Loading users…" : "No users found"}
//             emptySubtitle={
//               loading ? undefined : `There are no ${activeTab === "seller" ? "sellers" : "bidders"} to show yet.`
//             }
//             renderRow={(u) => (
//               <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <Avatar name={u.name} size="xs" />
//                     <span className="font-medium text-slate-900">{u.name}</span>
//                     {u.is_blocked && (
//                       <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5">
//                         Blocked
//                       </span>
//                     )}
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-slate-500">{u.email}</td>
//                 <td className="px-4 py-3">
//                   <KYCStatusBadge status={u.kyc_status} />
//                 </td>
//                 <td className="px-4 py-3 text-slate-500">
//                   {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
//                 </td>
//                 <td className="px-4 py-3 text-right text-xs">
//                   <RiskCell score={u.risk_score} />
//                 </td>
//                 <td className="px-4 py-3 text-right">
//                   {u.is_blocked ? (
//                     <button
//                       onClick={() => requestUnblock(u)}
//                       className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
//                     >
//                       Unblock
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => requestBlock(u)}
//                       className="text-xs font-semibold text-rose-600 hover:text-rose-800"
//                     >
//                       Block
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             )}
//           />
//         )}
//       </div>

//       {pendingAction && (
//         <InfoModal
//           eyebrow={pendingAction.action === "block" ? "Confirm Block" : "Confirm Unblock"}
//           message={
//             pendingAction.action === "block" ? (
//               <>
//                 Block <span className="font-bold text-slate-900">{pendingAction.user.name}</span>?
//                 They won't be able to bid or deposit collateral on any auction until unblocked.
//               </>
//             ) : (
//               <>
//                 Unblock <span className="font-bold text-slate-900">{pendingAction.user.name}</span>?
//                 They'll immediately be able to bid and deposit collateral again.
//               </>
//             )
//           }
//           error={actionError}
//           primaryLabel={actionLoading ? "Working…" : pendingAction.action === "block" ? "Confirm Block" : "Confirm Unblock"}
//           onPrimary={confirmAction}
//           secondaryLabel="Cancel"
//           onSecondary={() => { setPendingAction(null); setActionError(null); }}
//           disabled={actionLoading}
//         />
//       )}
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../ui/PageHeader";
import Avatar from "../../ui/Avatar";
import InfoModal from "../../ui/InfoModal";
import { apiGetAllUsers, apiBlockUser, apiUnblockUser } from "../../api/admin";
import { getErrorMessage } from "../../utils/getErrorMessage";
import DataTable from "../../ui/DataTable";

const RISK_PLACEHOLDER = "-";

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

function RiskCell({ score }) {
  if (score == null) return <span className="text-slate-300">{RISK_PLACEHOLDER}</span>;
  const color = score >= 70 ? "text-rose-600" : score >= 40 ? "text-amber-600" : "text-emerald-600";
  return <span className={`font-bold tabular-nums ${color}`}>{score}</span>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // { user, action: "block" | "unblock" } while the confirm modal is open
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

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

  const filteredUsers = useMemo(
    () => users.filter((u) => u.role === "user"),
    [users]
  );

  const requestBlock = (user) => {
    setActionError(null);
    setPendingAction({ user, action: "block" });
  };
  const requestUnblock = (user) => {
    setActionError(null);
    setPendingAction({ user, action: "unblock" });
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { user, action } = pendingAction;
    setActionLoading(true);
    setActionError(null);
    try {
      if (action === "block") {
        await apiBlockUser(user.id);
      } else {
        await apiUnblockUser(user.id);
      }

      // Backend confirmed to only forbid blocking an admin — no reason to
      // re-fetch the whole list just to flip one flag.
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_blocked: action === "block" } : u))
      );
      setPendingAction(null);
    } catch (err) {
      setActionError(getErrorMessage(err, `Failed to ${action} user.`));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin Panel"
        title="Bidders"
        subtitle={
          loading
            ? "Loading bidders…"
            : `${filteredUsers.length} bidder${filteredUsers.length !== 1 ? "s" : ""}`
        }
      />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 mb-6">
            {error}
          </div>
        )}

        {!error && (
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "kyc", label: "KYC Status" },
              { key: "joined", label: "Joined" },
              { key: "risk", label: "Risk", align: "right", className: "text-rose-400" },
              { key: "action", label: "Action", align: "right" },
            ]}
            data={loading ? [] : filteredUsers}
            emptyTitle={loading ? "Loading bidders…" : "No bidders found"}
            emptySubtitle={loading ? undefined : "There are no bidders to show yet."}
            renderRow={(u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.name} size="xs" />
                    <span className="font-medium text-slate-900">{u.name}</span>
                    {u.is_blocked && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5">
                        Blocked
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <KYCStatusBadge status={u.kyc_status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <RiskCell score={u.risk_score} />
                </td>
                <td className="px-4 py-3 text-right">
                  {u.is_blocked ? (
                    <button
                      onClick={() => requestUnblock(u)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => requestBlock(u)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            )}
          />
        )}
      </div>

      {pendingAction && (
        <InfoModal
          eyebrow={pendingAction.action === "block" ? "Confirm Block" : "Confirm Unblock"}
          message={
            pendingAction.action === "block" ? (
              <>
                Block <span className="font-bold text-slate-900">{pendingAction.user.name}</span>?
                They won't be able to bid or deposit collateral on any auction until unblocked.
              </>
            ) : (
              <>
                Unblock <span className="font-bold text-slate-900">{pendingAction.user.name}</span>?
                They'll immediately be able to bid and deposit collateral again.
              </>
            )
          }
          error={actionError}
          primaryLabel={actionLoading ? "Working…" : pendingAction.action === "block" ? "Confirm Block" : "Confirm Unblock"}
          onPrimary={confirmAction}
          secondaryLabel="Cancel"
          onSecondary={() => { setPendingAction(null); setActionError(null); }}
          disabled={actionLoading}
        />
      )}
    </div>
  );
}