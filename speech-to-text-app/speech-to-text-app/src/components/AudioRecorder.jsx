import { useState, useRef } from 'react'
import { saveTranscription, uploadAudio } from '../services/api'

const AudioRecorder = ({ onTranscriptSaved }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
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
      setInterimTranscript('')
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
        let interim = ''
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' '
          } else {
            interim += event.results[i][0].transcript
          }
        }
        // Update both final and interim in real time
        setTranscript(final)
        setInterimTranscript(interim)
        transcriptRef.current = final
      }

      recognitionRef.current.onend = () => {
        // Auto restart if still recording
        if (isRecording) recognitionRef.current?.start()
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
      setInterimTranscript('')
      clearInterval(timerRef.current)
      recognitionRef.current?.stop()
      mediaRecorderRef.current?.stop()

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await uploadAudio(audioBlob)
        await saveTranscription(
          transcriptRef.current.trim() || 'No transcript captured',
          'en', duration, 'recording'
        )
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
    setInterimTranscript('')
    setDuration(0)
    transcriptRef.current = ''
  }

  const formatDuration = (secs) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '15px', fontWeight: '500', color: '#26215C' }}>Voice recorder</p>
          <p style={{ fontSize: '12px', color: '#AFA9EC', marginTop: '2px' }}>Click mic to start recording</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isRecording && (
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#534AB7', fontFamily: 'monospace' }}>
              {formatDuration(duration)}
            </span>
          )}
          <span style={{ background: '#EEEDFE', color: '#534AB7', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6' }}>EN</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

        {/* Record Button */}
        <div style={{ position: 'relative' }}>
          {isRecording && (
            <div style={{
              position: 'absolute', top: '-8px', left: '-8px', right: '-8px', bottom: '-8px',
              borderRadius: '50%', border: '2px solid #CECBF6',
              animation: 'ping 1.5s ease infinite',
            }}/>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={status === 'saving'}
            style={{
              width: '88px', height: '88px', borderRadius: '50%',
              background: isRecording ? '#e53e3e' : '#534AB7',
              border: `4px solid ${isRecording ? '#F7C1C1' : '#CECBF6'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: status === 'saving' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease', position: 'relative'
            }}
          >
            <i className={`ti ${status === 'saving' ? 'ti-loader' : isRecording ? 'ti-player-stop' : 'ti-microphone'}`}
              style={{ fontSize: '32px', color: '#fff' }}/>
          </button>
        </div>

        {/* Status */}
        <div style={{ fontSize: '12px', color: '#AFA9EC', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {status === 'idle' && <><i className="ti ti-microphone-2"/>Press the button to start</>}
          {status === 'recording' && (
            <><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e53e3e', display: 'inline-block', animation: 'pulse 1s infinite' }}/>Recording in progress...</>
          )}
          {status === 'saving' && <><i className="ti ti-loader"/>Saving your transcription...</>}
          {status === 'saved' && <><i className="ti ti-circle-check" style={{ color: '#534AB7' }}/>Saved to history!</>}
          {status === 'error' && <><i className="ti ti-circle-x" style={{ color: '#e53e3e' }}/>Something went wrong</>}
        </div>

        {/* Real-time Transcript Box */}
        <div style={{ width: '100%', background: '#F8F7FE', border: `0.5px solid ${isRecording ? '#7F77DD' : '#CECBF6'}`, borderRadius: '8px', padding: '14px', minHeight: '100px', transition: 'border-color 0.2s' }}>
          <p style={{ fontSize: '10px', fontWeight: '500', color: '#534AB7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isRecording && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e53e3e', display: 'inline-block', animation: 'pulse 1s infinite' }}/>}
            Live transcript
          </p>
          {!transcript && !interimTranscript && (
            <p style={{ fontSize: '13px', color: '#CECBF6', fontStyle: 'italic' }}>
              {status === 'idle' ? 'Your words will appear here...' : 'Listening...'}
            </p>
          )}
          {/* Final transcript in solid color */}
          {transcript && (
            <span style={{ fontSize: '13px', color: '#26215C', lineHeight: '1.7' }}>{transcript}</span>
          )}
          {/* Interim transcript in lighter color — real time! */}
          {interimTranscript && (
            <span style={{ fontSize: '13px', color: '#AFA9EC', lineHeight: '1.7', fontStyle: 'italic' }}>{interimTranscript}</span>
          )}
        </div>

        {/* Actions after save */}
        {status === 'saved' && (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={() => navigator.clipboard.writeText(transcript)}
              style={{ flex: 1, background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <i className="ti ti-copy"/>Copy transcript
            </button>
            <button
              onClick={reset}
              style={{ flex: 1, background: '#F8F7FE', color: '#AFA9EC', border: '0.5px solid #CECBF6', padding: '8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <i className="ti ti-refresh"/>Record again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AudioRecorder