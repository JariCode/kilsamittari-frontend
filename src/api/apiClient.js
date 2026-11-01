// API-osoite haetaan envista, ei kovakoodata
const API_URL = import.meta.env.VITE_API_URL;
let csrfTokenPromise;

async function apiFetch(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const muuttaaTilaa = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  let csrfToken;

  if (muuttaaTilaa) {
    if (!csrfTokenPromise) {
      csrfTokenPromise = fetch(`${API_URL}/api/csrf-token`, {
        credentials: 'include'
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'CSRF-tokenin haku epäonnistui');
          }

          if (!data.csrfToken) {
            throw new Error('CSRF-token puuttuu palvelimen vastauksesta');
          }

          return data.csrfToken;
        })
        .catch((error) => {
          csrfTokenPromise = undefined;
          throw error;
        });
    }

    csrfToken = await csrfTokenPromise;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (muuttaaTilaa) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    method,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Pyyntö epäonnistui');
  }

  return data;
}

export default apiFetch;