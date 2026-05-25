import { useState } from 'react'
import { uploadAudio, saveTranscription } from '../services/api'

const FileUpload = ({ onTranscriptSaved }) => {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file!')
      return
    }
    try {
      setFileName(file.name)
      setStatus('uploading')
      await uploadAudio(file)
      setStatus('transcribing')
      await saveTranscription(`Uploaded file: ${file.name}`, 'en', 0, 'upload')
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
    handleFile(e.dataTransfer.files[0])
  }

  const reset = () => { setStatus('idle'); setFileName('') }

  const steps = [
    { key: 'uploading', label: 'Uploading to storage...' },
    { key: 'transcribing', label: 'Saving transcription...' },
    { key: 'saved', label: 'Done!' },
  ]

  const getStepStatus = (stepKey) => {
    const order = ['uploading', 'transcribing', 'saved']
    const current = order.indexOf(status)
    const step = order.indexOf(stepKey)
    if (current > step) return 'done'
    if (current === step) return 'active'
    return 'pending'
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '24px' }}>

      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '16px', fontWeight: '500', color: '#26215C' }}>Upload Audio</p>
        <p style={{ fontSize: '13px', color: '#AFA9EC', marginTop: '2px' }}>Upload an audio file to transcribe</p>
      </div>

      {/* Drop Zone */}
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

      {/* Progress Steps */}
      {status !== 'idle' && (
        <div style={{ marginTop: '16px', background: '#F8F7FE', border: '0.5px solid #CECBF6', borderRadius: '8px', padding: '14px' }}>

          {fileName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '13px', color: '#3C3489' }}>
              <i className="ti ti-file-music" style={{ color: '#534AB7' }}/>
              <span style={{ fontWeight: '500' }}>{fileName}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      : <i className="ti ti-check" style={{ fontSize: '11px', color: s === 'pending' ? '#CECBF6' : '#fff' }}/>
                    }
                  </div>
                  <p style={{ fontSize: '13px', color: s === 'pending' ? '#CECBF6' : s === 'active' ? '#534AB7' : '#3C3489', fontWeight: s === 'active' ? '500' : '400' }}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>

          {status === 'saved' && (
            <button onClick={reset}
              style={{ marginTop: '12px', background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-upload"/>Upload another
            </button>
          )}

          {status === 'error' && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '13px', color: '#e53e3e', marginBottom: '8px' }}>
                <i className="ti ti-circle-x"/> Something went wrong
              </p>
              <button onClick={reset}
                style={{ background: '#fff0f0', color: '#e53e3e', border: '0.5px solid #ffd0d0', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
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