import { Icons } from '../components/Icon';
import './HomePage.css';

export default function HomePage({ onSignIn }) {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-mark-fx" />
          <span className="brand-name-fx">Northwind</span>
          <span className="brand-tag">v2.0</span>
        </div>
        <nav className="landing-nav">
          <a href="#portal">Access</a>
          <a href="#features">Systems</a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="pulse-dot" />
            People operations · Live
          </p>
          <h1>
            The future of
            <span className="gradient-text"> workforce intelligence</span>
          </h1>
          <p className="hero-sub">
            Northwind unifies your employee directory, org analytics, and HR command
            center into one precision-built platform.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>01</strong>
              <span>Unified data layer</span>
            </div>
            <div className="hero-stat">
              <strong>02</strong>
              <span>Full CRUD access</span>
            </div>
            <div className="hero-stat">
              <strong>03</strong>
              <span>Encrypted sign-in</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="holo-ring" />
          <div className="holo-core">
            <Icons.pulse size={28} />
          </div>
          <div className="hero-card hero-card-a">
            <Icons.users size={16} />
            <span>Directory</span>
            <em>2.4k nodes</em>
          </div>
          <div className="hero-card hero-card-b">
            <Icons.building size={16} />
            <span>Departments</span>
            <em>8 sectors</em>
          </div>
          <div className="hero-card hero-card-c">
            <Icons.wallet size={16} />
            <span>Compensation</span>
            <em>Live sync</em>
          </div>
        </div>
      </section>

      <section className="portals" id="portal">
        <div className="section-head">
          <span className="section-label">Access gateway</span>
          <h2>Initialize your session</h2>
          <p>Authenticate via work email or secure mobile verification.</p>
        </div>

        <div className="portal-grid">
          <article className="portal-card glass">
            <div className="portal-glow" />
            <div className="portal-icon">
              <Icons.users size={22} />
            </div>
            <h3>Employee directory</h3>
            <p>
              Full lifecycle control — search, create, edit, deactivate, and manage
              employee records across every department.
            </p>
            <ul className="portal-features">
              <li>Real-time directory stream</li>
              <li>Full CRUD operations</li>
              <li>Department analytics</li>
            </ul>
            <button type="button" className="btn-fx employee" onClick={onSignIn}>
              <span>Sign in</span>
              <Icons.chevronRight size={16} />
            </button>
          </article>
        </div>
      </section>

      <section className="features" id="features">
        <div className="feature glass">
          <div className="feature-icon"><Icons.wallet size={18} /></div>
          <div>
            <strong>Compensation matrix</strong>
            <span>Live salary aggregates and department distribution.</span>
          </div>
        </div>
        <div className="feature glass">
          <div className="feature-icon"><Icons.search size={18} /></div>
          <div>
            <strong>Instant retrieval</strong>
            <span>Sub-second search across the entire org graph.</span>
          </div>
        </div>
        <div className="feature glass">
          <div className="feature-icon"><Icons.check size={18} /></div>
          <div>
            <strong>Full management</strong>
            <span>Add, edit, deactivate, and remove employee records.</span>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2026 Northwind Systems</span>
        <span className="footer-status">
          <span className="pulse-dot" /> All systems operational
        </span>
      </footer>
    </div>
  );
}
