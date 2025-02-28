const crypto = require('crypto');
const fs = require('fs');

exports.encryptFile = (path) => {
  const data = fs.readFileSync(path);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    Buffer.from(process.env.ENCRYPTION_KEY), iv);
  
  const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]);
  fs.writeFileSync(path, encrypted);
};

exports.cleanup = () => {
  if (fs.existsSync('temp')) {
    fs.readdirSync('temp').forEach(file => {
      exports.encryptFile(`temp/${file}`);
      fs.unlinkSync(`temp/${file}`);
    });
  }
};