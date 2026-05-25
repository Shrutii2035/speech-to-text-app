import express from 'express'
import { 
  saveTranscription, 
  uploadAudio,
  getTranscriptions,
  deleteTranscription
} from '../controllers/transcriptionController.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/save', saveTranscription)
router.post('/upload-audio', upload.single('audio'), uploadAudio)
router.get('/', getTranscriptions)
router.delete('/:id', deleteTranscription)

export default router