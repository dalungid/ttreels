const { default: axios } = require('axios');
const fetch = require('node-fetch');
const asyncRetry = require('async-retry');
const { randomBytes } = require('crypto');

const _tiktokapi = (Params) => 
  `https://api22-normal-c-useast2a.tiktokv.com/aweme/v1/feed/?${Params}`;

const withParams = (args) => ({
  ...args,
  version_name: "1.1.9",
  version_code: "2018111632",
  build_number: "1.1.9",
  manifest_version_code: "2018111632",
  update_version_code: "2018111632",
  openudid: randomBytes(8).toString('hex'),
  uuid: randomBytes(8).toString('hex'),
  _rticket: Date.now() * 1000,
  ts: Date.now(),
  device_brand: "Google",
  device_type: "Pixel 4",
  device_platform: "android",
  resolution: "1080*1920",
  dpi: 420,
  os_version: "10",
  os_api: "29",
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
  ssmix: "a",
  as: "a1qwert123",
  cp: "cbfhckdckkde1"
});

const parseTiktokData = (data) => {
  const content = data?.aweme_list?.[0];
  if (!content) return null;

  return {
    videoUrl: content.video.play_addr.url_list[0],
    description: content.desc,
    author: content.author.nickname
  };
};

exports.downloadTikTok = async (url) => {
  try {
    const cleanedUrl = url.replace("https://vm", "https://vt");
    const response = await axios.head(cleanedUrl);
    const videoId = response.request.res.responseUrl.match(/\d{17,21}/)?.[0];
``
    if (!videoId) throw new Error('Invalid TikTok URL');

    const data = await asyncRetry(async () => {
      const res = await fetch(_tiktokapi(new URLSearchParams(withParams({ aweme_id: videoId })), {
        headers: {
          "User-Agent": "com.ss.android.ugc.trill/494+Mozilla/5.0+(Linux;+Android+12;+2112123G+Build/SKQ1.211006.001;+wv)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Version/4.0+Chrome/107.0.5304.105+Mobile+Safari/537.36"
        }
      });
      return parseTiktokData(await res.json());
    }, { retries: 3 });

    return {
      success: true,
      data: {
        url: data.videoUrl,
        description: data.description,
        author: data.author
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};