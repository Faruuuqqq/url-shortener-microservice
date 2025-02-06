const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const shortid = require('shortid');
const dns = require('dns');
const db = require('../db/connection');

// Shorten URL
router.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  // Validate URL
  if (!validUrl.isUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Verify URL using DNS lookup
  const urlObj = new URL(originalUrl);
  dns.lookup(urlObj.hostname, async (err) => {
    if (err) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL already exists in the database
    const [existingUrl] = await db.promise().query('SELECT * FROM urls WHERE original_url = ?', [originalUrl]);
    if (existingUrl.length > 0) {
      return res.json(existingUrl[0]);
    }

    // Create short URL
    const shortUrl = shortid.generate();
    const [result] = await db.promise().query(
      'INSERT INTO urls (original_url, short_url) VALUES (?, ?)',
      [originalUrl, shortUrl]
    );

    res.json({ originalUrl, shortUrl });
  });
});

// Redirect to original URL
router.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const [url] = await db.promise().query('SELECT * FROM urls WHERE short_url = ?', [shortUrl]);

  if (url.length > 0) {
    return res.redirect(url[0].original_url);
  } else {
    return res.status(404).json({ error: 'URL not found' });
  }
});

module.exports = router;