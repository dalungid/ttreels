const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;

const uploadToReels = async (filePath, description) => {
  try {
    const form = new FormData();
    form.append('access_token', process.env.FB_PAGE_TOKEN);
    form.append('description', description.slice(0, 2200)); // Facebook limit
    form.append('video_file', await fs.readFile(filePath), 'video.mp4');

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

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

module.exports = { uploadToReels };
