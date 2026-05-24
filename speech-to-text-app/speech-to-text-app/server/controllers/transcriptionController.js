import fs from 'fs'
import Transcription from '../models/Transcription.js'
import { supabase } from '../config/supabase.js'

export const saveTranscription = async (req, res) => {
  try {
    const { transcript, language, audioBlob } = req.body

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' })
    }

    // Save to MongoDB
    const record = await Transcription.create({
      originalFilename: `recording-${Date.now()}.webm`,
      transcript,
      language: language || 'en'
    })

    res.status(201).json({ success: true, data: record })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // Upload to Supabase
    const fileBuffer = fs.readFileSync(req.file.path)
    const fileName = `recordings/${req.file.filename}`

    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype
      })

    if (uploadError) throw new Error(uploadError.message)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    // Delete local file
    fs.unlinkSync(req.file.path)

    res.status(200).json({ success: true, audioUrl: publicUrl })

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