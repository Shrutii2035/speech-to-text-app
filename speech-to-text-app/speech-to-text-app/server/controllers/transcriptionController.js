import OpenAI from 'openai'
import fs from 'fs'
import Transcription from '../models/Transcription.js'

let openai

export const transcribeAudio = async (req, res) => {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // Send audio to OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: req.body.language || 'en'
    })

    // Save result to MongoDB
    const record = await Transcription.create({
      originalFilename: req.file.originalname,
      transcript: transcription.text,
      language: req.body.language || 'en'
    })

    // Delete local file after transcription
    fs.unlinkSync(req.file.path)

    res.status(201).json({ success: true, data: record })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export const getTranscriptions = async (req, res) => {
  try {
    const records = await Transcription.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}