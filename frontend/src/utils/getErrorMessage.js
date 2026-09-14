// FastAPI returns `detail` as a plain string for HTTPException(detail="...")
// but as an ARRAY of {type, loc, msg, input} objects for 422 validation
// errors (e.g. a missing/malformed field). Rendering that array directly
// as `{err.response.data.detail}` crashes React ("Objects are not valid as
// a React child"). Always go through this instead of reading
// err.response.data.detail directly.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;

  if (!detail) return err?.message || fallback;
  if (typeof detail === "string") return detail;

  // Pydantic/FastAPI validation errors: [{type, loc, msg, input}, ...]
  if (Array.isArray(detail)) {
    const messages = detail
      .map((d) => (typeof d === "string" ? d : d?.msg))
      .filter(Boolean);
    return messages.length ? messages.join(" ") : fallback;
  }

  return fallback;
}
