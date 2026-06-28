'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Stats {
  total: number
  resolved: number
  referred: number
  saved: number
}

interface Consultation {
  id: string
  symptom_detail: string
  outcome: 'resolved' | 'referred'
  pharmacy_notes: string
  created_at: string
  patients: { first_name: string; surname: string; dob: string }
}

export default function PharmacyDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ total: 0, resolved: 0, referred: 0, saved: 0 })
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  const load = useCallback(async () => {
    const [s, c] = await Promise.all([
      fetch('/api/stats?role=pharmacy').then(r => r.json()),
      fetch('/api/consultations?limit=20').then(r => r.json()),
    ])
    setStats(s)
    setConsultations(Array.isArray(c) ? c : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t) }, [])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F0F4F5' }}>
      {/* Top bar */}
      <div style={{ background: '#0F766E', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF', lineHeight: 1.2 }}>Supremus Pharmacy</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>Pharmacy First · Clinical Triage</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>{format(now, 'EEEE d MMMM yyyy')}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{format(now, 'HH:mm')}</div>
          </div>
          <button
            onClick={() => router.push('/pharmacy/intake')}
            style={{ padding: '10px 20px', background: '#FFF', color: '#0F766E', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Patient
          </button>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.15)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '16px 24px 0', flexShrink: 0 }}>
        <StatCard label="Patients seen today" value={loading ? '—' : stats.total} color="#212B32" icon="👥" />
        <StatCard label="Resolved at pharmacy" value={loading ? '—' : stats.resolved} color="#15803D" icon="✅" accent="#DCFCE7" />
        <StatCard label="Referred to GP" value={loading ? '—' : stats.referred} color="#B45309" icon="📤" accent="#FEF3C7" />
        <StatCard label="GP appointments saved" value={loading ? '—' : stats.saved} color="#0F766E" icon="💚" accent="#CCFBF1" />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, padding: '12px 24px 16px', minHeight: 0 }}>
        {/* Recent consultations */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #E5EAF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#212B32' }}>Today's Consultations</div>
            <button onClick={load} style={{ fontSize: 11, color: '#768692', background: 'none', border: 'none', cursor: 'pointer' }}>↻ Refresh</button>
          </div>
          <div className="scrollable" style={{ flex: 1 }}>
            {loading ? (
              <div style={{ padding: 20, color: '#768692', fontSize: 13, textAlign: 'center' }}>Loading…</div>
            ) : consultations.length === 0 ? (
              <div style={{ padding: 20, color: '#768692', fontSize: 13, textAlign: 'center' }}>
                No consultations today.<br />
                <button onClick={() => router.push('/pharmacy/intake')} style={{ marginTop: 8, color: '#0F766E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>+ Register first patient</button>
              </div>
            ) : (
              consultations.map(c => (
                <div key={c.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F0F4F5', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: c.outcome === 'resolved' ? '#DCFCE7' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {c.outcome === 'resolved' ? '✅' : '📤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#212B32' }}>
                      {c.patients?.first_name} {c.patients?.surname}
                    </div>
                    <div style={{ fontSize: 12, color: '#768692', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.symptom_detail}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge-${c.outcome}`}>
                      {c.outcome === 'resolved' ? 'Resolved' : 'Referred'}
                    </span>
                    <div style={{ fontSize: 11, color: '#768692', marginTop: 4 }}>
                      {format(new Date(c.created_at), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: quick actions + pathway guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#768692', marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ActionBtn icon="🧑‍⚕️" label="New Patient Consultation" color="#0F766E" onClick={() => router.push('/pharmacy/intake')} />
            </div>
          </div>

          <div className="card scrollable" style={{ flex: 1, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#768692', marginBottom: 12 }}>Pharmacy First Pathways</div>
            {[
              ['🤒', 'Acute sore throat'],
              ['🤧', 'Acute sinusitis'],
              ['👂', 'Ear infection (AOM)'],
              ['🚽', 'UTI'],
              ['🩹', 'Shingles'],
              ['🦠', 'Impetigo'],
              ['🐛', 'Infected insect bites'],
            ].map(([e, l]) => (
              <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #F0F4F5' }}>
                <span style={{ fontSize: 16 }}>{e}</span>
                <span style={{ fontSize: 12, color: '#425563' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon, accent }: { label: string; value: number | string; color: string; icon: string; accent?: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#768692', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent || '#F0F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function ActionBtn({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', padding: '12px 14px', background: color, color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  )
}
