import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiFetch from '../api/apiClient.js';
import './ProfilePage.css';

// Silmä-ikoni salasanan näytä/piilota-napille
function SilmaIkoni({ nakyy }) {
  if (nakyy) {
    // Silmä kiinni, viiva päällä
    return (
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
    );
  }

  // Silmä auki
  return (
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
  );
}

function ProfilePage() {
  const navigate = useNavigate();

  // Yhteinen ilmoitus ja virhe
  const [ilmoitus, setIlmoitus] = useState('');
  const [virhe, setVirhe] = useState('');

  // Käyttäjätunnuksen vaihto
  const [uusiTunnus, setUusiTunnus] = useState('');
  const [tunnusSalasana, setTunnusSalasana] = useState('');

  // Salasanan vaihto
  const [nykyinenSalasana, setNykyinenSalasana] = useState('');
  const [uusiSalasana, setUusiSalasana] = useState('');

  // Tuontiavain
  const [onAvain, setOnAvain] = useState(false);
  const [uusiAvain, setUusiAvain] = useState('');
  const [avainKopioitu, setAvainKopioitu] = useState(false);

  // Tilin poisto
  const [poistoSalasana, setPoistoSalasana] = useState('');
  const [poistoAuki, setPoistoAuki] = useState(false);

  // Salasanakenttien näytä/piilota tilat
  const [naytaTunnusSalasana, setNaytaTunnusSalasana] = useState(false);
  const [naytaNykyinen, setNaytaNykyinen] = useState(false);
  const [naytaUusi, setNaytaUusi] = useState(false);
  const [naytaPoisto, setNaytaPoisto] = useState(false);

  // Käyttäjätiedot
  const [kayttaja, setKayttaja] = useState(null);

  // Health-tuonnin url rakennetaan envin osoitteesta
  const tuontiUrl = `${import.meta.env.VITE_API_URL}/api/health`;

// Tarkistetaan onko avain jo luotu ja haetaan käyttäjän tiedot
  useEffect(() => {
    async function haeTiedot() {
      try {
        const kayttajaVastaus = await apiFetch('/api/auth/me');
        setKayttaja(kayttajaVastaus.user);

        const avainVastaus = await apiFetch('/api/profile/import-key');
        setOnAvain(avainVastaus.hasKey);
      } catch (err) {
        setVirhe(err.message);
      }
    }

    haeTiedot();
  }, []);

  // Näyttää ilmoituksen hetken
  function nayta(viesti) {
    setIlmoitus(viesti);
    setVirhe('');
    setTimeout(() => setIlmoitus(''), 3000);
  }

  // Vaihtaa käyttäjätunnuksen
  async function vaihdaTunnus(e) {
    e.preventDefault();
    setVirhe('');

    try {
      await apiFetch('/api/profile/username', {
        method: 'PUT',
        body: JSON.stringify({
          newUsername: uusiTunnus,
          password: tunnusSalasana
        })
      });

      setUusiTunnus('');
      setTunnusSalasana('');
      nayta('Käyttäjätunnus vaihdettu');
    } catch (err) {
      setVirhe(err.message);
    }
  }

  // Vaihtaa salasanan
  async function vaihdaSalasana(e) {
    e.preventDefault();
    setVirhe('');

    try {
      await apiFetch('/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: nykyinenSalasana,
          newPassword: uusiSalasana
        })
      });

      setNykyinenSalasana('');
      setUusiSalasana('');
      nayta('Salasana vaihdettu');
    } catch (err) {
      setVirhe(err.message);
    }
  }

  // Luo uuden tuontiavaimen
  async function luoAvain() {
    setVirhe('');

    try {
      const vastaus = await apiFetch('/api/profile/import-key', {
        method: 'POST'
      });

      setUusiAvain(vastaus.importKey);
      setOnAvain(true);
      setAvainKopioitu(false);
    } catch (err) {
      setVirhe(err.message);
    }
  }

  // Kopioi avaimen leikepöydälle
  async function kopioiAvain() {
    try {
      await navigator.clipboard.writeText(uusiAvain);
      setAvainKopioitu(true);
      setTimeout(() => setAvainKopioitu(false), 2000);
    } catch (err) {
      setVirhe('Kopiointi ei onnistunut, kopioi käsin');
    }
  }

  // Poistaa tilin
  async function poistaTili(e) {
    e.preventDefault();
    setVirhe('');

    try {
      await apiFetch('/api/profile', {
        method: 'DELETE',
        body: JSON.stringify({ password: poistoSalasana })
      });

      // Tili poistettu, ohjataan etusivulle
      navigate('/');
    } catch (err) {
      setVirhe(err.message);
    }
  }

  // Kirjaa käyttäjän ulos
  async function kirjauduUlos() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      navigate('/');
    } catch (err) {
      setVirhe(err.message);
    }
  }

  return (
    <div className="profile">
      {/* Taustan hehkut */}
      <div className="profile-glow profile-glow-1" />
      <div className="profile-glow profile-glow-2" />

      <header className="profile-header">
        <Link to="/paivakirja" className="profile-logo">
          Kilsa<span className="profile-logo-accent">mittari</span>
        </Link>

        <div className="profile-header-right">
          {kayttaja && kayttaja.role === 'admin' && (
            <Link to="/admin" className="profile-admin-link">
              Ylläpito
            </Link>
          )}
          <Link to="/paivakirja" className="profile-back">
            Päiväkirja
          </Link>
          <button className="profile-logout" onClick={kirjauduUlos}>
            Kirjaudu ulos
          </button>
        </div>
      </header>

      <main className="profile-main">
        <h1 className="profile-title">Profiili</h1>

        {ilmoitus && <div className="profile-success">{ilmoitus}</div>}
        {virhe && <div className="profile-error">{virhe}</div>}

        <div className="profile-grid">
          {/* Vasen sarake, profiilin muokkaus */}
          <div className="profile-column">
            {/* Käyttäjätunnuksen vaihto */}
            <div className="profile-card">
              <h2 className="profile-card-title">Vaihda käyttäjätunnus</h2>

              <form onSubmit={vaihdaTunnus} className="profile-form">
                <label className="profile-label">
                  Uusi käyttäjätunnus
                  <input
                    type="text"
                    value={uusiTunnus}
                    onChange={(e) => setUusiTunnus(e.target.value)}
                    className="profile-input"
                    minLength={3}
                    maxLength={20}
                    autoComplete="username"
                    required
                  />
                </label>

                <label className="profile-label">
                  Nykyinen salasana
                  <div className="profile-input-wrap">
                    <input
                      type={naytaTunnusSalasana ? 'text' : 'password'}
                      value={tunnusSalasana}
                      onChange={(e) => setTunnusSalasana(e.target.value)}
                      className="profile-input profile-input-password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="profile-toggle"
                      onClick={() => setNaytaTunnusSalasana(!naytaTunnusSalasana)}
                      aria-label={naytaTunnusSalasana ? 'Piilota salasana' : 'Näytä salasana'}
                      title={naytaTunnusSalasana ? 'Piilota salasana' : 'Näytä salasana'}
                    >
                      <SilmaIkoni nakyy={naytaTunnusSalasana} />
                    </button>
                  </div>
                </label>

                <button type="submit" className="profile-submit">
                  Vaihda käyttäjätunnus
                </button>
              </form>
            </div>

            {/* Salasanan vaihto */}
            <div className="profile-card">
              <h2 className="profile-card-title">Vaihda salasana</h2>

              <form onSubmit={vaihdaSalasana} className="profile-form">
                <label className="profile-label">
                  Nykyinen salasana
                  <div className="profile-input-wrap">
                    <input
                      type={naytaNykyinen ? 'text' : 'password'}
                      value={nykyinenSalasana}
                      onChange={(e) => setNykyinenSalasana(e.target.value)}
                      className="profile-input profile-input-password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="profile-toggle"
                      onClick={() => setNaytaNykyinen(!naytaNykyinen)}
                      aria-label={naytaNykyinen ? 'Piilota salasana' : 'Näytä salasana'}
                      title={naytaNykyinen ? 'Piilota salasana' : 'Näytä salasana'}
                    >
                      <SilmaIkoni nakyy={naytaNykyinen} />
                    </button>
                  </div>
                </label>

                <label className="profile-label">
                  Uusi salasana
                  <div className="profile-input-wrap">
                    <input
                      type={naytaUusi ? 'text' : 'password'}
                      value={uusiSalasana}
                      onChange={(e) => setUusiSalasana(e.target.value)}
                      className="profile-input profile-input-password"
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="profile-toggle"
                      onClick={() => setNaytaUusi(!naytaUusi)}
                      aria-label={naytaUusi ? 'Piilota salasana' : 'Näytä salasana'}
                      title={naytaUusi ? 'Piilota salasana' : 'Näytä salasana'}
                    >
                      <SilmaIkoni nakyy={naytaUusi} />
                    </button>
                  </div>
                </label>

                <p className="profile-hint">
                  Vähintään 8 merkkiä, iso ja pieni kirjain sekä numero
                </p>

                <button type="submit" className="profile-submit">
                  Vaihda salasana
                </button>
              </form>
            </div>

            {/* Tilin poisto */}
            <div className="profile-card profile-card-danger">
              <h2 className="profile-card-title">Poista tili</h2>

              <p className="profile-text">
                Tilin poisto on lopullinen. Kaikki merkintäsi ja kävelytietosi
                poistetaan pysyvästi eikä niitä voi palauttaa.
              </p>

              {!poistoAuki ? (
                <button
                  type="button"
                  className="profile-danger-button"
                  onClick={() => setPoistoAuki(true)}
                >
                  Poista tili
                </button>
              ) : (
                <form onSubmit={poistaTili} className="profile-form">
                  <label className="profile-label">
                    Vahvista salasanalla
                    <div className="profile-input-wrap">
                      <input
                        type={naytaPoisto ? 'text' : 'password'}
                        value={poistoSalasana}
                        onChange={(e) => setPoistoSalasana(e.target.value)}
                        className="profile-input profile-input-password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="profile-toggle"
                        onClick={() => setNaytaPoisto(!naytaPoisto)}
                        aria-label={naytaPoisto ? 'Piilota salasana' : 'Näytä salasana'}
                        title={naytaPoisto ? 'Piilota salasana' : 'Näytä salasana'}
                      >
                        <SilmaIkoni nakyy={naytaPoisto} />
                      </button>
                    </div>
                  </label>

                  <div className="profile-danger-actions">
                    <button
                      type="button"
                      className="profile-cancel"
                      onClick={() => {
                        setPoistoAuki(false);
                        setPoistoSalasana('');
                      }}
                    >
                      Peruuta
                    </button>
                    <button type="submit" className="profile-danger-button">
                      Poista tili lopullisesti
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Oikea sarake, terveystietojen tuonti */}
          <div className="profile-column">
            <div className="profile-card">
              <h2 className="profile-card-title">Terveystietojen tuonti</h2>

              <p className="profile-text">
                Tuo kävelytreenisi automaattisesti iPhonen Terveys-sovelluksesta.
                Tuonti tapahtuu Health Auto Export (JSON+CSV) -sovelluksella,
                jonka saat App Storesta. Luo alla tuontiavain ja syötä tiedot
                sovelluksen automaatioon.
              </p>

              {onAvain && !uusiAvain && (
                <p className="profile-key-status">
                  Tuontiavain on käytössä. Voit luoda uuden, jolloin vanha
                  lakkaa toimimasta.
                </p>
              )}

              {uusiAvain && (
                <div className="profile-key-box">
                  <p className="profile-key-warning">
                    Kopioi avain nyt. Sitä ei näytetä enää tämän jälkeen.
                  </p>
                  <div className="profile-key-row">
                    <code className="profile-key-value">{uusiAvain}</code>
                    <button
                      type="button"
                      className="profile-copy"
                      onClick={kopioiAvain}
                    >
                      {avainKopioitu ? 'Kopioitu' : 'Kopioi'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="profile-submit"
                onClick={luoAvain}
              >
                {onAvain ? 'Luo uusi avain' : 'Luo tuontiavain'}
              </button>

              {/* Ohjeet Health Auto Export -sovellukseen */}
              <div className="profile-instructions">
                <h3 className="profile-instructions-title">
                  Health Auto Export -asetukset
                </h3>

                <div className="profile-setting">
                  <span className="profile-setting-label">Osoite (URL)</span>
                  <code className="profile-setting-value">{tuontiUrl}</code>
                </div>

                <div className="profile-setting">
                  <span className="profile-setting-label">Otsake</span>
                  <code className="profile-setting-value">
                    Content-Type: application/json
                  </code>
                </div>

                <div className="profile-setting">
                  <span className="profile-setting-label">Otsake</span>
                  <code className="profile-setting-value">
                    x-api-key: tuontiavaimesi
                  </code>
                </div>

                <p className="profile-key-note">
                  Tuontiavain on henkilökohtainen. Älä jaa sitä ulkopuolisille.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;