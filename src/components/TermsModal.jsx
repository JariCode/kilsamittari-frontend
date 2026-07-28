import './LegalModal.css';

// Käyttöehdot-ikkuna, joka avautuu linkistä
// Sulkeutuu taustaa tai sulkupainiketta painamalla
function TermsModal({ onClose }) {
  // Estetään klikkauksen läpimeno sisällöstä taustalle
  function estaSulku(e) {
    e.stopPropagation();
  }

  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-modal" onClick={estaSulku}>
        <button className="legal-close" onClick={onClose} aria-label="Sulje">
          ×
        </button>

        <h2 className="legal-title">Käyttöehdot</h2>
        <p className="legal-updated">Päivitetty 28.7.2026</p>

        <div className="legal-content">
          <h3>Palvelun kuvaus</h3>
          <p>
            Kilsamittari on kävelypäiväkirja, johon voit kirjata kävelemäsi
            kilometrit ja seurata edistymistäsi. Palvelu on opiskelijaprojekti
            ja tarjotaan maksutta.
          </p>

          <h3>Käyttäjätili</h3>
          <p>
            Käyttäjätili on henkilökohtainen. Olet vastuussa tunnuksesi ja
            salasanasi säilyttämisestä. Älä luovuta tunnuksiasi tai
            tuontiavaintasi ulkopuolisille.
          </p>

          <h3>Palvelun käyttö</h3>
          <p>
            Palvelua tulee käyttää lain ja hyvän tavan mukaisesti. Häiritsevä,
            haitallinen tai muulla tavoin sopimaton toiminta voi johtaa
            käyttäjätilin sulkemiseen.
          </p>

          <h3>Käyttämättömät tilit</h3>
          <p>
            Pitkään käyttämättömät tilit voidaan poistaa. Käyttämättömänä
            pidetään tiliä, johon ei ole kirjauduttu neljään kuukauteen.
            Palvelussa ei ole salasanan palautusta, joten jos unohdat
            salasanasi, sinun tulee luoda uusi tili.
          </p>

          <h3>Tilin poisto</h3>
          <p>
            Voit poistaa oman tilisi ja kaikki kävelytietosi milloin tahansa
            profiilisivulta. Poisto on pysyvä eikä sitä voi perua.
          </p>

          <h3>Vastuunrajaus</h3>
          <p>
            Palvelu tarjotaan sellaisena kuin se on, ilman takuita
            virheettömyydestä tai keskeytyksettömästä toiminnasta. Ylläpito ei
            vastaa palvelun käytöstä mahdollisesti aiheutuvista vahingoista.
          </p>

          <h3>Muutokset ehtoihin</h3>
          <p>
            Ylläpitäjä voi päivittää käyttöehtoja tarvittaessa. Suosittelemme
            tarkistamaan ehdot säännöllisesti.
          </p>

          <h3>Sovellettava laki</h3>
          <p>Näihin käyttöehtoihin sovelletaan Suomen lainsäädäntöä.</p>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;
