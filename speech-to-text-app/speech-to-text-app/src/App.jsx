import { useState, useEffect } from 'react'
import AudioRecorder from './components/AudioRecorder'
import FileUpload from './components/FileUpload'
import History from './components/History'
import { getTranscriptions } from './services/api'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'

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

  useEffect(() => { fetchStats() }, [refresh])

  const handleTranscriptSaved = () => setRefresh(prev => prev + 1)

  const tabs = [
    { key: 'record', label: 'Record', icon: 'ti-microphone' },
    { key: 'upload', label: 'Upload', icon: 'ti-upload' },
    { key: 'history', label: 'History', icon: 'ti-history' },
  ]

  const { user, loading, signOut } = useAuth()

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
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#534AB7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-microphone" style={{ color: '#fff', fontSize: '17px' }}/>
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '15px', color: '#3C3489' }}>VoiceTalk</p>
              <p style={{ fontSize: '11px', color: '#AFA9EC' }}>Speech to Text</p>
            </div>
          </div>

         
         {/* Pill Stats + User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-user" style={{ fontSize: '11px' }}/>{user.email.split('@')[0]}
            </span>
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-file-text" style={{ fontSize: '11px' }}/>{stats.total} saved
            </span>
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '0.5px solid #CECBF6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-writing" style={{ fontSize: '11px' }}/>{stats.words} words
            </span>
            <span style={{ background: '#534AB7', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-point-filled" style={{ fontSize: '8px' }}/>Live
            </span>
            <button
              onClick={signOut}
              style={{ background: '#fff0f0', color: '#e53e3e', border: '0.5px solid #ffd0d0', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <i className="ti ti-logout" style={{ fontSize: '11px' }}/>Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#fff', borderRadius: '12px', padding: '4px', marginBottom: '16px', border: '0.5px solid #CECBF6' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '8px', fontSize: '13px',
                borderRadius: '8px', cursor: 'pointer', border: 'none',
                background: activeTab === tab.key ? '#534AB7' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#AFA9EC',
                fontWeight: activeTab === tab.key ? '500' : '400',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <i className={`ti ${tab.icon}`}/>{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'record' && <AudioRecorder onTranscriptSaved={handleTranscriptSaved} />}
        {activeTab === 'upload' && <FileUpload onTranscriptSaved={handleTranscriptSaved} />}
        {activeTab === 'history' && <History refresh={refresh} />}

      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', color: '#AFA9EC', fontSize: '12px' }}>
        <p>VoiceTalk © 2026</p>
        <p style={{ fontSize: '11px', marginTop: '4px' }}>Built with React + Node.js + MongoDB + Supabase</p>
      </footer>

    </div>
  )
}

export default App