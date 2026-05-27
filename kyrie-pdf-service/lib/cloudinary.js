/**
 * cloudinary.js
 * Uploads the filled PDF to Cloudinary so staff get a permanent link.
 * Reads credentials from the CLOUDINARY_URL env var automatically.
 * If CLOUDINARY_URL is not set, uploads are skipped and the service
 * just returns base64 (n8n can still email/attach it).
 */
const cloudinary = require('cloudinary').v2;

// cloudinary.config() auto-reads process.env.CLOUDINARY_URL

function configured() {
  return !!process.env.CLOUDINARY_URL;
}

function uploadPdf(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', public_id: publicId, overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = { uploadPdf, configured };
