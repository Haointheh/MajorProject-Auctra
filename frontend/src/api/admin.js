import client from "./client";

// export const apiGetPendingKYc = () => client.get("/admin/kyc/pending");

export const apiGetPendingKYc = () => client.get("/kyc/pending");

export const apiApproveKYC = (kycId) => client.patch(`/kyc/${kycId}/approve`);

export const apiRejectKYC = (kycId) => client.patch(`/kyc/${kycId}/reject`);