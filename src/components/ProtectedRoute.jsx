import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import apiFetch from '../api/apiClient.js';

// Suojaa reitit joihin pääsee vain kirjautuneena
function ProtectedRoute({ children }) {
  const [tila, setTila] = useState('ladataan');

  useEffect(() => {
    // Tarkistetaan onko käyttäjä kirjautunut
    async function tarkistaKirjautuminen() {
      try {
        await apiFetch('/api/auth/me');
        setTila('kirjautunut');
      } catch (err) {
        setTila('ei-kirjautunut');
      }
    }

    tarkistaKirjautuminen();
  }, []);

  if (tila === 'ladataan') {
    return (
      <div className="route-loading">
        <div className="route-spinner" />
      </div>
    );
  }

  if (tila === 'ei-kirjautunut') {
    return <Navigate to="/kirjaudu" replace />;
  }

  return children;
}

export default ProtectedRoute;