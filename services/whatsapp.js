const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { downloadTikTok } = require('./tiktok');
const { uploadToReels } = require('./facebook');
const { processMetadata } = require('../utils/metadata');
const { encryptFile, cleanup } = require('../utils/security');
const fs = require('fs').promises;

const initWhatsAppBot = () => {
  const client = new Client({
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ],
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
    }
  });

  client.on('qr', qr => qrcode.generate(qr, { small: true }));

  client.on('authenticated', async (session) => {
    await fs.writeFile('.wwebjs_auth', JSON.stringify(session));
    console.log('✅ Authentication successful!');
  });

  client.on('ready', () => {
    console.log('🚀 Bot is ready!');
    fs.mkdir('temp', { recursive: true });
  });

  client.on('message', async msg => {
    if(!msg.body.startsWith('!s ')) return;

    try {
      const [_, url] = msg.body.split(' ');
      
      // Step 1: Download TikTok
      const { success, data, error } = await downloadTikTok(url);
      if(!success) throw new Error(error);

      // Step 2: Process Metadata
      const processedPath = await processMetadata(data.videoUrl);
      
      // Step 3: Upload to Reels
      const uploadResult = await uploadToReels(processedPath, data.description);
      
      // Step 4: Cleanup
      await encryptFile(processedPath);
      await fs.unlink(processedPath);

      // Send Result
      await msg.reply(uploadResult.success ? 
        `✅ Uploaded successfully!\nID: ${uploadResult.data.id}` : 
        `❌ Upload failed: ${uploadResult.error}`
      );

    } catch (error) {
      await msg.reply(`⚠️ Error: ${error.message}`);
      console.error('System Error:', error);
    }
  });

  return client;
};

module.exports = { initWhatsAppBot };
