const http = require('http');
const urls = ['http://localhost:3000/', 'http://localhost:3000/static/js/bundle.js'];

function fetch(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

(async () => {
  for (const u of urls) {
    console.log('\nFETCH', u);
    const r = await fetch(u);
    if (r.error) {
      console.error('ERROR', r.error);
      continue;
    }
    console.log('STATUS', r.status);
    console.log('CONTENT-TYPE', r.headers['content-type']);
    console.log('LENGTH', r.body.length);
    console.log('SNIPPET:\n', r.body.slice(0, 1000));
    if (u.endsWith('bundle.js')) {
      console.log('\nSEARCH for "backend:3001" =>', r.body.includes('backend:3001'));
    }
  }
})();
