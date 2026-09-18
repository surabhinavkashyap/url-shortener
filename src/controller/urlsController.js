const urlService = require('../services/urlService');

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getBaseUrl() {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3001';
}

function toResponse(url) {
  const baseUrl = getBaseUrl();
  return {
    id: String(url._id),
    originalUrl: url.originalUrl,
    code: url.code,
    shortUrl: `${baseUrl}/${url.code}`,
    clicks: url.clicks,
    createdAt: url.createdAt,
  };
}

async function createShortUrl(req, res) {
  const originalUrl = typeof req.body.originalUrl === 'string'
    ? req.body.originalUrl.trim()
    : '';

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  if (!isHttpUrl(originalUrl)) {
    return res.status(400).json({ error: 'A valid http or https URL is required' });
  }

  try {
    const newUrl = await urlService.createShortUrl(originalUrl);
    res.status(201).json(toResponse(newUrl));
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
}

async function getUrls(req, res) {
  try {
    const urls = await urlService.listUrls(req.query.page, req.query.limit);
    res.status(200).json(urls.map(toResponse));
  } catch (error) {
    console.error('Error listing URLs:', error);
    res.status(500).json({ error: 'Failed to list URLs' });
  }
}

async function getUrlStats(req, res) {
  try {
    const { code } = req.params;
    const url = await urlService.getUrlByCode(code);
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.status(200).json(toResponse(url));
  } catch (error) {
    console.error('Error fetching URL stats:', error);
    res.status(500).json({ error: 'Failed to fetch URL stats' });
  }
}

async function redirectUrl(req, res) {
  try {
    const { code } = req.params;
    const url = await urlService.getUrlByCode(code);
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    await urlService.incrementClicks(url._id);
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { createShortUrl, getUrls, getUrlStats, redirectUrl };
