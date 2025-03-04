const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

exports.uploadToReels = async (videoUrl, description) => {
  try {
    // Download video
    const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const tempPath = path.join('temp', `${Date.now()}.mp4`);
    await fs.writeFile(tempPath, response.data);

    // Prepare upload
    const form = new FormData();
    form.append('access_token', process.env.FB_PAGE_TOKEN);
    form.append('description', description);
    form.append('video_file', await fs.readFile(tempPath), 'video.mp4');

    // Upload
    const { data } = await axios.post(
      `https://graph-video.facebook.com/v19.0/${process.env.FB_PAGE_ID}/videos`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.FB_PAGE_TOKEN}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    // Cleanup
    await fs.unlink(tempPath);
    return { success: true, data };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};