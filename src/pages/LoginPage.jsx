import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiFetch from '../api/apiClient.js';
import TermsModal from '../components/TermsModal.jsx';
import PrivacyModal from '../components/PrivacyModal.jsx';
import './AuthPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Kumpi laki-ikkuna on auki, tai null jos molemmat kiinni
  const [avoinLaki, setAvoinLaki] = useState(null);
  const navigate = useNavigate();

  // Lomakkeen lähetys
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      // Kirjautuminen onnistui, siirrytään päiväkirjaan
      navigate('/paivakirja');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Taustan hehkut */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      {/* Animoitu askelpolku taustalla */}
      <svg className="auth-path" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <path
          className="auth-path-line"
          d="M-50,700 Q200,600 350,500 T650,350 T950,200 T1250,80"
          fill="none"
        />
      </svg>

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          Kilsa<span className="auth-logo-accent">mittari</span>
        </Link>

        <h1 className="auth-title">Tervetuloa takaisin</h1>
        <p className="auth-subtitle">Kirjaudu jatkaaksesi matkaasi</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Käyttäjätunnus
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              autoComplete="username"
              required
            />
          </label>

          <label className="auth-label">
            Salasana
            {/* Kentän ympärille kääre, jotta nappi saadaan sisälle */}
            <div className="auth-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input auth-input-password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Piilota salasana' : 'Näytä salasana'}
                title={showPassword ? 'Piilota salasana' : 'Näytä salasana'}
              >
                {showPassword ? (
                  /* Silmä kiinni, viiva päällä */
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Silmä auki */
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
          </button>
        </form>

        <p className="auth-switch">
          Ei vielä tiliä? <Link to="/rekisteroidy">Rekisteröidy tästä</Link>
        </p>

        <p className="legal-links">
          <button type="button" onClick={() => setAvoinLaki('terms')}>
            Käyttöehdot
          </button>
          <span className="legal-links-erotin">·</span>
          <button type="button" onClick={() => setAvoinLaki('privacy')}>
            Tietosuojaseloste
          </button>
        </p>
      </div>

      {avoinLaki === 'terms' && <TermsModal onClose={() => setAvoinLaki(null)} />}
      {avoinLaki === 'privacy' && <PrivacyModal onClose={() => setAvoinLaki(null)} />}
    </div>
  );
}

export default LoginPage;