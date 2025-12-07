// src/utils/apiUtils.js
export const normalize = (res, fallback = {}) => res?.data ?? fallback;

export function normalizeArrayResponse(res) {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (payload == null) return [];
  if (Array.isArray(payload.elections)) return payload.elections;
  if (Array.isArray(payload.items)) return payload.items;
  const arr = Object.values(payload).find((v) => Array.isArray(v));
  return Array.isArray(arr) ? arr : [];
}
