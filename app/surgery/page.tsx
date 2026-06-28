'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface SurgeryStats {
  totalReferrals: number
  pending: number
  booked: number
  seen: number
  totalToday: number
  resolvedAtPharmacy: number
}

interface Referral {
  id: string
  status: 'pending' | 'booked' | 'seen'
  created_at: string
  calendar_event_id: string | null
  patients: { first_name: string; surname: string; dob: string; address: string }
  consultations: { symptom_detail: string; symptom_category: string; pharmacy_notes: string; created_at: string }
}

export default function SurgeryDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<SurgeryStats>({ totalReferrals: 0, pending: 0, booked: 0, seen: 0, totalToday: 0, resolvedAtPharmacy: 0 })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  const load = useCallback(async () => {
    const [s, r] = await Promise.all([
      fetch('/api/stats?role=surgery').then(res => res.json()),
      fetch('/api/referrals').then(res => res.json()),
    ])
    setStats(s)
    setReferrals(Array.isArray(r) ? r : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t) }, [])

  async function updateStatus(id: string, status: 'pending' | 'booked' | 'seen') {
    setUpdating(id)
    await fetch('/api/referrals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
    setUpdating(null)
  }

  const pendingRefs = referrals.filter(r => r.status === 'pending')
  const bookedRefs = referrals.filter(r => r.status === 'booked')
  const seenRefs = referrals.filter(r => r.status === 'seen')
  const savedToday = stats.resolvedAtPharmacy

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F0F4F5' }}>
      {/* Top bar */}
      <div style={{ background: '#005EB8', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF', lineHeight: 1.2 }}>Siam Surgery</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>Sudbury Community Health Centre · GP Referrals</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>{format(now, 'EEEE d MMMM yyyy')}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{format(now, 'HH:mm')}</div>
          </div>
          <button onClick={load} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.15)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
          <button onClick={() => router.push('/')} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.15)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
            Exit
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, padding: '14px 24px 0', flexShrink: 0 }}>
        <StatCard label="Total referrals" value={loading ? '—' : stats.totalReferrals} icon="📋" />
        <StatCard label="Pending" value={loading ? '—' : stats.pending} icon="⏳" color="#B45309" accent="#FEF3C7" />
        <StatCard label="Booked" value={loading ? '—' : stats.booked} icon="📅" color="#1D4ED8" accent="#DBEAFE" />
        <StatCard label="Seen" value={loading ? '—' : stats.seen} icon="✅" color="#15803D" accent="#DCFCE7" />
        <StatCard label="Resolved at pharmacy today" value={loading ? '—' : savedToday} icon="💊" color="#0F766E" accent="#CCFBF1" />
      </div>

      {/* Impact banner */}
      {!loading && savedToday > 0 && (
        <div style={{ margin: '10px 24px 0', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>💚</span>
          <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600 }}>
            Supremus Pharmacy has resolved {savedToday} patient{savedToday !== 1 ? 's' : ''} today — {savedToday} GP appointment{savedToday !== 1 ? 's' : ''} freed for more complex cases.
          </span>
        </div>
      )}

      {/* Referral columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: '12px 24px 16px', minHeight: 0 }}>
        <ReferralColumn
          title="Pending" icon="⏳" color="#B45309" bg="#FEF3C7" border="#FDE68A"
          referrals={pendingRefs} updating={updating}
          onAction={(id) => updateStatus(id, 'booked')}
          actionLabel="Mark Booked"
        />
        <ReferralColumn
          title="Booked" icon="📅" color="#1D4ED8" bg="#DBEAFE" border="#BFDBFE"
          referrals={bookedRefs} updating={updating}
          onAction={(id) => updateStatus(id, 'seen')}
          actionLabel="Mark Seen"
        />
        <ReferralColumn
          title="Seen" icon="✅" color="#15803D" bg="#DCFCE7" border="#86EFAC"
          referrals={seenRefs} updating={updating}
          onAction={null}
          actionLabel=""
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color = '#212B32', accent }: { label: string; value: number | string; icon: string; color?: string; accent?: string }) {
  return (
    <div className="card" style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: '#768692', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3 }}>{label}</div>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: accent || '#F0F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function ReferralColumn({ title, icon, color, bg, border, referrals, updating, onAction, actionLabel }: {
  title: string; icon: string; color: string; bg: string; border: string;
  referrals: Referral[]; updating: string | null;
  onAction: ((id: string) => void) | null; actionLabel: string;
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5EAF0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#212B32' }}>{title}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, padding: '2px 8px', borderRadius: 4 }}>{referrals.length}</span>
      </div>
      <div className="scrollable" style={{ flex: 1 }}>
        {referrals.length === 0 ? (
          <div style={{ padding: '20px 16px', color: '#768692', fontSize: 13, textAlign: 'center' }}>No {title.toLowerCase()} referrals</div>
        ) : (
          referrals.map(r => (
            <div key={r.id} style={{ padding: '12px 14px', borderBottom: '1px solid #F0F4F5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#212B32' }}>
                  {r.patients?.first_name} {r.patients?.surname}
                </div>
                <div style={{ fontSize: 10, color: '#768692', flexShrink: 0, marginTop: 2 }}>
                  {format(new Date(r.created_at), 'HH:mm')}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#0F766E', fontWeight: 600, marginBottom: 3 }}>
                {r.consultations?.symptom_detail}
              </div>
              {r.consultations?.pharmacy_notes && (
                <div style={{ fontSize: 11, color: '#768692', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {r.consultations.pharmacy_notes}
                </div>
              )}
              {r.patients?.dob && (
                <div style={{ fontSize: 11, color: '#768692', marginBottom: onAction ? 8 : 0 }}>
                  DOB: {format(new Date(r.patients.dob), 'd MMM yyyy')}
                </div>
              )}
              {onAction && (
                <button
                  onClick={() => onAction(r.id)}
                  disabled={updating === r.id}
                  style={{ width: '100%', padding: '8px', background: color, color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: updating === r.id ? 'not-allowed' : 'pointer', opacity: updating === r.id ? 0.7 : 1 }}
                >
                  {updating === r.id ? 'Updating…' : actionLabel}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
