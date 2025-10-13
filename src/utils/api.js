import { API_BASE_URL } from '../config';

export async function postJson(path, body, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (data?.message || 'Request failed') : res.statusText;
    throw new Error(message);
  }
  return data;
}

export async function getJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (data?.message || 'Request failed') : res.statusText;
    throw new Error(message);
  }
  return data;
}

export async function deleteJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  if (res.status === 204) return {};
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (data?.message || 'Request failed') : res.statusText;
    throw new Error(message);
  }
  return data;
}

export async function putJson(path, body, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (data?.message || 'Request failed') : res.statusText;
    throw new Error(message);
  }
  return data;
}

/**
 * Send email using SendGrid API
 * @param {Object} emailData - Email details
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text content (optional)
 * @param {string} emailData.html - HTML content (optional)
 * @param {string} emailData.from - Sender email (optional, uses default from backend)
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response from email API
 */
export async function sendEmail(emailData, options = {}) {
  return postJson('/email/send', emailData, options);
}


