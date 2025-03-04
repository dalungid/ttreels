require('dotenv').config();
const { initWhatsAppBot } = require('./services/whatsapp');
const { cleanup } = require('./utils/security');

const client = initWhatsAppBot();

process.on('SIGINT', async () => {
  console.log('\n🛑 Menghentikan bot...');
  await cleanup();
  await client.destroy();
  process.exit();
});

client.initialize();