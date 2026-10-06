const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

async function main() {
  const attrs = [
    { name: 'commonName', value: '10.50.69.6' },
    { name: 'organizationName', value: 'FinEdge Dev SSL' },
    { name: 'countryName', value: 'IN' }
  ];

  const options = {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '10.50.69.6' },
          { type: 7, ip: '0.0.0.0' }
        ]
      }
    ]
  };

  console.log('Generating SSL key & certificate...');
  const pki = await selfsigned.generate(attrs, options);

  const sslDir = path.join(__dirname, '..', 'ssl');
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
  }

  fs.writeFileSync(path.join(sslDir, 'server.key'), pki.private);
  fs.writeFileSync(path.join(sslDir, 'server.crt'), pki.cert);

  console.log('✓ SSL Certificate & Private Key generated successfully in frontend/ssl/');
  console.log('  Key:  frontend/ssl/server.key');
  console.log('  Cert: frontend/ssl/server.crt');
}

main().catch(err => {
  console.error('Error generating SSL:', err);
  process.exit(1);
});
