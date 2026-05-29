import { useState, useRef } from 'react'
import { uploadAudio, saveTranscription } from '../services/api'

const FileUpload = ({ onTranscriptSaved }) => {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const audioRef = useRef(null)
  const recognitionRef = useRef(null)

  const transcribeAudioFile = (audioUrl) => {
    return new Promise((resolve) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        resolve('Speech recognition not supported in this browser')
        return
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      let finalTranscript = ''
      let silenceTimer = null

      recognition.onresult = (event) => {
        let interim = ''
        clearTimeout(silenceTimer)
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          } else {
            interim += event.results[i][0].transcript
          }
        }
        setTranscript(finalTranscript + interim)

        // Stop after 3 seconds of silence
        silenceTimer = setTimeout(() => {
          recognition.stop()
        }, 3000)
      }

      recognition.onend = () => {
        clearTimeout(silenceTimer)
        if (audioRef.current) audioRef.current.pause()
        resolve(finalTranscript.trim() || 'No speech detected in audio file')
      }

      recognition.onerror = () => {
        resolve(finalTranscript.trim() || 'Could not transcribe audio')
      }

      // Play audio and transcribe simultaneously
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        recognition.start()

        audioRef.current.onended = () => {
          setTimeout(() => recognition.stop(), 1500)
        }
      }
    })
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file!')
      return
    }

    try {
      setFileName(file.name)
      setTranscript('')
      setStatus('uploading')

      // 1. Upload to Supabase
      const uploadResult = await uploadAudio(file)
      const audioUrl = uploadResult.audioUrl

      // 2. Transcribe audio file
      setStatus('transcribing')
      setIsTranscribing(true)
      const localUrl = URL.createObjectURL(file)
      const transcribedText = await transcribeAudioFile(localUrl)
      setIsTranscribing(false)
      setTranscript(transcribedText)

      // 3. Save to MongoDB with real transcript
      await saveTranscription(transcribedText, 'en', 0, 'upload')

      setStatus('saved')
      onTranscriptSaved?.()

    } catch (error) {
      console.error(error)
      setIsTranscribing(false)
      setStatus('error')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const reset = () => {
    setStatus('idle')
    setFileName('')
    setTranscript('')
    if (audioRef.current) audioRef.current.pause()
    if (recognitionRef.current) recognitionRef.current.stop()
  }

  const steps = [
    { key: 'uploading', label: 'Uploading to storage...' },
    { key: 'transcribing', label: 'Transcribing audio...' },
    { key: 'saved', label: 'Done!' },
  ]

  const getStepStatus = (stepKey) => {
  if (status === 'saved') return 'done'
  const order = ['uploading', 'transcribing', 'saved']
  const current = order.indexOf(status)
  const step = order.indexOf(stepKey)
  if (current > step) return 'done'
  if (current === step) return 'active'
  return 'pending'
}

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '24px' }}>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }}/>

      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: '500', color: '#26215C' }}>Upload Audio</p>
        <p style={{ fontSize: '12px', color: '#AFA9EC', marginTop: '2px' }}>
          Upload an audio file — we'll transcribe it automatically
        </p>
      </div>

      {/* Drop Zone */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          style={{
            border: `2px dashed ${dragOver ? '#534AB7' : '#CECBF6'}`,
            borderRadius: '12px', padding: '40px', textAlign: 'center',
            background: dragOver ? '#EEEDFE' : '#F8F7FE',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="ti ti-music" style={{ fontSize: '36px', color: '#534AB7', display: 'block', marginBottom: '12px' }}/>
          <p style={{ fontWeight: '500', color: '#26215C', marginBottom: '4px' }}>
            Drag and drop your audio file
          </p>
          <p style={{ fontSize: '12px', color: '#AFA9EC', marginBottom: '14px' }}>or</p>
          <label style={{ background: '#534AB7', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-folder-open"/>Browse file
            <input type="file" accept="audio/*" style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])} />
          </label>
          <p style={{ fontSize: '11px', color: '#CECBF6', marginTop: '12px' }}>
            MP3, WAV, OGG, M4A, WEBM — max 25MB
          </p>
        </div>
      )}

      {/* Progress */}
      {status !== 'idle' && (
        <div style={{ background: '#F8F7FE', border: '0.5px solid #CECBF6', borderRadius: '8px', padding: '14px' }}>

          {/* Filename */}
          {fileName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '13px', color: '#3C3489' }}>
              <i className="ti ti-file-music" style={{ color: '#534AB7' }}/>
              <span style={{ fontWeight: '500' }}>{fileName}</span>
            </div>
          )}

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {steps.map((step) => {
              const s = getStepStatus(step.key)
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: s === 'pending' ? '#EEEDFE' : '#534AB7',
                    border: `0.5px solid ${s === 'pending' ? '#CECBF6' : '#534AB7'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {s === 'active'
                      ? <div style={{ width: '10px', height: '10px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                      : <span style={{ fontSize: '11px', color: s === 'pending' ? '#CECBF6' : '#fff' }}>✓</span>
                    }
                  </div>
                  <p style={{ fontSize: '13px', color: s === 'pending' ? '#CECBF6' : s === 'active' ? '#534AB7' : '#3C3489', fontWeight: s === 'active' ? '500' : '400' }}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Live transcript while transcribing */}
          {(status === 'transcribing' || status === 'saved') && (
            <div style={{ background: '#fff', border: `0.5px solid ${isTranscribing ? '#7F77DD' : '#CECBF6'}`, borderRadius: '8px', padding: '12px', marginBottom: '10px', transition: 'border-color 0.2s' }}>
              <p style={{ fontSize: '10px', fontWeight: '500', color: '#534AB7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isTranscribing && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#534AB7', display: 'inline-block', animation: 'pulse 1s infinite' }}/>}
                Transcript
              </p>
              <p style={{ fontSize: '13px', color: transcript ? '#26215C' : '#CECBF6', lineHeight: '1.7', fontStyle: transcript ? 'normal' : 'italic' }}>
                {transcript || 'Listening to audio...'}
              </p>
            </div>
          )}

          {/* Actions */}
          {status === 'saved' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigator.clipboard.writeText(transcript)}
                style={{ flex: 1, background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '7px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <i className="ti ti-copy"/>Copy transcript
              </button>
              <button
                onClick={reset}
                style={{ flex: 1, background: '#F8F7FE', color: '#AFA9EC', border: '0.5px solid #CECBF6', padding: '7px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <i className="ti ti-upload"/>Upload another
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <p style={{ fontSize: '13px', color: '#e53e3e', marginBottom: '8px' }}>
                <i className="ti ti-circle-x"/> Something went wrong
              </p>
              <button onClick={reset}
                style={{ background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F7C1C1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FileUpload