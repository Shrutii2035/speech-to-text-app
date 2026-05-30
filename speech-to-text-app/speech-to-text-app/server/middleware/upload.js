const multer = require('multer')

// Use memory storage instead of disk for Vercel
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = [
    'audio/mpeg', 'audio/wav', 'audio/webm',
    'audio/mp4', 'audio/ogg', 'audio/x-m4a',
    'audio/mp3', 'application/octet-stream'
  ]
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
})

module.exports = { upload }