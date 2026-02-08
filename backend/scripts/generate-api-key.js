import crypto from 'crypto';

// Generate a secure random API key
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('\n🔑 Your secure API key:');
console.log(apiKey);
console.log('\nCopy this value to your .env file as API_KEY=<the key above>\n');
