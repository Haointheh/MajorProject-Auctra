export const MOCK_AUTH_USERS = [
  {
    id: 1,
    name: "Seller Demo",
    email: "seller@example.com",
    password: "12345678",
    role: "seller",
    is_seller: true,
    is_admin: false,
    kyc_status: "approved",
  },
  {
    id: 2,
    name: "Admin Demo",
    email: "admin@example.com",
    password: "12345678",
    role: "admin",
    is_seller: false,
    is_admin: true,
    kyc_status: "approved",
  },
  {
    id: 3,
    name: "Buyer Demo",
    email: "buyer@example.com",
    password: "12345678",
    role: "buyer",
    is_seller: false,
    is_admin: false,
    kyc_status: "pending",
  },
];

export function buildMockUser(email, role = "buyer") {
  const existing = MOCK_AUTH_USERS.find((user) => user.email === email);

  if (existing) {
    return {
      ...existing,
      name: existing.name,
      role: existing.role,
      is_seller: existing.is_seller,
      is_admin: existing.is_admin,
      kyc_status: existing.kyc_status,
    };
  }

  return {
    id: Date.now(),
    name: (email || "Mock User").split("@")[0].replace(/[._-]/g, " "),
    email: email || "mock@example.com",
    role,
    is_seller: role === "seller",
    is_admin: role === "admin",
    kyc_status: role === "admin" ? "approved" : "pending",
  };
}
