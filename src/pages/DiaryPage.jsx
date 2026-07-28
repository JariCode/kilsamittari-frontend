import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import { Finnish } from 'flatpickr/dist/l10n/fi.js';
import 'flatpickr/dist/flatpickr.min.css';
import apiFetch from '../api/apiClient.js';
import './DiaryPage.css';

// Muotoilee päivämäärän muotoon VVVV-KK-PP paikallisesta ajasta
function muotoilePaiva(pvm) {
  const vuosi = pvm.getFullYear();
  const kuukausi = String(pvm.getMonth() + 1).padStart(2, '0');
  const paiva = String(pvm.getDate()).padStart(2, '0');
  return `${vuosi}-${kuukausi}-${paiva}`;
}

// Muotoilee kilometrit suomalaiseen muotoon pilkulla
function muotoileKm(luku) {
  return luku.toFixed(2).replace('.', ',');
}

function DiaryPage() {
  const [kayttaja, setKayttaja] = useState(null);
  const [valittuPaiva, setValittuPaiva] = useState(new Date());
  const [kmSyote, setKmSyote] = useState('');
  const [merkinnat, setMerkinnat] = useState([]);
  const [koonnit, setKoonnit] = useState(null);
  const [keskiarvot, setKeskiarvot] = useState(null);
  const [palkinnot, setPalkinnot] = useState([]);
  const [virhe, setVirhe] = useState('');
  const [ilmoitus, setIlmoitus] = useState('');
  const [tallennetaan, setTallennetaan] = useState(false);
  const navigate = useNavigate();

  // Haetaan käyttäjän tiedot ja merkinnät sivun latautuessa
  useEffect(() => {
    async function haeTiedot() {
      try {
        const kayttajaVastaus = await apiFetch('/api/auth/me');
        setKayttaja(kayttajaVastaus.user);

        const dataVastaus = await apiFetch('/api/walks');
        setMerkinnat(dataVastaus.merkinnat);
        setKoonnit(dataVastaus.koonnit);
        setKeskiarvot(dataVastaus.keskiarvot);
        setPalkinnot(dataVastaus.palkinnot);
      } catch (err) {
        setVirhe(err.message);
      }
    }

    haeTiedot();
  }, []);

  // Hakee tuoreet tiedot palvelimelta
  async function paivitaTiedot() {
    const dataVastaus = await apiFetch('/api/walks');
    setMerkinnat(dataVastaus.merkinnat);
    setKoonnit(dataVastaus.koonnit);
    setKeskiarvot(dataVastaus.keskiarvot);
    setPalkinnot(dataVastaus.palkinnot);
  }

  // Päivittää syöttökentän arvon ja sallii vain numerot, pilkun ja pisteen
  function kasitteleKmMuutos(e) {
    const arvo = e.target.value;

    if (arvo === '' || /^\d{0,3}([,.]\d{0,2})?$/.test(arvo)) {
      setKmSyote(arvo);
    }
  }

  // Tallentaa merkinnän
  async function tallenna(e) {
    e.preventDefault();
    setVirhe('');
    setIlmoitus('');

    // Pilkku muutetaan pisteeksi jotta luku kelpaa
    const kilometrit = Number(kmSyote.replace(',', '.'));

    if (kmSyote === '' || Number.isNaN(kilometrit)) {
      setVirhe('Syötä kilometrit');
      return;
    }

    setTallennetaan(true);

    try {
      await apiFetch('/api/walks', {
        method: 'POST',
        body: JSON.stringify({
          date: muotoilePaiva(valittuPaiva),
          km: kilometrit
        })
      });

      await paivitaTiedot();

      setKmSyote('');
      setIlmoitus('Merkintä tallennettu');

      // Ilmoitus katoaa hetken kuluttua
      setTimeout(() => setIlmoitus(''), 2500);
    } catch (err) {
      setVirhe(err.message);
    } finally {
      setTallennetaan(false);
    }
  }

  // Poistaa päivän kaikki merkinnät
  async function poistaPaiva(paiva) {
    setVirhe('');

    try {
      await apiFetch(`/api/walks/${paiva}`, { method: 'DELETE' });
      await paivitaTiedot();
    } catch (err) {
      setVirhe(err.message);
    }
  }

  // Poistaa yksittäisen merkinnän
  async function poistaMerkinta(id) {
    setVirhe('');

    try {
      await apiFetch(`/api/walks/merkinta/${id}`, { method: 'DELETE' });
      await paivitaTiedot();
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

  // Seuraava avaamaton palkinto edistymispalkkia varten
  const seuraavaPalkinto = palkinnot.find((p) => !p.avattu);
  const edistyminen = seuraavaPalkinto && koonnit
    ? Math.min(100, (koonnit.yhteensa / seuraavaPalkinto.raja) * 100)
    : 100;

  // Suurin keskiarvo, jonka mukaan palkkien leveydet suhteutetaan
  const suurinKeskiarvo = keskiarvot
    ? Math.max(keskiarvot.viikko, keskiarvot.kuukausi, keskiarvot.vuosi, 0.01)
    : 0.01;

  return (
    <div className="diary">
      {/* Taustan hehkut */}
      <div className="diary-glow diary-glow-1" />
      <div className="diary-glow diary-glow-2" />

      <header className="diary-header">
        <span className="diary-logo">
          Kilsa<span className="diary-logo-accent">mittari</span>
        </span>

        <div className="diary-header-right">
          {kayttaja && kayttaja.role === 'admin' && (
            <Link to="/admin" className="diary-admin-link">
              Ylläpito
            </Link>
          )}
          {kayttaja && (
            <Link to="/profiili" className="diary-user-link">
              {kayttaja.username}
            </Link>
          )}
          <button className="diary-logout" onClick={kirjauduUlos}>
            Kirjaudu ulos
          </button>
        </div>
      </header>

      <main className="diary-main">
        {virhe && <div className="diary-error">{virhe}</div>}

        <div className="diary-grid">
          {/* Vasen palsta, syöttö ja merkinnät */}
          <section className="diary-column">
            <div className="diary-card">
              <h2 className="card-title">Merkitse kävely</h2>

              <form onSubmit={tallenna} className="entry-form">
                <label className="entry-label">
                  Päivämäärä
                  <Flatpickr
                    value={valittuPaiva}
                    onChange={([pvm]) => setValittuPaiva(pvm)}
                    options={{
                      locale: Finnish,
                      dateFormat: 'd.m.Y',
                      maxDate: 'today'
                    }}
                    render={({ defaultValue }, ref) => (
                      <input
                        ref={ref}
                        defaultValue={defaultValue}
                        className="entry-input"
                        readOnly
                        placeholder="Valitse päivä"
                      />
                    )}
                  />
                </label>

                <label className="entry-label">
                  Kilometrit
                  <div className="entry-km-wrap">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={kmSyote}
                      onChange={kasitteleKmMuutos}
                      className="entry-input entry-input-km"
                      placeholder="0,00"
                    />
                    <span className="entry-km-unit">km</span>
                  </div>
                </label>

                <button
                  type="submit"
                  className="entry-submit"
                  disabled={tallennetaan}
                >
                  {tallennetaan ? 'Tallennetaan...' : 'Tallenna'}
                </button>

                {ilmoitus && <p className="entry-success">{ilmoitus}</p>}
              </form>
            </div>

            <div className="diary-card">
              <h2 className="card-title">Merkinnät</h2>

              {merkinnat.length === 0 ? (
                <p className="empty-text">
                  Ei vielä merkintöjä. Aloita ensimmäisestä kävelystäsi.
                </p>
              ) : (
                <ul className="entry-list">
                  {merkinnat.map((merkinta) => (
                    <li key={merkinta.date} className="entry-item">
                      <div className="entry-row">
                        <span className="entry-date">
                          {merkinta.date.split('-').reverse().join('.')}
                        </span>
                        <span className="entry-km">
                          {muotoileKm(merkinta.km)} km
                        </span>
                        <button
                          className="entry-delete"
                          onClick={() => poistaPaiva(merkinta.date)}
                          aria-label="Poista päivän merkinnät"
                          title="Poista päivän merkinnät"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          </svg>
                        </button>
                      </div>

                      {/* Päivän osamerkinnät näkyvät jos niitä on useampi */}
                      {merkinta.osat.length > 1 && (
                        <ul className="entry-parts">
                          {merkinta.osat.map((osa) => (
                            <li key={osa._id} className="entry-part">
                              <span className="entry-part-km">
                                {muotoileKm(osa.km)} km
                              </span>
                              <button
                                className="entry-part-delete"
                                onClick={() => poistaMerkinta(osa._id)}
                                aria-label="Poista merkintä"
                                title="Poista tämä merkintä"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Oikea palsta, koonnit, keskiarvot ja palkinnot */}
          <section className="diary-column">
            <div className="diary-card diary-card-highlight">
              <h2 className="card-title">Koonti</h2>

              {koonnit && (
                <>
                  {/* Iso kokonaislukema */}
                  <div className="total-hero">
                    <span className="total-hero-label">Kilometrejä yhteensä</span>
                    <span className="total-hero-value">
                      {muotoileKm(koonnit.yhteensa)}
                      <span className="total-hero-unit">km</span>
                    </span>
                  </div>

                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Tänään</span>
                      <span className="summary-value">
                        {muotoileKm(koonnit.paiva)}
                        <span className="summary-unit">km</span>
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-label">Tämä viikko</span>
                      <span className="summary-value">
                        {muotoileKm(koonnit.viikko)}
                        <span className="summary-unit">km</span>
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-label">Tämä kuukausi</span>
                      <span className="summary-value">
                        {muotoileKm(koonnit.kuukausi)}
                        <span className="summary-unit">km</span>
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-label">Tämä vuosi</span>
                      <span className="summary-value">
                        {muotoileKm(koonnit.vuosi)}
                        <span className="summary-unit">km</span>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="diary-card">
              <h2 className="card-title">Päivittäinen keskiarvo</h2>

              {keskiarvot && (
                <div className="average-list">
                  <div className="average-row">
                    <span className="average-label">Tämä viikko</span>
                    <div className="average-bar">
                      <div
                        className="average-fill average-fill-week"
                        style={{
                          width: `${(keskiarvot.viikko / suurinKeskiarvo) * 100}%`
                        }}
                      />
                    </div>
                    <span className="average-value">
                      {muotoileKm(keskiarvot.viikko)} km
                    </span>
                  </div>

                  <div className="average-row">
                    <span className="average-label">Tämä kuukausi</span>
                    <div className="average-bar">
                      <div
                        className="average-fill average-fill-month"
                        style={{
                          width: `${(keskiarvot.kuukausi / suurinKeskiarvo) * 100}%`
                        }}
                      />
                    </div>
                    <span className="average-value">
                      {muotoileKm(keskiarvot.kuukausi)} km
                    </span>
                  </div>

                  <div className="average-row">
                    <span className="average-label">Tämä vuosi</span>
                    <div className="average-bar">
                      <div
                        className="average-fill average-fill-year"
                        style={{
                          width: `${(keskiarvot.vuosi / suurinKeskiarvo) * 100}%`
                        }}
                      />
                    </div>
                    <span className="average-value">
                      {muotoileKm(keskiarvot.vuosi)} km
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="diary-card">
              <h2 className="card-title">Palkinnot</h2>

              {seuraavaPalkinto && koonnit && (
                <div className="progress-wrap">
                  <div className="progress-text">
                    <span>Seuraava: {seuraavaPalkinto.raja} km</span>
                    <span>
                      {muotoileKm(
                        Math.max(0, seuraavaPalkinto.raja - koonnit.yhteensa)
                      )}{' '}
                      km jäljellä
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${edistyminen}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="trophy-grid">
                {palkinnot.map((palkinto) => (
                  <div
                    key={palkinto.raja}
                    className={
                      palkinto.avattu
                        ? 'trophy-item trophy-item-unlocked'
                        : 'trophy-item'
                    }
                  >
                    <span className="trophy-icon">
                      {palkinto.avattu ? '🏆' : '🔒'}
                    </span>
                    <span className="trophy-value">{palkinto.raja} km</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DiaryPage;