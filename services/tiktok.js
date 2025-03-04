async function puppeteerDownload(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ],
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const videoUrl = await page.evaluate(() => 
    document.querySelector('video')?.src
  );
  
  await browser.close();
  return videoUrl || Promise.reject('Video not found');
}
