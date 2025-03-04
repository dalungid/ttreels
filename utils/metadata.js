const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

exports.processMetadata = (inputPath) => new Promise((resolve, reject) => {
  const outputFile = `processed_${crypto.randomBytes(4).toString('hex')}.mp4`;
  const outputPath = path.join('temp', outputFile);

  ffmpeg(inputPath)
    .outputOptions([
      '-metadata', 'title=User Generated Content',
      '-metadata', 'artist=TikTok User',
      '-metadata', 'compatible_brands=mp42',
      '-metadata', 'creation_time=' + new Date().toISOString(),
      '-map_metadata', '-1',
      '-vf', 'noise=alls=20:allf=t',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23'
    ])
    .on('end', () => resolve(outputPath))
    .on('error', reject)
    .save(outputPath);
});

exports.cleanupFiles = async (files) => {
  await Promise.all(
    files.map(async file => {
      if (await fs.stat(file).catch(() => null)) {
        await fs.unlink(file);
      }
    })
  );
};