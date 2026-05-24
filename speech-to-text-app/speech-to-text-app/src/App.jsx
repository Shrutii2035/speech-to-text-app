import { useState } from 'react'
import AudioRecorder from './components/AudioRecorder'
import FileUpload from './components/FileUpload'
import History from './components/History'

const App = () => {
  const [refresh, setRefresh] = useState(0)
  const [activeTab, setActiveTab] = useState('record')

  const handleTranscriptSaved = () => {
    setRefresh(prev => prev + 1)
  }

  return (
    <div className="min-h-screen" style={{ background: '#f4faf6' }}>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '0.5px solid #d1e8d8' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: '#1D9E75', borderRadius: '10px', width: '36px', height: '36px' }} className="flex items-center justify-center">
              <span className="text-white text-lg">🎤</span>
            </div>
            <div>
              <h1 className="font-medium" style={{ color: '#0F6E56', fontSize: '16px' }}>VoiceTalk</h1>
              <p style={{ color: '#888', fontSize: '11px' }}>Speech to Text App</p>
            </div>
          </div>
          <span style={{ background: '#e1f5ee', color: '#0F6E56', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '0.5px solid #9FE1CB' }}>
            ● Live
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#fff', border: '0.5px solid #d1e8d8' }}>
          {[
            { key: 'record', label: 'Record', icon: '🎤' },
            { key: 'upload', label: 'Upload', icon: '📁' },
            { key: 'history', label: 'History', icon: '📜' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: activeTab === tab.key ? '#1D9E75' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#888',
                fontWeight: activeTab === tab.key ? '500' : '400',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'record' && <AudioRecorder onTranscriptSaved={handleTranscriptSaved} />}
        {activeTab === 'upload' && <FileUpload onTranscriptSaved={handleTranscriptSaved} />}
        {activeTab === 'history' && <History refresh={refresh} />}

      </main>

      {/* Footer */}
      <footer className="text-center py-6" style={{ color: '#aaa', fontSize: '11px' }}>
        VoiceTalk © 2026 | Built with React + Node.js + MongoDB + Supabase
      </footer>

    </div>
  )
}

export default App