// src/utils/getRole.js
// Single source of truth for mapping a backend User object to a frontend role.
// Backend roles are "user" | "seller" | "admin" (see backend/model.py -> User.role).
// The frontend labels "user" as "buyer" everywhere in the UI/copy.
//
// Used by: ProfilePage, UserMenu, CategoryPage, AuctionDetailPage.
// For guest (logged-out) handling, callers combine this with isAuthenticated
// themselves — this helper always returns a role for a *user object*, and
// falls back to "buyer" if none is passed (kept for back-compat with the
// places that called the old local copies of this function).
export default function getRole(user) {
  if (!user) return "buyer";
  if (user.is_admin || user.role === "admin") return "admin";
  if (user.is_seller || user.role === "seller") return "seller";
  return "buyer";
}
