const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/db');
const urlsRouter = require('./src/routes/urls');
const { redirectUrl } = require('./src/controller/urlsController');
const express = require('express');

const port = process.env.PORT || 3001;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/urls', urlsRouter);

// Local/dev: serve the Vite build from client/dist.
// On Vercel, static files come from /public (CDN) and express.static is ignored.
const clientDist = path.join(__dirname, 'client', 'dist');
if (!process.env.VERCEL && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
} else if (!process.env.VERCEL) {
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'URL shortener API',
      docs: {
        create: 'POST /api/urls { originalUrl }',
        list: 'GET /api/urls',
        stats: 'GET /api/urls/:code',
        redirect: 'GET /:code',
      },
    });
  });
}

app.get('/:code', redirectUrl);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  const message = err.message === 'MONGODB_URI is not set'
    ? 'Database is not configured'
    : 'Server error';
  res.status(500).json({ error: message });
});

module.exports = app;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
