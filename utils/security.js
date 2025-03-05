const crypto = require('crypto');
const fs = require('fs').promises;
const CryptoJS = require('crypto-js');

const encryptFile = async (filePath) => {
  const data = await fs.readFile(filePath);
  const encrypted = CryptoJS.AES.encrypt(
    data.toString('base64'), 
    process.env.ENCRYPTION_KEY
  ).toString();
  await fs.writeFile(filePath, encrypted);
};

const cleanup = async () => {
  try {
    const files = await fs.readdir('temp');
    await Promise.all(files.map(async file => {
      const filePath = path.join('temp', file);
      await encryptFile(filePath);
      await fs.unlink(filePath);
    }));
  } catch (error) {
    if(error.code !== 'ENOENT') throw error;
  }
};

module.exports = { encryptFile, cleanup };
