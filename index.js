require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = [];
let idCounter = 1;

// POST: Shorten a URL
app.post('/api/shorturl', (req, res) => {
    let originalUrl = req.body.url;

    if (!/^https?:\/\//.test(originalUrl)) {
        return res.json({ error: 'invalid url' });
    }

    try {
        const parsedUrl = new URL(originalUrl);

        dns.lookup(parsedUrl.hostname, (err) => {
            if (err) {
                return res.json({ error: 'invalid url' });
            }

            const existingEntry = urlDatabase.find(entry => entry.original_url === originalUrl);
            if (existingEntry) {
                return res.json(existingEntry);
            }

            const shortUrl = idCounter++;
            const newEntry = { original_url: originalUrl, short_url: shortUrl };
            urlDatabase.push(newEntry);

            res.json(newEntry);
        });
    } catch (error) {
        return res.json({ error: 'invalid url' });
    }
});

// GET: Redirect to the original URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
    const shortUrl = parseInt(req.params.shortUrl);
    const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

    if (urlEntry) {
        return res.redirect(urlEntry.original_url);
    } else {
        return res.json({ error: 'No short URL found' });
    }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
