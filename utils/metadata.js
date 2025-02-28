const ffmpeg = require('fluent-ffmpeg');
const { randomBytes } = require('crypto');

exports.processVideo = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = `temp/${randomBytes(8).toString('hex')}_processed.mp4`;
    
    ffmpeg(inputPath)
      .outputOptions([
        '-metadata', `title=UGC_${Date.now()}`,
        '-metadata', 'software=FilmoraPro',
        '-metadata', 'artist=User Generated Content',
        '-map_metadata', '-1',
        '-vf', 'noise=alls=20:allf=t',
        '-c:v', 'libx264',
        '-preset', 'fast'
      ])
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
};