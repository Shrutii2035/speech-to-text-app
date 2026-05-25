import { useState, useRef } from 'react'
import { saveTranscription, uploadAudio } from '../services/api'

const AudioRecorder = ({ onTranscriptSaved }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('idle')
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      setStatus('recording')
      setTranscript('')
      transcriptRef.current = ''
      setDuration(0)
      audioChunksRef.current = []

      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      mediaRecorderRef.current.start()

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let final = ''
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
        }
        setTranscript(final)
        transcriptRef.current = final
      }

      recognitionRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  const stopRecording = async () => {
    try {
      setStatus('saving')
      setIsRecording(false)
      clearInterval(timerRef.current)
      recognitionRef.current?.stop()
      mediaRecorderRef.current?.stop()

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await uploadAudio(audioBlob)
        await saveTranscription(transcriptRef.current || 'No transcript captured', 'en', duration, 'recording')
        setStatus('saved')
        onTranscriptSaved?.()
      }
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setTranscript('')
    setDuration(0)
    transcriptRef.current = ''
  }

  const formatDuration = (secs) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: '500', color: '#26215C' }}>Voice Recorder</p>
        <p style={{ fontSize: '13px', color: '#AFA9EC', marginTop: '2px' }}>Speak clearly into your microphone</p>
      </div>

      {/* Timer */}
      {isRecording && (
        <div style={{ fontSize: '32px', fontWeight: '500', color: '#534AB7', fontFamily: 'monospace' }}>
          {formatDuration(duration)}
        </div>
      )}

      {/* Status */}
      <div style={{ fontSize: '13px', color: '#AFA9EC', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {status === 'idle' && <><i className="ti ti-microphone-2"/>&nbsp;Press the button to start</>}
        {status === 'recording' && (
          <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53e3e', display: 'inline-block' }}/>&nbsp;Recording in progress...</>
        )}
        {status === 'saving' && <><i className="ti ti-loader"/>&nbsp;Saving...</>}
        {status === 'saved' && <><i className="ti ti-circle-check" style={{ color: '#534AB7' }}/>&nbsp;Saved successfully!</>}
        {status === 'error' && <><i className="ti ti-circle-x" style={{ color: '#e53e3e' }}/>&nbsp;Something went wrong</>}
      </div>

      {/* Record Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={status === 'saving'}
        style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: isRecording ? '#e53e3e' : '#534AB7',
          border: `4px solid ${isRecording ? '#fdb5b5' : '#CECBF6'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: status === 'saving' ? 'not-allowed' : 'pointer',
          transform: isRecording ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s ease'
        }}
      >
        <i className={`ti ${isRecording ? 'ti-player-stop' : 'ti-microphone'}`}
          style={{ fontSize: '28px', color: '#fff' }}/>
      </button>

      {/* Live Transcript */}
      {transcript && (
        <div style={{ width: '100%', background: '#F8F7FE', border: '0.5px solid #CECBF6', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#534AB7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            Live transcript
          </p>
          <p style={{ fontSize: '13px', color: '#26215C', lineHeight: '1.7' }}>{transcript}</p>
        </div>
      )}

      {/* Actions */}
      {status === 'saved' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigator.clipboard.writeText(transcript)}
            style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <i className="ti ti-copy"/>Copy
          </button>
          <button
            onClick={reset}
            style={{ background: '#F8F7FE', color: '#AFA9EC', border: '0.5px solid #CECBF6', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <i className="ti ti-refresh"/>Record again
          </button>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder