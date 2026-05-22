import mongoose from 'mongoose'

const transcriptionSchema = new mongoose.Schema({
  originalFilename: { type: String, required: true },
  transcript:       { type: String, required: true },
  audioUrl:         { type: String },
  language:         { type: String, default: 'en' },
  createdAt:        { type: Date, default: Date.now }
})

export default mongoose.model('Transcription', transcriptionSchema)