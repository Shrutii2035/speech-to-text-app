import { useState, useEffect } from 'react'
import AudioRecorder from './components/AudioRecorder'
import FileUpload from './components/FileUpload'
import History from './components/History'
import { getTranscriptions } from './services/api'

const App = () => {
  const [refresh, setRefresh] = useState(0)
  const [activeTab, setActiveTab] = useState('record')
  const [stats, setStats] = useState({ total: 0, words: 0, recordings: 0 })

  const fetchStats = async () => {
    try {
      const res = await getTranscriptions()
      const data = res.data

      setStats({
        total: data.length,
        words: data.reduce((acc, item) => acc + (item.wordCount || 0), 0),
        recordings: data.filter(i => i.source === 'recording').length
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refresh])

  const handleTranscriptSaved = () => {
    setRefresh(prev => prev + 1)
  }

  const tabs = [
    { key: 'record', label: 'Record', icon: 'ti-microphone' },
    { key: 'upload', label: 'Upload', icon: 'ti-upload' },
    { key: 'history', label: 'History', icon: 'ti-history' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8F7FE'
      }}
    >

      {/* HEADER */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #CECBF6',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          minHeight: '110px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >

          {/* LOGO */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >

            <div
              style={{
                width: '60px',
                height: '60px',
                background: '#534AB7',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i
                className="ti ti-microphone"
                style={{
                  color: '#fff',
                  fontSize: '28px'
                }}
              />
            </div>

            <div>
              <p
                style={{
                  fontWeight: '700',
                  fontSize: '23px',
                  color: '#3C3489'
                }}
              >
                VoiceTalk
              </p>

              <p
                style={{
                  fontSize: '15px',
                  color: '#AFA9EC',
                  marginTop: '4px'
                }}
              >
                AI Powered Speech To Text
              </p>
            </div>

          </div>

          {/* STATS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >

            <span
              style={{
                background: '#EEEDFE',
                color: '#3C3489',
                fontSize: '15px',
                padding: '10px 18px',
                borderRadius: '30px',
                border: '1px solid #CECBF6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}
            >
              <i className="ti ti-file-text" />
              {stats.total} saved
            </span>

            <span
              style={{
                background: '#EEEDFE',
                color: '#3C3489',
                fontSize: '15px',
                padding: '10px 18px',
                borderRadius: '30px',
                border: '1px solid #CECBF6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}
            >
              <i className="ti ti-writing" />
              {stats.words} words
            </span>

            <span
              style={{
                background: '#534AB7',
                color: '#fff',
                fontSize: '15px',
                padding: '10px 18px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <i
                className="ti ti-point-filled"
                style={{
                  fontSize: '10px'
                }}
              />
              Live
            </span>

          </div>

        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '32px'
        }}
      >

        {/* TABS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: '#fff',
            borderRadius: '18px',
            padding: '8px',
            marginBottom: '28px',
            border: '1px solid #CECBF6',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}
        >

          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '17px',
                borderRadius: '14px',
                cursor: 'pointer',
                border: 'none',
                background:
                  activeTab === tab.key
                    ? '#534AB7'
                    : 'transparent',
                color:
                  activeTab === tab.key
                    ? '#fff'
                    : '#7B74D8',
                fontWeight:
                  activeTab === tab.key
                    ? '600'
                    : '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <i className={`ti ${tab.icon}`} />
              {tab.label}
            </button>
          ))}

        </div>

        {/* CONTENT */}
        {activeTab === 'record' && (
          <AudioRecorder onTranscriptSaved={handleTranscriptSaved} />
        )}

        {activeTab === 'upload' && (
          <FileUpload onTranscriptSaved={handleTranscriptSaved} />
        )}

        {activeTab === 'history' && (
          <History refresh={refresh} />
        )}

      </main>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: 'center',
          padding: '40px',
          color: '#AFA9EC',
          fontSize: '15px'
        }}
      >
        <p>VoiceTalk © 2026</p>

        <p
          style={{
            fontSize: '13px',
            marginTop: '8px'
          }}
        >
          Built with React + Node.js + MongoDB + Supabase
        </p>
      </footer>

    </div>
  )
}

export default App