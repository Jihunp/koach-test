const fs = require('fs');
const crypto = require('crypto');

// Generate a random 64-byte secret and convert it to a hexadecimal string
const secretKey = crypto.randomBytes(64).toString('hex');

// Define the content to write to the .env file
const envContent = `JWT_SECRET=${secretKey}\n`;

// Write the content to a .env file
fs.writeFile('.env', envContent, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
  } else {
    console.log('JWT secret key generated and written to .env file');
  }
});
