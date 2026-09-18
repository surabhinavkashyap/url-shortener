import { useCallback, useEffect, useState } from 'react';
import { listUrls } from './api';
import { LinkIcon, ShieldCheckIcon, SparklesIcon } from './components/Icons';
import ShortenForm from './components/ShortenForm';
import RecentLinks from './components/RecentLinks';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUrls(10);
      setItems(data);
      setOnline(true);
    } catch (err) {
      setError(err.message);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleCreated(created) {
    setItems((prev) => [created, ...prev.filter((p) => p.id !== created.id)].slice(0, 10));
  }

  return (
    <>
      <div className="bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="page">
        <nav className="nav">
          <a className="brand" href="/">
            <span className="brand-mark">
              <LinkIcon stroke="white" />
            </span>
            <span className="brand-name">Snip<span className="brand-dot">.</span>io</span>
          </a>

          <div className="nav-right">
            <div className="status">
              <span
                className={`status-dot ${online === null ? '' : online ? 'online' : 'offline'}`}
              />
              <span className="status-text">
                {online === null ? 'Connecting...' : online ? 'API Live (Node + Mongo)' : 'Server Offline'}
              </span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="nav-gh-pill"
              title="Open Source URL Shortener"
            >
              <span>v1.0 · Production</span>
            </a>
          </div>
        </nav>

        <header className="hero">
          <div className="eyebrow">
            <SparklesIcon width="13" height="13" />
            <span>Modern URL Infrastructure</span>
            <span className="eyebrow-sep">/</span>
            <span>REST API</span>
          </div>
          <h1>
            Shorten links.<br />
            <span className="gradient-text">Track every click.</span>
          </h1>
          <p>
            An ultra-fast, production-grade URL shortening engine built with Node.js, Express,
            and MongoDB. Features atomic click tracking and collision-safe Base62 code generation.
          </p>
        </header>

        <ShortenForm onCreated={handleCreated} />

        <RecentLinks items={items} loading={loading} error={error} onRefresh={refresh} />

        <footer className="footer">
          <div className="footer-specs">
            <span>
              <code>POST /api/urls</code> create
            </span>
            <span>
              <code>GET /:code</code> 302 redirect
            </span>
            <span>
              <code>GET /api/urls/:code</code> stats
            </span>
          </div>
          <div className="footer-credits">
            <span>Engineered with <strong>Node.js</strong> · <strong>Express</strong> · <strong>MongoDB Atlas</strong></span>
          </div>
        </footer>
      </main>
    </>
  );
}
