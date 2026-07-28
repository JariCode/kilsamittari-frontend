import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiFetch from '../api/apiClient.js';
import './AdminPage.css';

// Muotoilee aikaleiman suomalaiseen muotoon
function muotoileAika(iso) {
  const pvm = new Date(iso);
  const paiva = String(pvm.getDate()).padStart(2, '0');
  const kuukausi = String(pvm.getMonth() + 1).padStart(2, '0');
  const vuosi = pvm.getFullYear();
  const tunti = String(pvm.getHours()).padStart(2, '0');
  const minuutti = String(pvm.getMinutes()).padStart(2, '0');
  return `${paiva}.${kuukausi}.${vuosi} ${tunti}.${minuutti}`;
}

// Muotoilee viimeisimmän kirjautumisen, tai viivan jos kirjautumista ei ole
function muotoileKirjautuminen(iso) {
  if (!iso) {
    return '–';
  }
  return muotoileAika(iso);
}

// Kertoo onko tili ollut käyttämättä yli neljä kuukautta
// Käyttämättömänä pidetään tiliä johon ei ole kirjauduttu neljään kuukauteen
function onKayttamaton(iso) {
  if (!iso) {
    return false;
  }
  const neljaKuukauttaSitten = new Date();
  neljaKuukauttaSitten.setMonth(neljaKuukauttaSitten.getMonth() - 4);
  return new Date(iso) < neljaKuukauttaSitten;
}

// Muuntaa roolien tekniset nimet suomeksi lokia varten
// Esimerkiksi "admin -> user" muuttuu muotoon "Ylläpitäjä -> Käyttäjä"
function rooliSuomeksi(details) {
  if (!details) {
    return '';
  }

  return details
    .replace('admin', 'Ylläpitäjä')
    .replace('user', 'Käyttäjä');
}

// Muuntaa lokitapahtuman suomenkieliseksi tekstiksi
function lokiTeksti(loki) {
  switch (loki.action) {
    case 'register':
      return `${loki.actorUsername} rekisteröityi`;
    case 'login':
      return `${loki.actorUsername} kirjautui sisään`;
    case 'logout':
      return `${loki.actorUsername} kirjautui ulos`;
    case 'role_change':
      return `${loki.actorUsername} muutti käyttäjän ${loki.targetUsername} roolia (${rooliSuomeksi(loki.details)})`;
    case 'delete_user':
      return `${loki.actorUsername} poisti käyttäjän ${loki.targetUsername}`;
    default:
      return loki.action;
  }
}

// Suodattaa nimilistan hakusanalla
// Tyhjä hakusana palauttaa kaiken, täsmällinen osuma vain sen,
// Muuten kaikki jotka alkavat hakusanalla
function suodataNimet(nimet, haku) {
  const hakuPuhdas = haku.trim().toLowerCase();

  if (!hakuPuhdas) {
    return nimet;
  }

  // Tarkistetaan onko täsmällistä osumaa
  const taysiOsuma = nimet.some(
    (nimi) => nimi.toLowerCase() === hakuPuhdas
  );

  if (taysiOsuma) {
    // Näytetään vain täsmälleen sama nimi
    return nimet.filter((nimi) => nimi.toLowerCase() === hakuPuhdas);
  }

  // Muuten kaikki jotka alkavat hakusanalla
  return nimet.filter((nimi) => nimi.toLowerCase().startsWith(hakuPuhdas));
}

