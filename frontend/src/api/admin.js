import client from "./client";

// export const apiGetPendingKYc = () => client.get("/admin/kyc/pending");

export const apiGetPendingKYc = () => client.get("/kyc/pending");

export const apiApproveKYC = (kycId) => client.patch(`/kyc/${kycId}/approve`);

export const apiRejectKYC = (kycId) => client.patch(`/kyc/${kycId}/reject`);

// Full platform overview for admin: every auction with seller, bid history,
// and payment status. Used to derive stats on AdminOverview rather than a
// separate pre-aggregated stats endpoint (none exists yet).
export const apiGetAdminDashboard = () => client.get("/admin/dashboard");

export const apiGetAllUsers = () => client.get("/admin/users");