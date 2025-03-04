const axios = require('axios');
const fetch = require('node-fetch');
const asyncRetry = require('async-retry');
const crypto = require('crypto');
const puppeteer = require('puppeteer');

const TIKTOK_API_ENDPOINT = 'https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/';
const USER_AGENT = 'com.zhiliaoapp.musically/2023900030 (Linux; U; Android 13; en-US; Mi 10 Build/TQ2A.230405.003.E1)';

const generateDeviceParams = () => ({
  version_name: "2.9.9",
  version_code: "290909",
  build_number: "2.9.9",
  manifest_version_code: "2022909090",
  openudid: crypto.randomBytes(8).toString('hex'),
  uuid: crypto.randomBytes(8).toString('hex'),
  _rticket: Date.now() * 1000,
  ts: Date.now(),
  device_brand: "Xiaomi",
  device_type: "Mi 10",
  device_platform: "android",
  resolution: "1080*1920",
  dpi: 440,
  os_version: "13",
  os_api: "33",
  carrier_region: "US",
  sys_region: "US",
  region: "US",
  app_name: "trill",
  app_language: "en",
  language: "en",
  timezone_name: "America/New_York",
  timezone_offset: "-14400",
  channel: "googleplay",
  ac: "wifi",
  mcc_mnc: "310260",
  is_my_cn: 0,
  aid: 1180,
  ssmix: "c",
  as: "a1qwert369",
  cp: "cbfhckdckkde9"
});

const parseTiktokData = (data) => {
  const content = data?.aweme_list?.[0];
  if (!content) return null;

  return {
    videoUrl: content.video.play_addr.url_list[0],
    description: content.desc,
    author: content.author.nickname,
    duration: content.duration
  };
};

const fetchTiktokData = async (videoId) => {
  let result;
  await asyncRetry(async () => {
    const params = new URLSearchParams({
      ...generateDeviceParams(),
      aweme_id: videoId
    });
    
    const res = await fetch(`${TIKTOK_API_ENDPOINT}?${params}`, {
      headers: { "User-Agent": USER_AGENT }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    result = parseTiktokData(data);
    if (!result) throw new Error('Invalid TikTok data');
  }, { retries: 3 });

  return result;
};

const puppeteerDownload = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const videoUrl = await page.evaluate(() => 
    document.querySelector('video')?.src
  );
  
  await browser.close();
  return videoUrl || Promise.reject('Video not found');
};

exports.downloadTikTok = async (url) => {
  try {
    const cleanUrl = url.replace("https://vm", "https://vt");
    const response = await axios.head(cleanUrl);
    const videoId = response.request.res.responseUrl.match(/\d{17,21}/)?.[0];
    
    return videoId 
      ? { success: true, data: await fetchTiktokData(videoId) }
      : { success: false, error: 'Invalid URL format' };
      
  } catch (error) {
    console.log('Falling back to Puppeteer...');
    try {
      const videoUrl = await puppeteerDownload(url);
      return {
        success: true,
        data: {
          videoUrl,
          description: 'Auto downloaded video',
          author: 'Unknown',
          duration: 0
        }
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};