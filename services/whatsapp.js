const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { downloadTikTok } = require('./tiktok');
const { uploadToReels } = require('./facebook');
const { processMetadata, cleanupFiles } = require('../utils/metadata');
const { encryptFile } = require('../utils/security');
const fs = require('fs').promises;
const path = require('path');

exports.initWhatsAppBot = () => {
  const client = new Client({
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote'
      ],
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
    },
    session: JSON.parse(process.env.WA_SESSION || 'null')
  });

  client.on('qr', qr => qrcode.generate(qr, { small: true }));
  
  client.on('authenticated', async (session) => {
    try {
      await fs.writeFile('.wwebjs_auth', JSON.stringify(session));
      console.log('✅ Session saved successfully!');
    } catch (error) {
      console.error('❌ Error saving session:', error.message);
    }
  });

  client.on('ready', () => {
    console.log('🤖 Bot siap digunakan!');
    fs.mkdir('temp', { recursive: true });
  });

  client.on('message', async msg => {
    if (!msg.body.startsWith('!s ')) return;

    try {
      const [_, url] = msg.body.split(' ');
      
      // Download TikTok
      const { success: dlSuccess, data: dlData, error: dlError } = await downloadTikTok(url);
      if (!dlSuccess) return msg.reply(`❌ Download gagal: ${dlError}`);
      
      // Process Metadata
      const processedPath = await processMetadata(dlData.videoUrl);
      
      // Upload ke Facebook
      const { success: upSuccess, data: upData, error: upError } = await uploadToReels(
        processedPath,
        dlData.description
      );
      
      // Cleanup
      await cleanupFiles([processedPath]);
      await encryptFile(processedPath);

      // Kirim Hasil
      const message = upSuccess
        ? `✅ Berhasil upload!\nID: ${upData.id}\nDurasi: ${dlData.duration}s`
        : `❌ Upload gagal: ${upError}`;
      
      msg.reply(message);

    } catch (error) {
      console.error('Error:', error);
      msg.reply('⚠️ Terjadi kesalahan sistem');
    }
  });

  return client;
};
