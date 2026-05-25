import { useState, useEffect } from 'react'
import { getTranscriptions, deleteTranscription } from '../services/api'

const History = ({ refresh }) => {
  const [transcriptions, setTranscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await getTranscriptions()
      setTranscriptions(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [refresh])

  const handleDelete = async (id) => {
    try {
      await deleteTranscription(id)
      setTranscriptions(prev => prev.filter(item => item._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: '500', color: '#26215C' }}>Transcription history</p>
          <p style={{ fontSize: '12px', color: '#AFA9EC', marginTop: '2px' }}>
            {transcriptions.length} transcription{transcriptions.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button
          onClick={fetchHistory}
          style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <i className="ti ti-refresh"/>Refresh
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '16px', height: '120px', opacity: 0.5 }}/>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && transcriptions.length === 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <i className="ti ti-microphone-off" style={{ fontSize: '40px', color: '#CECBF6', display: 'block', marginBottom: '12px' }}/>
          <p style={{ fontWeight: '500', color: '#26215C', marginBottom: '4px' }}>No transcriptions yet</p>
          <p style={{ fontSize: '13px', color: '#AFA9EC' }}>Start recording or upload an audio file</p>
        </div>
      )}

      {/* Cards */}
      {!loading && transcriptions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transcriptions.map((item) => (
            <div key={item._id}
              style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '16px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7F77DD'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#CECBF6'}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className={`ti ${item.source === 'upload' ? 'ti-upload' : 'ti-microphone'}`} style={{ fontSize: '10px' }}/>
                    {item.source === 'upload' ? 'Upload' : 'Recording'}
                  </span>
                  <span style={{ background: '#F8F7FE', color: '#AFA9EC', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6' }}>
                    {item.language?.toUpperCase()}
                  </span>
                  {item.wordCount > 0 && (
                    <span style={{ background: '#F8F7FE', color: '#AFA9EC', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ti ti-writing" style={{ fontSize: '10px' }}/>
                      {item.wordCount} words
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#CECBF6' }}>{formatDate(item.createdAt)}</span>
              </div>

              {/* Transcript */}
              <p style={{ fontSize: '13px', color: '#26215C', lineHeight: '1.7', marginBottom: '12px' }}>
                {item.transcript}
              </p>

              {/* Audio Player */}
              {item.audioUrl && (
                <div style={{ marginBottom: '12px' }}>
                  <audio controls src={item.audioUrl} style={{ width: '100%', height: '32px', accentColor: '#534AB7' }}/>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '0.5px solid #EEEDFE' }}>
                <span style={{ fontSize: '11px', color: '#CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ti ti-file" style={{ fontSize: '11px' }}/>{item.originalFilename}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.transcript)}
                    style={{ background: '#F8F7FE', color: '#AFA9EC', border: '0.5px solid #CECBF6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <i className="ti ti-copy"/>Copy
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ background: '#fff0f0', color: '#e53e3e', border: '0.5px solid #ffd0d0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <i className="ti ti-trash"/>Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History