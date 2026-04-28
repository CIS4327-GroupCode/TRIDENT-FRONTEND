import { getApiUrl } from "../config/api";

function getAuthHeaders() {
  const token = localStorage.getItem("trident_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export async function searchAdminAuditThreads(query = "", sensitive = "all", limit = 50, offset = 0) {
  const params = new URLSearchParams();

  if (query) params.append("q", query);
  if (sensitive) params.append("sensitive", sensitive);
  if (limit) params.append("limit", String(limit));
  if (offset) params.append("offset", String(offset));

  const response = await fetch(
    getApiUrl(`/admin/chat-audit/threads?${params.toString()}`),
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

export async function getAdminAuditThreadMessages(threadId, limit = 50, before = null) {
  const params = new URLSearchParams();

  if (limit) params.append("limit", String(limit));
  if (before) params.append("before", before);

  const response = await fetch(
    getApiUrl(`/admin/chat-audit/threads/${threadId}/messages?${params.toString()}`),
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}