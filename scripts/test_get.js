const http = require('http');
const url = 'http://localhost:3001/recipes';

http.get(url, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers, null, 2));
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('BODY', data.slice(0, 1000));
  });
}).on('error', (err) => {
  console.error('ERR', err.message);
});
