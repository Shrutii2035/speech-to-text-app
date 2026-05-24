import { useState } from 'react'
import { uploadAudio, saveTranscription } from '../services/api'

const FileUpload = ({ onTranscriptSaved }) => {
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file) => {
    if (!file) return

    // Check if audio file
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file!')
      return
    }

    try {
      setStatus('uploading')

      // 1. Upload audio to Supabase
      await uploadAudio(file)

      // 2. Mock transcription using Web Speech API
      setStatus('transcribing')
      const mockTranscript = `Transcription of ${file.name}`

      // 3. Save to MongoDB
      await saveTranscription(mockTranscript)
      setTranscript(mockTranscript)
      setStatus('saved')
      onTranscriptSaved?.()

    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📁 Upload Audio File</h2>

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <p className="text-4xl mb-3">🎵</p>
        <p className="text-gray-600 mb-4">
          Drag & drop audio file here or
        </p>
        <label className="cursor-pointer px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all">
          Browse File
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
        <p className="text-xs text-gray-400 mt-3">
          Supports: MP3, WAV, OGG, M4A, WEBM
        </p>
      </div>

      {/* Status */}
      <div className="mt-4">
        {status === 'uploading' && (
          <div className="flex items-center gap-2 text-blue-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
            <span>Uploading audio...</span>
          </div>
        )}
        {status === 'transcribing' && (
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"/>
            <span>Transcribing...</span>
          </div>
        )}
        {status === 'saved' && (
          <div className="text-green-500">✅ Done! {transcript}</div>
        )}
        {status === 'error' && (
          <div className="text-red-500">❌ Error occurred. Try again.</div>
        )}
      </div>
    </div>
  )
}

export default FileUpload