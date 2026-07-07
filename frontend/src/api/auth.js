// // src/api/auth.js
// // This mock layer preserves the same API shape used by the frontend so the
// // backend can be swapped in later without changing the screens.

// import { buildMockUser, MOCK_AUTH_USERS } from "../data/mockAuth";

// const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// export const apiSignup = async (data) => {
//   await wait(500);
//   const role = data?.role || "buyer";
//   const email = data?.email || `${data?.name || "mock"}@example.com`;

//   return {
//     data: {
//       user: buildMockUser(email, role),
//       access_token: `mock-${role}-token`,
//       token_type: "bearer",
//     },
//   };
// };

// export const apiSubmitKYC = async (formData) => {
//   await wait(400);
//   return { data: { success: true, message: "Mock KYC submission accepted." } };
// };

// export const apiLogin = async (data) => {
//   await wait(500);
//   const matchedUser = MOCK_AUTH_USERS.find((user) => user.email === data?.email);
//   const role = matchedUser?.role || "buyer";

//   return {
//     data: {
//       user: buildMockUser(data?.email, role),
//       access_token: `mock-${role}-token`,
//       token_type: "bearer",
//     },
//   };
// };


// src/api/auth.js
// Real calls to the FastAPI backend (see backend/auth_routes.py, kyc_routes.py).
import client from "./client";

export const apiSignup = (data) =>
  client.post("/signup", {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role, // "user" | "seller"
  });

export const apiLogin = (data) =>
  client.post("/login", {
    email: data.email,
    password: data.password,
  });

// KYC must be submitted with the short-lived "kyc_pending" token returned by
// /signup — pass it in explicitly rather than relying on whatever is
// currently stored as the logged-in session token.
export const apiSubmitKYC = (formData, kycPendingToken) =>
  client.post("/kyc/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${kycPendingToken}`,
    },
  });