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


