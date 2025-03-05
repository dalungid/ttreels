const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { randomBytes } = require('crypto');

const processMetadata = (inputPath) => new Promise((resolve, reject) => {
  const outputPath = path.join('temp', `processed_${randomBytes(4).toString('hex')}.mp4`);
  
  ffmpeg(inputPath)
    .outputOptions([
      '-metadata', 'title=User Generated Content',
      '-metadata', 'artist=TikTok User',
      '-metadata', 'comment=Created with Filmora',
      '-map_metadata', '-1',
      '-c:v', 'copy',
      '-c:a', 'copy'
    ])
    .on('end', () => resolve(outputPath))
    .on('error', reject)
    .save(outputPath);
});

module.exports = { processMetadata };
