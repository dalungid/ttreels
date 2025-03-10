
**Panduan Penggunaan:**

1. **Install Dependencies:**
```bash
npm install
sudo apt install ffmpeg -y
```

2. **Setup Environment:**
```bash
echo "ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

3. **Jalankan Aplikasi:**
```bash
npm start
```

**Fitur Utama:**
- Dukungan 2 metode download TikTok (API + Puppeteer fallback)
- Auto-modifikasi metadata video
- Enkripsi file temporary
- Manajemen session WhatsApp
- Upload ke Facebook Reels dengan error handling
- Sistem cleanup otomatis

**Catatan:**
- Pastikan server memiliki akses internet stabil
- Untuk performa optimal, gunakan server dengan minimal 2GB RAM
- Update User-Agent secara berkala di `services/tiktok.js`
- Monitor penggunaan storage di folder `temp/`