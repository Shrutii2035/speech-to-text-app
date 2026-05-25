import fs from 'fs'
import Transcription from '../models/Transcription.js'
import { supabase } from '../config/supabase.js'

export const saveTranscription = async (req, res) => {
  try {
    const { transcript, language, duration, source } = req.body

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' })
    }

    // Calculate word count
    const wordCount = transcript.trim().split(/\s+/).length

    const record = await Transcription.create({
      originalFilename: `${source || 'recording'}-${Date.now()}.webm`,
      transcript,
      language: language || 'en',
      duration: duration || 0,
      wordCount,
      source: source || 'recording'
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

    const fileBuffer = fs.readFileSync(req.file.path)
    const fileName = `recordings/${req.file.filename}`

    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype
      })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    fs.unlinkSync(req.file.path)

    res.status(200).json({ success: true, audioUrl: publicUrl })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export const getTranscriptions = async (req, res) => {
  try {
    const records = await Transcription.find()
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.status(200).json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteTranscription = async (req, res) => {
  try {
    await Transcription.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}