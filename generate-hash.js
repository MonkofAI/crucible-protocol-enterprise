const bcrypt = require('bcryptjs');

// This line reads the secret key you provide in the terminal
const secretKey = process.argv[2];

// Error handling if you forget to provide a key
if (!secretKey) {
  console.error('ERROR: Please provide a secret key to hash.');
  console.log('Usage: node generate-hash.js "Kwd9-va7\?4v>-65&g2p=l@qt8zTh0.4aT-dY6*l/9"');
  process.exit(1);
}

// Generate the secure hash
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(secretKey, salt);

// Print the results
console.log('---');
console.log('Your Secret Key:', secretKey);
console.log('Your Bcrypt Hash (for the database):', hash);
console.log('---');