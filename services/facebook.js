const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

exports.uploadToReels = async (videoPath, description) => {
  const form = new FormData();
  form.append('access_token', process.env.FB_PAGE_TOKEN);
  form.append('description', description);
  form.append('video_file', fs.createReadStream(videoPath));

  try {
    const response = await axios.post(
      `https://graph-video.facebook.com/v19.0/${process.env.FB_PAGE_ID}/videos`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.FB_PAGE_TOKEN}`
        },
        maxContentLength: Infinity
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    };
  }
};