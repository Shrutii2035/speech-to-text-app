import { useState, useEffect } from 'react'
import AudioRecorder from './components/AudioRecorder'
import FileUpload from './components/FileUpload'
import History from './components/History'
import { getTranscriptions } from './services/api'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'

const App = () => {
  const [refresh, setRefresh] = useState(0)
  const [stats, setStats] = useState({ total: 0, words: 0, recordings: 0 })
  const [showHistory, setShowHistory] = useState(false)
  const { user, loading, signOut } = useAuth()

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

  useEffect(() => { fetchStats() }, [refresh])

  const handleTranscriptSaved = () => setRefresh(prev => prev + 1)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #CECBF6', borderTopColor: '#534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}/>
        <p style={{ color: '#AFA9EC', fontSize: '13px' }}>Loading...</p>
      </div>
    </div>
  )

  if (!user) return <AuthPage />

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FE' }}>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '0.5px solid #CECBF6', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#534AB7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-microphone" style={{ color: '#fff', fontSize: '16px' }}/>
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '14px', color: '#3C3489' }}>VoiceTalk</p>
              <p style={{ fontSize: '10px', color: '#AFA9EC' }}>Speech to Text</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-file-text" style={{ fontSize: '10px' }}/>{stats.total} saved
            </span>
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-writing" style={{ fontSize: '10px' }}/>{stats.words} words
            </span>
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-user" style={{ fontSize: '10px' }}/>{user.email.split('@')[0]}
            </span>
            <span style={{ background: '#534AB7', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-circle" style={{ fontSize: '8px' }}/>Live
            </span>
            <button onClick={signOut} style={{ background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F7C1C1', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-logout" style={{ fontSize: '10px' }}/>Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AudioRecorder onTranscriptSaved={handleTranscriptSaved} />
            <FileUpload onTranscriptSaved={handleTranscriptSaved} />
          </div>

          {/* Right Column */}
          <div>
            <History refresh={refresh} />
          </div>

        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#AFA9EC', fontSize: '11px', marginTop: '8px' }}>
        VoiceTalk © 2026 · Built with React + Node.js + MongoDB + Supabase
      </footer>

    </div>
  )
}

export default App