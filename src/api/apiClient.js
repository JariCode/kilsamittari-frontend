// API-osoite haetaan envista, ei kovakoodata
const API_URL = import.meta.env.VITE_API_URL;

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Pyyntö epäonnistui');
  }

  return data;
}

export default apiFetch;