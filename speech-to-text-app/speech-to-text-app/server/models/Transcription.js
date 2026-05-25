import mongoose from 'mongoose'

const transcriptionSchema = new mongoose.Schema({
  originalFilename: { 
    type: String, 
    required: true 
  },
  transcript: { 
    type: String, 
    required: true 
  },
  audioUrl: { 
    type: String,
    default: ''
  },
  language: { 
    type: String, 
    default: 'en' 
  },
  duration: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    enum: ['recording', 'upload'],
    default: 'recording'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
})

export default mongoose.model('Transcription', transcriptionSchema)