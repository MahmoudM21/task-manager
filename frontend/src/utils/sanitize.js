// Trim whitespace from all string values in an object
export function sanitizeFormData(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k, typeof v === 'string' ? v.trim() : v,
    ])
  );
}

// Check if a string is empty after trimming
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

// Truncate for display safety (not security, just UX)
export function truncate(str, maxLen = 200) {
  if (!str) return '';
  return str.trim().slice(0, maxLen);
}
