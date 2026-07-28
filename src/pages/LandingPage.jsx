import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing">
      {/* Taustan hehkut */}
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />

      {/* Animoitu askelpolku taustalla */}
      <svg className="landing-path" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <path
          className="path-line"
          d="M-50,700 Q200,600 350,500 T650,350 T950,200 T1250,80"
          fill="none"
        />
      </svg>

      <div className="landing-content">
        <div className="landing-badge">Kävelypäiväkirja</div>

        <h1 className="landing-title">
          Kilsa<span className="title-accent">mittari</span>
        </h1>

        <p className="landing-punchline">
          Seuraa kävelyäsi ja motivoidu joka kilometristä.
        </p>

        <div className="landing-buttons">
          <Link to="/rekisteroidy" className="btn btn-primary">
            Aloita nyt
          </Link>
        </div>

        <p className="landing-login-hint">
          Onko sinulla jo tili? <Link to="/kirjaudu">Kirjaudu sisään</Link>
        </p>

        {/* Ominaisuudet */}
        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">Merkitse päivä</h3>
            <p className="feature-text">
              Valitse päivä kalenterista ja syötä kilometrit kahden desimaalin
              tarkkuudella.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Näe kehityksesi</h3>
            <p className="feature-text">
              Koonti päivä-, viikko-, kuukausi- ja vuositasolla samalla
              silmäyksellä.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3 className="feature-title">Kerää palkintoja</h3>
            <p className="feature-text">
              Saavuta virstanpylväitä matkan varrella ja pidä motivaatio
              korkealla.
            </p>
          </div>
        </div>

        {/* Palkintopolku */}
        <div className="landing-trophies">
          <p className="trophies-label">Kilometri kerrallaan</p>
          <div className="trophy-track">
            <div className="trophy-step">
              <div className="trophy-dot" />
              <span className="trophy-km">100 km</span>
            </div>
            <div className="trophy-line" />
            <div className="trophy-step">
              <div className="trophy-dot" />
              <span className="trophy-km">200 km</span>
            </div>
            <div className="trophy-line" />
            <div className="trophy-step">
              <div className="trophy-dot" />
              <span className="trophy-km">500 km</span>
            </div>
            <div className="trophy-line" />
            <div className="trophy-step">
              <div className="trophy-dot trophy-dot-gold" />
              <span className="trophy-km trophy-km-gold">1000 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;