import { useState, useEffect } from 'react'
import { getTranscriptions } from '../services/api'

const History = ({ refresh }) => {
  const [transcriptions, setTranscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await getTranscriptions()
      setTranscriptions(response.data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [refresh])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📜 History</h2>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      )}

      {/* Empty State */}
      {!loading && transcriptions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-3">🎤</p>
          <p>No transcriptions yet. Start recording!</p>
        </div>
      )}

      {/* Transcription List */}
      {!loading && transcriptions.length > 0 && (
        <div className="space-y-4">
          {transcriptions.map((item) => (
            <div
              key={item._id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                  {item.language.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed">{item.transcript}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  📁 {item.originalFilename}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(item.transcript)}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-all"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History