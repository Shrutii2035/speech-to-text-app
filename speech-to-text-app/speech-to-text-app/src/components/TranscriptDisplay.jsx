const TranscriptDisplay = ({ transcript, status }) => {
  if (!transcript && status === 'idle') return null

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Transcript</h2>

      {/* Loading State */}
      {status === 'saving' && (
        <div className="flex items-center gap-3 text-blue-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
          <p>Saving transcript...</p>
        </div>
      )}

      {/* Success State */}
      {status === 'saved' && transcript && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
            <span>✅</span>
            <span>Transcript saved successfully!</span>
          </div>
          <p className="text-gray-800 leading-relaxed text-lg">
            {transcript}
          </p>
          {/* Copy Button */}
          <button
            onClick={() => navigator.clipboard.writeText(transcript)}
            className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-all"
          >
            📋 Copy to clipboard
          </button>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="text-red-500">
          ❌ Something went wrong. Please try again.
        </div>
      )}
    </div>
  )
}

export default TranscriptDisplay