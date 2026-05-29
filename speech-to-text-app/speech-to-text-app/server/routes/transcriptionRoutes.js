const express = require('express')
const { saveTranscription, uploadAudio, getTranscriptions, deleteTranscription } = require('../controllers/transcriptionController')
const { upload } = require('../middleware/upload')

const router = express.Router()

router.post('/save', saveTranscription)
router.post('/upload-audio', upload.single('audio'), uploadAudio)
router.get('/', getTranscriptions)
router.delete('/:id', deleteTranscription)

module.exports = router