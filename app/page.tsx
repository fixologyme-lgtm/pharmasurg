'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'pharmacy' | 'surgery' | null

export default function Home() {
  const router = useRouter()
  const [selected, setSelected] = useState<Role>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selected, code: code.trim().toUpperCase() }),
    })
    const data = await res.json()
    if (data.ok) {
      router.push(`/${selected}`)
    } else {
      setError('Incorrect access code. Please try again.')
      setLoading(false)
    }
  }

  function selectRole(role: Role) {
    setSelected(role)
    setCode('')
    setError('')
  }

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F172A', gap: 0, padding: '0 48px' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>
          Sudbury Community Health Centre
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
          PharmaBridge
        </div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
          Pharmacy–GP clinical triage system
        </div>
      </div>

      {/* Role selectors */}
      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 800 }}>
        <RoleCard
          role="pharmacy"
          selected={selected === 'pharmacy'}
          onClick={() => selectRole('pharmacy')}
          color="#0F766E"
          lightColor="#CCFBF1"
          icon={
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="Supremus Pharmacy"
          subtitle="Clinical triage · Pharmacy First"
        />
        <RoleCard
          role="surgery"
          selected={selected === 'surgery'}
          onClick={() => selectRole('surgery')}
          color="#005EB8"
          lightColor="#E8F1FC"
          icon={
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          title="Siam Surgery"
          subtitle="GP referrals · Appointment management"
        />
      </div>

      {/* Code entry */}
      {selected && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 420 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Enter access code for {selected === 'pharmacy' ? 'Supremus Pharmacy' : 'Siam Surgery'}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                autoFocus
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value); setError('') }}
                placeholder="ACCESS CODE"
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  border: error ? '2px solid #EF4444' : '2px solid #334155',
                  borderRadius: 10,
                  background: '#1E293B',
                  color: '#F8FAFC',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!code || loading}
                style={{
                  padding: '14px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: !code || loading ? 'not-allowed' : 'pointer',
                  background: selected === 'pharmacy' ? '#0F766E' : '#005EB8',
                  color: '#FFF',
                  opacity: !code || loading ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? '...' : 'Enter'}
              </button>
            </div>
            {error && (
              <div style={{ fontSize: 13, color: '#F87171', fontWeight: 500 }}>{error}</div>
            )}
          </form>
        </div>
      )}

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 20, fontSize: 11, color: '#334155', textAlign: 'center' }}>
        Supremus Therapeutics · Siam Surgery · Sudbury Community Health Centre · CO10 2DZ
      </div>
    </div>
  )
}

function RoleCard({
  role, selected, onClick, color, lightColor, icon, title, subtitle,
}: {
  role: string
  selected: boolean
  onClick: () => void
  color: string
  lightColor: string
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '40px 32px',
        borderRadius: 16,
        border: selected ? `2px solid ${color}` : '2px solid #1E293B',
        background: selected ? '#1E293B' : '#162032',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        outline: 'none',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 14,
          background: selected ? color : '#1E293B',
          color: selected ? '#FFF' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          transition: 'all 0.15s',
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: selected ? '#F8FAFC' : '#94A3B8', marginBottom: 8, transition: 'color 0.15s' }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: selected ? '#94A3B8' : '#475569', transition: 'color 0.15s' }}>
        {subtitle}
      </div>
      {selected && (
        <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
          Selected
        </div>
      )}
    </button>
  )
}
