import './LegalModal.css';

// Tietosuojaseloste-ikkuna, joka avautuu linkistä
// Sulkeutuu taustaa tai sulkupainiketta painamalla
function PrivacyModal({ onClose }) {
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

        <h2 className="legal-title">Tietosuojaseloste</h2>
        <p className="legal-updated">Päivitetty 28.7.2026</p>

        <div className="legal-content">
          <p>
            Tämä seloste kertoo, miten henkilötietojasi käsitellään EU:n
            yleisen tietosuoja-asetuksen (GDPR) ja Suomen tietosuojalain
            mukaisesti.
          </p>

          <h3>Rekisterinpitäjä</h3>
          <p>
            Kilsamittari on opiskelijaprojekti. Yhteyttä palveluun liittyvissä
            tietosuoja-asioissa voi ottaa osoitteeseen jaricode@elisanet.fi.
          </p>

          <h3>Mitä tietoja kerätään</h3>
          <p>
            Käyttäjätunnus ja salasana suojattuna, ei koskaan selkokielisenä.
            Kävelymerkinnät eli päivämäärät ja kilometrit. Jos otat käyttöön
            Terveys-tuonnin, tallennamme iPhonen Terveys-sovelluksesta tuodut
            kävelytiedot samalla tavalla, sekä tuontiavaimen suojattuna.
            Lisäksi tallennamme viimeisimmän kirjautumisaikasi.
          </p>

          <h3>Käsittelyn peruste</h3>
          <p>
            Tietoja käsitellään käyttäjätilin luomiseksi ja palvelun
            tarjoamiseksi eli sopimuksen täytäntöönpanemiseksi. Tietoja
            käytetään ainoastaan kirjautumiseen ja kävelypäiväkirjan
            toimintaan. Tietoja ei käytetä mainontaan eikä niitä luovuteta
            kolmansille osapuolille.
          </p>

          <h3>Loki</h3>
          <p>
            Palvelu tallentaa lokiin tapahtumia, kuten rekisteröinnit,
            kirjautumiset, uloskirjautumiset ja ylläpidon tekemät muutokset.
            Loki sisältää käyttäjänimiä ja tapahtuman ajankohdan, ja sitä
            käytetään palvelun turvallisuuden varmistamiseen. Lokitiedot
            poistetaan automaattisesti, kun ne ovat 12 kuukautta vanhoja.
          </p>

          <h3>Evästeet</h3>
          <p>
            Palvelu käyttää yhtä teknistä evästettä, joka pitää sinut
            kirjautuneena. Sitä ei pääse lukemaan sivuston ulkopuolelta, eikä
            sitä käytetä seurantaan tai mainontaan. Sivustolla ei ole seuranta-
            eikä mainosevästeitä.
          </p>

          <h3>Tietojen säilytysaika</h3>
          <p>
            Käyttäjätietosi ja kävelymerkintäsi säilytetään niin kauan kuin
            käyttäjätilisi on olemassa. Kun poistat tilisi, käyttäjätietosi ja
            kävelymerkintäsi poistetaan pysyvästi. Pitkään käyttämättömät tilit
            voidaan poistaa, kun tiliin ei ole kirjauduttu neljään kuukauteen.
            Lokitiedot poistetaan automaattisesti 12 kuukauden kuluttua.
          </p>

          <h3>Oikeutesi</h3>
          <p>
            Sinulla on oikeus tarkastaa itseäsi koskevat tiedot, oikaista
            virheelliset tiedot ja poistaa tilisi. Voit poistaa tilisi ja
            kaikki tietosi itse profiilisivulta. Sinulla on myös oikeus tehdä
            valitus tietosuojavaltuutetun toimistolle, jos katsot että
            tietojasi käsitellään lainvastaisesti.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;
