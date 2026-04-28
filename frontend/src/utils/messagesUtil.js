import { getApiUrl } from "../config/api";

function getAuthHeaders() {
  const token = localStorage.getItem("trident_token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export async function getThreads() {
  const response = await fetch(getApiUrl("/messages/threads"), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function getThreadMessages(threadId, limit = 30, before = null) {
  const params = new URLSearchParams();

  if (limit) params.append("limit", String(limit));
  if (before) params.append("before", before);

  const response = await fetch(
    getApiUrl(`/messages/threads/${threadId}/messages?${params.toString()}`),
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

export async function sendThreadMessage(threadId, body, attachments = []) {
  const response = await fetch(getApiUrl(`/messages/threads/${threadId}/messages`), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ body, attachments }),
  });

  return handleResponse(response);
}

export async function markThreadRead(threadId) {
  const response = await fetch(getApiUrl(`/messages/threads/${threadId}/read`), {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createDirectThread(otherUserId, isSensitive = false) {
  const response = await fetch(getApiUrl("/messages/threads/direct"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ otherUserId, isSensitive }),
  });

  return handleResponse(response);
}

export async function createGroupThread(name, participantIds, isSensitive = false) {
  const response = await fetch(getApiUrl("/messages/threads/group"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, participantIds, isSensitive }),
  });

  return handleResponse(response);
}

export async function getUnreadTotal() {
  const response = await fetch(getApiUrl("/messages/unread"), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function uploadMessageFile(file) {
  const token = localStorage.getItem("trident_token");
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(getApiUrl("/messages/upload"), {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse(response);
}

export async function searchChatUsers(query) {
  const response = await fetch(
    getApiUrl(`/users/search/chat-users?q=${encodeURIComponent(query)}`),
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}