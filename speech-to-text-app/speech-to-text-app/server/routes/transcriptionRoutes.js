import express from 'express'
import { transcribeAudio, getTranscriptions } from '../controllers/transcriptionController.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/transcribe', upload.single('audio'), transcribeAudio)
router.get('/', getTranscriptions)

export default router  