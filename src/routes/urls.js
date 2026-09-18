const express = require('express');
const router = express.Router();

const { createShortUrl, getUrls, getUrlStats } = require('../controller/urlsController');

router.post('/', createShortUrl);
router.get('/', getUrls);
router.get('/:code', getUrlStats);

module.exports = router;
