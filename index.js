require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }))

// MIDDLEWARE - Check url exists and is valid
function validateUrl(req, res, next) {
  const urlRegex = /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[0-9a-fA-F]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[0-9a-fA-F]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[0-9a-fA-F]{2})*)?$/;

  if (!req.body.url || !req.body.url.match(urlRegex)) {
    return res.json({ "error": "invalid url" });
  }
  next();
}

// URL MAP
const urlMap = new Map();

// MIDDLEWARE - ADD URL TO MAP
function addToUrlMap(req, res, next) {
  const nextUrlKey = urlMap.size + 1;
  urlMap.set(nextUrlKey, req.body.url);
  req.shortUrlData = { original_url: req.body.url, short_url: nextUrlKey };

  /*   
  console.log(`added url ${req.body.url} to map with key ${nextUrlKey}`);
  console.log(`urlMap: ${[...urlMap.entries()].join('; ')}`);
  console.log(`urlMap size: ${urlMap.size}`); 
  */

  next();
}

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', validateUrl, addToUrlMap, function (req, res) {
  res.json({ original_url: req.body.url, short_url: req.shortUrlData.short_url });
});

app.get('/api/shorturl/:id', function (req, res) {
  const id = parseInt(req.params.id);
  const url = urlMap.get(id);

  console.log(`visiting /api/shorturl/${id}`);

  if (url) {
    console.log(`redirecting to ${url}`);
    res.redirect(url);
  } else {
    res.json({ error: 'invalid url' });
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
