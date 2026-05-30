const fs = require('fs')
const Transcription = require('../models/Transcription')
const { supabase } = require('../config/supabase')

const saveTranscription = async (req, res) => {
  try {
    console.log('Save request body:', req.body)
    const { transcript, language, duration, source, userId } = req.body

    if (!transcript) return res.status(400).json({ error: 'No transcript provided' })
    if (!userId) return res.status(400).json({ error: 'No user ID provided' })

    console.log('Creating record for userId:', userId)
    const wordCount = transcript.trim().split(/\s+/).length
    const record = await Transcription.create({
      userId, transcript, language: language || 'en',
      duration: duration || 0, wordCount,
      source: source || 'recording',
      originalFilename: `${source || 'recording'}-${Date.now()}.webm`
    })
    console.log('Record created:', record._id)
    res.status(201).json({ success: true, data: record })
  } catch (error) {
    console.error('Save error:', error.message)
    res.status(500).json({ error: error.message })
  }
}

const uploadAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' })

    // Use buffer instead of file path (Vercel doesn't have disk access)
    const fileName = `recordings/${Date.now()}-recording.webm`

    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    res.status(200).json({ success: true, audioUrl: publicUrl })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message })
  }
}

const getTranscriptions = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'No user ID provided' })
    const records = await Transcription.find({ userId }).sort({ createdAt: -1 }).limit(50)
    res.status(200).json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteTranscription = async (req, res) => {
  try {
    await Transcription.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { saveTranscription, uploadAudio, getTranscriptions, deleteTranscription }