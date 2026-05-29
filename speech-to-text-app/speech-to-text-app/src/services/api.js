import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api/transcriptions`,
  headers: { 'Content-Type': 'application/json' }
})

// Get current user ID
const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || 'anonymous'
}

// Save transcript
export const saveTranscription = async (transcript, language = 'en', duration = 0, source = 'recording') => {
  const userId = await getUserId()
  const response = await api.post('/save', {
    transcript, language, duration, source, userId
  })
  return response.data
}

// Upload audio
export const uploadAudio = async (audioBlob) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  const response = await axios.post(`${API_URL}/api/transcriptions/upload-audio`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Get transcriptions for current user only
export const getTranscriptions = async () => {
  const userId = await getUserId()
  const response = await api.get(`/?userId=${userId}`)
  return response.data
}

// Delete transcription
export const deleteTranscription = async (id) => {
  const response = await api.delete(`/${id}`)
  return response.data
}