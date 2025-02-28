require('dotenv').config();
const { initWhatsAppBot } = require('./services/whatsapp');
const { cleanup } = require('./utils/security');

// Initialize WhatsApp client
const client = initWhatsAppBot();

// Cleanup on exit
process.on('SIGINT', () => {
  cleanup();
  client.destroy();
  process.exit();
});

// Start bot
client.initialize();