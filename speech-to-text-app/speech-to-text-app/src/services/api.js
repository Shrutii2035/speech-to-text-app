import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api/transcriptions`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Save transcript text to MongoDB
export const saveTranscription = async (transcript, language = 'en', duration = 0, source = 'recording') => {
  const response = await api.post('/save', { 
    transcript, 
    language, 
    duration,
    source
  })
  return response.data
}

// Upload audio file to Supabase
export const uploadAudio = async (audioBlob) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  
  const response = await axios.post(`${API_URL}/api/transcriptions/upload-audio`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Get all transcriptions
export const getTranscriptions = async () => {
  const response = await api.get('/')
  return response.data
}

// Delete a transcription
export const deleteTranscription = async (id) => {
  const response = await api.delete(`/${id}`)
  return response.data
}