import { useState } from 'react';
import { shortenUrl } from '../api';
import { AlertIcon, CheckIcon, CopyIcon, ExternalIcon, QrCodeIcon, CloseIcon, SparklesIcon } from './Icons';

function looksLikeUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ShortenForm({ onCreated }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const trimmed = value.trim();
    setError('');
    setCopied(false);

    if (!trimmed) {
      if (!result) setError('Please enter a destination URL to shorten.');
      return;
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (!looksLikeUrl(withProtocol)) {
      setError('Please provide a valid web URL (e.g. https://github.com).');
      return;
    }

    setLoading(true);
    try {
      const data = await shortenUrl(withProtocol);
      setResult(data);
      setValue('');
      onCreated?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard write failed. Please copy the link manually.');
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setValue(text.trim());
    } catch {
      // browser permission denied or not supported, ignore
    }
  }

  return (
    <div className="card shorten">
      <form className="field" onSubmit={handleSubmit}>
        <div className="field-icon">
          <SparklesIcon width="18" height="18" />
        </div>
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck="false"
          placeholder="Paste long link here (e.g. https://your-portfolio.com/projects)..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          aria-label="Long URL"
        />
        {!value && (
          <button
            type="button"
            className="paste-hint-btn"
            onClick={handlePaste}
            title="Paste from clipboard"
          >
            Paste
          </button>
        )}
        <button className="btn" type="submit" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? 'Shortening...' : 'Shorten Link'}
        </button>
      </form>

      {error ? (
        <div className="error" role="alert">
          <AlertIcon width="16" height="16" />
          <span>{error}</span>
        </div>
      ) : (
        !result && (
          <div className="form-sub-strip">
            <span className="strip-item">✓ High-speed 302 Redirection</span>
            <span className="strip-item">✓ Real-time Click Analytics</span>
            <span className="strip-item">✓ Collision-safe Base62 Engine</span>
          </div>
        )
      )}

      {result && (
        <div className="result" key={result.code}>
          <div className="result-top">
            <span className="result-label">
              <CheckIcon width="14" height="14" /> Link Created &amp; Live
            </span>
            <div className="row-side">
              <button
                type="button"
                className={`btn btn-ghost btn-sm ${copied ? 'copied' : ''}`}
                onClick={copy}
                title="Copy short URL"
              >
                {copied ? <CheckIcon width="14" height="14" /> : <CopyIcon width="14" height="14" />}
                &nbsp;{copied ? 'Copied to Clipboard!' : 'Copy'}
              </button>
              <button
                type="button"
                className={`icon-btn ${showQr ? 'active-qr' : ''}`}
                onClick={() => setShowQr(!showQr)}
                title="Generate QR code"
              >
                <QrCodeIcon />
              </button>
              <a
                className="icon-btn"
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                title="Open short link in new tab"
              >
                <ExternalIcon />
              </a>
            </div>
          </div>

          <div className="result-main-link">
            <a className="short-link" href={result.shortUrl} target="_blank" rel="noreferrer">
              {result.shortUrl.replace(/^https?:\/\//, '')}
            </a>
          </div>

          <span className="original" title={result.originalUrl}>
            <span className="arrow-sym">↳</span> {result.originalUrl}
          </span>

          {showQr && (
            <div className="qr-preview-box">
              <div className="qr-header">
                <span>Instant QR Code</span>
                <button type="button" className="qr-close" onClick={() => setShowQr(false)}>
                  <CloseIcon width="14" height="14" />
                </button>
              </div>
              <div className="qr-img-wrapper">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    result.shortUrl
                  )}&color=000000&bgcolor=ffffff`}
                  alt={`QR code for ${result.shortUrl}`}
                  width="160"
                  height="160"
                  loading="lazy"
                />
              </div>
              <p className="qr-caption">Scan with mobile camera to test instant 302 redirect</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
