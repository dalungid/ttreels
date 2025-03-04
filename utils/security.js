const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const CryptoJS = require('crypto-js');

exports.encryptFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath);
    const encrypted = CryptoJS.AES.encrypt(
      data.toString('base64'),
      process.env.ENCRYPTION_KEY
    ).toString();
    await fs.writeFile(filePath, encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
  }
};

exports.cleanup = async () => {
  const tempDir = path.join(__dirname, '../temp');
  try {
    const files = await fs.readdir(tempDir);
    await Promise.all(files.map(async file => {
      const filePath = path.join(tempDir, file);
      await this.encryptFile(filePath);
      await fs.unlink(filePath);
    }));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};