function AdminPage() {
  const navigate = useNavigate();

  const [kayttaja, setKayttaja] = useState(null);
  const [kayttajat, setKayttajat] = useState([]);
  const [lokit, setLokit] = useState([]);
  const [virhe, setVirhe] = useState('');
  const [ilmoitus, setIlmoitus] = useState('');
  const [eiOikeutta, setEiOikeutta] = useState(false);

  // Suodatuskentän hakusana
  const [suodatus, setSuodatus] = useState('');

  // Vahvistusta odottava poisto, säilyttää poistettavan käyttäjän tiedot
  const [poistoKohde, setPoistoKohde] = useState(null);

  // Vahvistusta odottava roolin muutos, säilyttää kohteen tiedot
  const [rooliKohde, setRooliKohde] = useState(null);

  // Haetaan omat tiedot, käyttäjät ja loki sivun latautuessa
  useEffect(() => {
    async function haeTiedot() {
      try {
        // Varmistetaan että kirjautunut käyttäjä on admin
        const minaVastaus = await apiFetch('/api/auth/me');
        setKayttaja(minaVastaus.user);

        if (minaVastaus.user.role !== 'admin') {
          setEiOikeutta(true);
          return;
        }

        await paivitaLista();
      } catch (err) {
        setVirhe(err.message);
      }
    }

    haeTiedot();
  }, []);

  // Hakee tuoreen käyttäjälistan ja lokin
  async function paivitaLista() {
    const kayttajaVastaus = await apiFetch('/api/admin/users');
    setKayttajat(kayttajaVastaus.users);

    const lokiVastaus = await apiFetch('/api/admin/logs');
    setLokit(lokiVastaus.logs);
  }

  // Näyttää ilmoituksen hetken
  function nayta(viesti) {
    setIlmoitus(viesti);
    setVirhe('');
    setTimeout(() => setIlmoitus(''), 3000);
  }

  // Muuttaa käyttäjän roolin vahvistuksen jälkeen
  async function muutaRooli(id, nykyinenRooli) {
    setVirhe('');

    // Vaihdetaan päinvastaiseen rooliin
    const uusiRooli = nykyinenRooli === 'admin' ? 'user' : 'admin';

    try {
      await apiFetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: uusiRooli })
      });

      setRooliKohde(null);
      await paivitaLista();
      nayta('Rooli muutettu');
    } catch (err) {
      setVirhe(err.message);
      setRooliKohde(null);
    }
  }

  // Poistaa käyttäjän vahvistuksen jälkeen
  async function poistaKayttaja(id) {
    setVirhe('');

    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });

      setPoistoKohde(null);
      await paivitaLista();
      nayta('Käyttäjä poistettu');
    } catch (err) {
      setVirhe(err.message);
      setPoistoKohde(null);
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

  // Suodatetaan käyttäjälista hakusanalla
  const kaikkiNimet = kayttajat.map((k) => k.username);
  const nakyvatNimet = suodataNimet(kaikkiNimet, suodatus);
  const suodatetutKayttajat = kayttajat.filter((k) =>
    nakyvatNimet.includes(k.username)
  );

  // Suodatetaan loki samalla logiikalla, kohteena actor ja target
  const suodatetutLokit = lokit.filter((loki) => {
    if (!suodatus.trim()) {
      return true;
    }

    // Kerätään tapahtuman nimet ja katsotaan osuuko suodatus niihin
    const nimet = [loki.actorUsername, loki.targetUsername].filter(Boolean);
    const osuvat = suodataNimet(nimet, suodatus);
    return osuvat.length > 0;
  });

  // Jos ei ole admin, näytetään geneerinen esto
  if (eiOikeutta) {
    return (
      <div className="admin">
        <div className="admin-glow admin-glow-1" />
        <div className="admin-noaccess">
          <h1 className="admin-noaccess-title">Ei käyttöoikeutta</h1>
          <p className="admin-noaccess-text">
            Tämä sivu on vain ylläpitäjille.
          </p>
          <Link to="/paivakirja" className="admin-noaccess-link">
            Takaisin päiväkirjaan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      {/* Taustan hehkut */}
      <div className="admin-glow admin-glow-1" />
      <div className="admin-glow admin-glow-2" />

      <header className="admin-header">
        <Link to="/paivakirja" className="admin-logo">
          Kilsa<span className="admin-logo-accent">mittari</span>
        </Link>

        <div className="admin-header-right">
          <Link to="/paivakirja" className="admin-back">
            Päiväkirja
          </Link>
          {kayttaja && (
            <Link to="/profiili" className="admin-profile-link">
              {kayttaja.username}
            </Link>
          )}
          <button className="admin-logout" onClick={kirjauduUlos}>
            Kirjaudu ulos
          </button>
        </div>
      </header>

      <main className="admin-main">
        <h1 className="admin-title">Ylläpito</h1>

        {ilmoitus && <div className="admin-success">{ilmoitus}</div>}
        {virhe && <div className="admin-error">{virhe}</div>}

        {/* Suodatus */}
        <div className="admin-filter">
          <input
            type="text"
            value={suodatus}
            onChange={(e) => setSuodatus(e.target.value)}
            className="admin-filter-input"
            placeholder="Suodata käyttäjänimellä"
          />
          {suodatus && (
            <button
              type="button"
              className="admin-filter-clear"
              onClick={() => setSuodatus('')}
            >
              Tyhjennä
            </button>
          )}
        </div>

        {/* Käyttäjälista */}
        <div className="admin-card">
          <h2 className="admin-card-title">Käyttäjät</h2>

          {suodatetutKayttajat.length === 0 ? (
            <p className="admin-empty">Ei käyttäjiä hakuehdolla.</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Käyttäjä</th>
                    <th>Rooli</th>
                    <th>Liittynyt</th>
                    <th>Viimeksi kirjautunut</th>
                    <th className="admin-actions-head">Toiminnot</th>
                  </tr>
                </thead>
                <tbody>
                  {suodatetutKayttajat.map((k) => {
                    // Oma tili tunnistetaan käyttäjänimen perusteella
                    const omaTili = kayttaja && k.username === kayttaja.username;

                    return (
                      <tr key={k._id}>
                        <td>
                          {k.username}
                          {omaTili && <span className="admin-you"> (sinä)</span>}
                        </td>
                        <td>
                          <span
                            className={
                              k.role === 'admin'
                                ? 'admin-role admin-role-admin'
                                : 'admin-role'
                            }
                          >
                            {k.role === 'admin' ? 'Ylläpitäjä' : 'Käyttäjä'}
                          </span>
                        </td>
                        <td className="admin-date">{muotoileAika(k.createdAt)}</td>
                        <td
                          className={
                            onKayttamaton(k.lastLogin)
                              ? 'admin-date admin-date-inactive'
                              : 'admin-date'
                          }
                        >
                          {muotoileKirjautuminen(k.lastLogin)}
                        </td>
                        <td className="admin-actions-cell">
                          {omaTili ? (
                            // Omalle tilille ei näytetä toimintoja, vain viiva
                            <span className="admin-self-dash">–</span>
                          ) : (
                            <div className="admin-row-actions">
                              <button
                                className="admin-role-btn"
                                onClick={() => setRooliKohde(k)}
                              >
                                {k.role === 'admin'
                                  ? 'Alenna käyttäjäksi'
                                  : 'Ylennä ylläpitäjäksi'}
                              </button>
                              <button
                                className="admin-delete-btn"
                                onClick={() => setPoistoKohde(k)}
                              >
                                Poista
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* loki */}
        <div className="admin-card">
          <h2 className="admin-card-title">Loki</h2>

          {suodatetutLokit.length === 0 ? (
            <p className="admin-empty">Ei lokitapahtumia.</p>
          ) : (
            <ul className="admin-log-list">
              {suodatetutLokit.map((loki) => (
                <li key={loki._id} className="admin-log-item">
                  <span className="admin-log-text">{lokiTeksti(loki)}</span>
                  <span className="admin-log-time">
                    {muotoileAika(loki.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* poiston vahvistus */}
      {poistoKohde && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Poista käyttäjä</h3>
            <p className="admin-modal-text">
              Haluatko varmasti poistaa käyttäjän {poistoKohde.username}? Kaikki
              hänen kävelytietonsa poistetaan pysyvästi eikä niitä voi
              palauttaa.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-modal-cancel"
                onClick={() => setPoistoKohde(null)}
              >
                Peruuta
              </button>
              <button
                className="admin-modal-confirm"
                onClick={() => poistaKayttaja(poistoKohde._id)}
              >
                Poista lopullisesti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roolin muutoksen vahvistus */}
      {rooliKohde && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-role">
            <h3 className="admin-modal-title">Muuta roolia</h3>
            <p className="admin-modal-text">
              {rooliKohde.role === 'admin'
                ? `Haluatko varmasti alentaa käyttäjän ${rooliKohde.username} tavalliseksi käyttäjäksi?`
                : `Haluatko varmasti ylentää käyttäjän ${rooliKohde.username} ylläpitäjäksi? Ylläpitäjä voi hallita kaikkia käyttäjiä.`}
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-modal-cancel"
                onClick={() => setRooliKohde(null)}
              >
                Peruuta
              </button>
              <button
                className="admin-modal-role-confirm"
                onClick={() => muutaRooli(rooliKohde._id, rooliKohde.role)}
              >
                {rooliKohde.role === 'admin' ? 'Alenna käyttäjäksi' : 'Ylennä ylläpitäjäksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;