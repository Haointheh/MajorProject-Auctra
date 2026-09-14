import client from "./client";

// export const apiGetPendingKYc = () => client.get("/admin/kyc/pending");

export const apiGetPendingKYc = () => client.get("/kyc/pending");

export const apiApproveKYC = (kycId) => client.patch(`/kyc/${kycId}/approve`);

export const apiRejectKYC = (kycId) => client.patch(`/kyc/${kycId}/reject`);

export const apiGetAdminDashboard = () => client.get("/admin/dashboard");

export const apiGetAllUsers = () => client.get("/admin/users");

// Backend only forbids blocking another admin (dashboard_routes.py) —
// no role restriction otherwise, so this works for both sellers and
// bidders. Not gated on risk score server-side; that's a judgment call
// left to the admin using the UI.
export const apiBlockUser = (userId) => client.patch(`/admin/users/${userId}/block`);
export const apiUnblockUser = (userId) => client.patch(`/admin/users/${userId}/unblock`);