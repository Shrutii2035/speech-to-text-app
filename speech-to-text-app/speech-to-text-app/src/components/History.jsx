import { useState, useEffect } from 'react'
import { getTranscriptions, deleteTranscription } from '../services/api'

const History = ({ refresh }) => {
  const [transcriptions, setTranscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

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

  const formatDate = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '12px', padding: '16px', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#26215C' }}>History</p>
          <p style={{ fontSize: '11px', color: '#AFA9EC', marginTop: '1px' }}>
            {transcriptions.length} transcription{transcriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchHistory}
          style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <i className="ti ti-refresh" style={{ fontSize: '11px' }}/>Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#F8F7FE', border: '0.5px solid #CECBF6', borderRadius: '8px', height: '80px', opacity: 0.5 }}/>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && transcriptions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <i className="ti ti-microphone-off" style={{ fontSize: '32px', color: '#CECBF6', display: 'block', marginBottom: '8px' }}/>
          <p style={{ fontSize: '13px', color: '#26215C', fontWeight: '500' }}>No transcriptions yet</p>
          <p style={{ fontSize: '12px', color: '#AFA9EC', marginTop: '4px' }}>Start recording to see history</p>
        </div>
      )}

      {/* List */}
      {!loading && transcriptions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
          {transcriptions.map((item) => (
            <div
              key={item._id}
              style={{ background: '#F8F7FE', border: `0.5px solid ${expanded === item._id ? '#7F77DD' : '#CECBF6'}`, borderRadius: '8px', padding: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setExpanded(expanded === item._id ? null : item._id)}
            >
              {/* Card top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <i className={`ti ${item.source === 'upload' ? 'ti-upload' : 'ti-microphone'}`} style={{ fontSize: '9px' }}/>
                    {item.source === 'upload' ? 'Upload' : 'Recording'}
                  </span>
                  {item.wordCount > 0 && (
                    <span style={{ background: '#F8F7FE', color: '#AFA9EC', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', border: '0.5px solid #CECBF6' }}>
                      {item.wordCount}w
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: '#AFA9EC' }}>{formatDate(item.createdAt)}</span>
              </div>

              {/* Transcript preview */}
              <p style={{ fontSize: '12px', color: '#26215C', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: expanded === item._id ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: expanded === item._id ? 'visible' : 'hidden' }}>
                {item.transcript}
              </p>

              {/* Expanded actions */}
              {expanded === item._id && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '0.5px solid #CECBF6' }}>
                  {item.audioUrl && (
                    <audio controls src={item.audioUrl} style={{ width: '100%', height: '28px', marginBottom: '8px', accentColor: '#534AB7' }}/>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.transcript) }}
                      style={{ flex: 1, background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #CECBF6', padding: '5px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <i className="ti ti-copy"/>Copy
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id) }}
                      style={{ flex: 1, background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F7C1C1', padding: '5px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <i className="ti ti-trash"/>Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History