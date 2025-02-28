const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { downloadTikTok } = require('./tiktok');
const { processVideo } = require('../utils/metadata');
const { uploadToReels } = require('./facebook');
const { cleanup, encryptFile } = require('../utils/security');

exports.initWhatsAppBot = () => {
  const client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox']
    }
  });

  client.on('qr', qr => qrcode.generate(qr, { small: true }));

  client.on('authenticated', session => {
    console.log('WhatsApp authenticated!');
  });

  client.on('ready', () => console.log('WhatsApp client ready!'));

  client.on('message', async msg => {
    try {
      if (msg.body.startsWith('!s ')) {
        const url = msg.body.split(' ')[1];
        const downloadResult = await downloadTikTok(url);
        
        if (!downloadResult.success) {
          return msg.reply(`❌ Error: ${downloadResult.error}`);
        }

        const processedPath = await processVideo(downloadResult.data.url);
        const uploadResult = await uploadToReels(processedPath, downloadResult.data.description);
        
        encryptFile(processedPath);
        fs.unlinkSync(processedPath);

        uploadResult.success 
          ? msg.reply('✅ Uploaded successfully!') 
          : msg.reply(`❌ Upload failed: ${uploadResult.error}`);
      }
    } catch (error) {
      msg.reply(`⚠️ System error: ${error.message}`);
    }
  });

  return client;
};