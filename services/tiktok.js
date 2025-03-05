const axios = require('axios');
const puppeteer = require('puppeteer');
const { randomBytes } = require('crypto');

const downloadTikTok = async (url) => {
  try {
    // Method 1: API Approach
    const apiResponse = await axios.get(`https://api.tiktokv.com/aweme/v1/feed/?aweme_id=${extractVideoId(url)}`);
    if(apiResponse.data?.aweme_list?.[0]) {
      return {
        success: true,
        data: processApiData(apiResponse.data.aweme_list[0])
      };
    }

    // Method 2: Puppeteer Fallback
    return await puppeteerDownload(url);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const extractVideoId = (url) => {
  const match = url.match(/\d{17,21}/);
  return match ? match[0] : null;
};

const processApiData = (data) => ({
  videoUrl: data.video.play_addr.url_list[0],
  description: data.desc,
  author: data.author.nickname,
  duration: data.duration
});

const puppeteerDownload = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const videoUrl = await page.evaluate(() => 
    document.querySelector('video')?.src
  );
  
  await browser.close();
  
  return {
    videoUrl: videoUrl || '',
    description: 'Auto downloaded video',
    author: 'Unknown',
    duration: 0
  };
};

module.exports = { downloadTikTok };
