async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export function shortenUrl(originalUrl) {
  return request('/api/urls', {
    method: 'POST',
    body: JSON.stringify({ originalUrl }),
  });
}

export function listUrls(limit = 6) {
  return request(`/api/urls?limit=${limit}`);
}

export function getStats(code) {
  return request(`/api/urls/${encodeURIComponent(code)}`);
}
