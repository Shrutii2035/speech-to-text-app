import { useState, useRef } from 'react'
import { saveTranscription, uploadAudio } from '../services/api'

const AudioRecorder = ({ onTranscriptSaved }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
const transcriptRef = useRef('')
  const [status, setStatus] = useState('idle')
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)

  const startRecording = async () => {
    try {
      setStatus('recording')
      audioChunksRef.current = []

      // 1. Start MediaRecorder for audio file
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }
      
      mediaRecorderRef.current.start()

      // 2. Start Web Speech API for transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        setTranscript(finalTranscript)
transcriptRef.current = finalTranscript
      }

      recognitionRef.current.start()
      setIsRecording(true)

    } catch (error) {
      console.error('Error starting recording:', error)
      setStatus('error')
    }
  }

  const stopRecording = async () => {
    try {
      setStatus('saving')
      setIsRecording(false)

      // Stop Web Speech API
      recognitionRef.current?.stop()

      // Stop MediaRecorder
      mediaRecorderRef.current?.stop()

      mediaRecorderRef.current.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

        // Upload audio to Supabase
        await uploadAudio(audioBlob)

        // Save transcript to MongoDB
        await saveTranscription(transcriptRef.current || 'No transcript captured')

        setStatus('saved')
        onTranscriptSaved?.()
      }

    } catch (error) {
      console.error('Error stopping recording:', error)
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #d1e8d8' }}>
  <h2 className="text-xl font-medium" style={{ color: '#0F6E56' }}>Voice Recorder</h2>

      {/* Status */}
      <div className="text-sm font-medium text-gray-500">
        {status === 'idle' && 'Press record to start'}
        {status === 'recording' && '🔴 Recording...'}
        {status === 'saving' && '💾 Saving...'}
        {status === 'saved' && '✅ Saved!'}
        {status === 'error' && '❌ Error occurred'}
      </div>

      {/* Record Button */}
      <button
      style={{ background: isRecording ? '#e53e3e' : '#1D9E75', border: '4px solid #9FE1CB' }}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full text-white text-4xl font-bold shadow-lg transition-all duration-300 ${
         isRecording 
  ? 'scale-110 animate-pulse' 
  : ''
        }`}
      >
        {isRecording ? '⏹' : '🎤'}
      </button>

      {/* Live Transcript */}
      {transcript && (
        <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-2">Live Transcript:</p>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder