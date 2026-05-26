import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else {
        const { error } = await signUp(email, password)
        if (error) setError(error.message)
        else setSuccess('Account created! You can now log in.')
      }
    } catch (err) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <div style={{ width: '40px', height: '40px', background: '#534AB7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-microphone" style={{ color: '#fff', fontSize: '20px' }}/>
        </div>
        <div>
          <p style={{ fontWeight: '600', fontSize: '18px', color: '#3C3489' }}>VoiceTalk</p>
          <p style={{ fontSize: '11px', color: '#AFA9EC' }}>Speech to Text</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' }}>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#26215C', marginBottom: '4px' }}>
            {isLogin ? 'Welcome back!' : 'Create account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#AFA9EC' }}>
            {isLogin ? 'Sign in to access your transcriptions' : 'Sign up to start transcribing'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fff0f0', border: '0.5px solid #ffd0d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-circle-x" style={{ color: '#e53e3e', fontSize: '16px' }}/>
            <p style={{ fontSize: '13px', color: '#e53e3e' }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ background: '#EEEDFE', border: '0.5px solid #CECBF6', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-circle-check" style={{ color: '#534AB7', fontSize: '16px' }}/>
            <p style={{ fontSize: '13px', color: '#534AB7' }}>{success}</p>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: '#3C3489', display: 'block', marginBottom: '6px' }}>
            Email address
          </label>
          <div style={{ position: 'relative' }}>
            <i className="ti ti-mail" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#AFA9EC', fontSize: '16px' }}/>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '0.5px solid #CECBF6', borderRadius: '8px', fontSize: '13px', color: '#26215C', background: '#F8F7FE', outline: 'none' }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: '#3C3489', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <i className="ti ti-lock" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#AFA9EC', fontSize: '16px' }}/>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '0.5px solid #CECBF6', borderRadius: '8px', fontSize: '13px', color: '#26215C', background: '#F8F7FE', outline: 'none' }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '11px', background: loading ? '#AFA9EC' : '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          {loading
            ? <><div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> Please wait...</>
            : <><i className={`ti ${isLogin ? 'ti-login' : 'ti-user-plus'}`}/>{isLogin ? 'Sign in' : 'Create account'}</>
          }
        </button>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#AFA9EC', marginTop: '16px' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
            style={{ color: '#534AB7', fontWeight: '500', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default AuthPage