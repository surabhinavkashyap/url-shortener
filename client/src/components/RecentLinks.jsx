import { useState, useMemo } from 'react';
import {
  CheckIcon,
  CopyIcon,
  CursorIcon,
  ExternalIcon,
  RefreshIcon,
  QrCodeIcon,
  CloseIcon,
  SearchIcon,
  ChartBarIcon,
} from './Icons';

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return 'recently';
  }
}

function Row({ item, onSelectQr }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="row">
      <div className="row-main">
        <div className="row-code-line">
          <span className="row-code">
            <span className="slash">/</span>
            {item.code}
          </span>
          <span className="row-time">{formatRelativeTime(item.createdAt)}</span>
        </div>
        <div className="row-url" title={item.originalUrl}>
          <span className="host-pill">{hostOf(item.originalUrl)}</span>
          <span className="original-text">{item.originalUrl}</span>
        </div>
      </div>
      <div className="row-side">
        <span className="clicks" title="Total clicks / redirects tracked">
          <CursorIcon width="13" height="13" />
          <span>{item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}</span>
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onSelectQr(item)}
          title="Show QR code"
        >
          <QrCodeIcon />
        </button>
        <button
          type="button"
          className={`icon-btn ${copied ? 'copied' : ''}`}
          onClick={copy}
          title="Copy short link"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
        <a
          className="icon-btn"
          href={item.shortUrl}
          target="_blank"
          rel="noreferrer"
          title="Visit short link"
        >
          <ExternalIcon />
        </a>
      </div>
    </div>
  );
}

export default function RecentLinks({ items, loading, error, onRefresh }) {
  const [search, setSearch] = useState('');
  const [activeQrItem, setActiveQrItem] = useState(null);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.code?.toLowerCase().includes(q) ||
        item.originalUrl?.toLowerCase().includes(q) ||
        item.shortUrl?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalClicks = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
  }, [items]);

  return (
    <section className="section">
      {/* Top Metric Stats Summary */}
      {items.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap cyan">
              <ChartBarIcon width="18" height="18" />
            </div>
            <div>
              <div className="stat-val">{items.length}</div>
              <div className="stat-lbl">Active Short Links</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap magenta">
              <CursorIcon width="18" height="18" />
            </div>
            <div>
              <div className="stat-val">{totalClicks}</div>
              <div className="stat-lbl">Total Clicks Tracked</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap lime">
              <CheckIcon width="18" height="18" />
            </div>
            <div>
              <div className="stat-val">100%</div>
              <div className="stat-lbl">Redirect Reliability</div>
            </div>
          </div>
        </div>
      )}

      <div className="section-head">
        <div className="section-title-wrap">
          <h2>Recent Links</h2>
          <span className="badge-count">{items.length}</span>
        </div>
        <div className="section-actions">
          {items.length > 2 && (
            <div className="search-wrap">
              <SearchIcon width="14" height="14" className="search-icn" />
              <input
                type="text"
                placeholder="Filter links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshIcon width="14" height="14" className={loading ? 'spinning-icn' : ''} />
            &nbsp;Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="list">
        {loading && items.length === 0 && (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        )}

        {!loading && items.length === 0 && !error && (
          <div className="empty">
            <div className="empty-icon-wrap">
              <ChartBarIcon width="28" height="28" />
            </div>
            <div className="empty-title">No shortened links yet</div>
            <p>Paste any URL above to generate your first trackable short link.</p>
          </div>
        )}

        {!loading && items.length > 0 && filteredItems.length === 0 && (
          <div className="empty">No links matching "{search}".</div>
        )}

        {filteredItems.map((item) => (
          <Row key={item.id || item.code} item={item} onSelectQr={setActiveQrItem} />
        ))}
      </div>

      {/* Global QR Code Modal */}
      {activeQrItem && (
        <div className="modal-backdrop" onClick={() => setActiveQrItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <QrCodeIcon width="18" height="18" />
                <span>QR Code for /{activeQrItem.code}</span>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setActiveQrItem(null)}
              >
                <CloseIcon width="16" height="16" />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-qr-frame">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    activeQrItem.shortUrl
                  )}&color=000000&bgcolor=ffffff`}
                  alt={`QR for ${activeQrItem.shortUrl}`}
                  width="200"
                  height="200"
                />
              </div>
              <div className="modal-short-link">{activeQrItem.shortUrl}</div>
              <p className="modal-caption">
                Scan with any smartphone camera to test the atomic 302 redirect.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
