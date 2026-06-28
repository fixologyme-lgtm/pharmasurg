'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SymptomPicker from '@/components/SymptomPicker'
import type { Symptom } from '@/lib/symptoms'
import { format } from 'date-fns'

type Outcome = 'resolved' | 'referred' | null

export default function IntakePage() {
  const router = useRouter()

  // Patient fields
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')

  // Symptom
  const [symptom, setSymptom] = useState<Symptom | null>(null)

  // Outcome
  const [outcome, setOutcome] = useState<Outcome>(null)
  const [notes, setNotes] = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<{ outcome: Outcome; name: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!firstName || !surname || !dob || !address) { setError('Please complete all patient details.'); return }
    if (!symptom) { setError('Please select a symptom.'); return }
    if (!outcome) { setError('Please select an outcome.'); return }
    setError('')
    setSubmitting(true)

    try {
      // 1. Create or get patient
      const pRes = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, surname, dob, address }),
      })
      const patient = await pRes.json()
      if (!pRes.ok) throw new Error(patient.error)

      // 2. Create consultation (creates referral automatically if referred)
      const cRes = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          patient_name: `${firstName} ${surname}`,
          symptom_category: symptom.category,
          symptom_detail: symptom.label,
          outcome,
          pharmacy_notes: notes,
        }),
      })
      const result = await cRes.json()
      if (!cRes.ok) throw new Error(result.error)

      setDone({ outcome, name: `${firstName} ${surname}` })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────
  if (done) {
    const isReferred = done.outcome === 'referred'
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F4F5', padding: 40 }}>
        <div className="card" style={{ maxWidth: 480, width: '100%', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{isReferred ? '📤' : '✅'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#212B32', marginBottom: 8 }}>
            {isReferred ? 'Referral Created' : 'Consultation Saved'}
          </div>
          <div style={{ fontSize: 15, color: '#768692', marginBottom: 8 }}>{done.name}</div>
          {isReferred ? (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#92400E', marginBottom: 28 }}>
              Referral sent to Siam Surgery. The GP team has been notified and will book an appointment.
            </div>
          ) : (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#15803D', marginBottom: 28 }}>
              Patient resolved at pharmacy. Consultation recorded.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setDone(null); setFirstName(''); setSurname(''); setDob(''); setAddress(''); setSymptom(null); setOutcome(null); setNotes('') }}
              style={{ flex: 1, padding: '12px', background: '#0F766E', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              New Patient
            </button>
            <button
              onClick={() => router.push('/pharmacy')}
              style={{ flex: 1, padding: '12px', background: '#FFF', color: '#212B32', border: '1.5px solid #D1D9E0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main intake form ──────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F0F4F5' }}>
      {/* Top bar */}
      <div style={{ background: '#0F766E', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.push('/pharmacy')}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF' }}>New Patient Consultation</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Supremus Pharmacy · {format(new Date(), 'd MMM yyyy HH:mm')}</div>
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="scrollable" style={{ flex: 1, padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>

          {/* LEFT: Patient details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Section title="Patient Details" icon="👤">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="First Name" required>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Sarah"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Surname" required>
                  <input
                    type="text"
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                    placeholder="e.g. Johnson"
                    style={inputStyle}
                  />
                </Field>
              </div>
              <Field label="Date of Birth" required>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Address" required>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 12 High Street, Sudbury, CO10 2AA"
                  style={inputStyle}
                />
              </Field>
            </Section>
          </div>

          {/* RIGHT: Symptom + Outcome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Section title="Presenting Complaint" icon="🩺">
              <SymptomPicker value={symptom} onChange={setSymptom} />
            </Section>

            <Section title="Outcome" icon="📋">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <OutcomeBtn
                  selected={outcome === 'resolved'}
                  onClick={() => setOutcome('resolved')}
                  emoji="✅"
                  label="Resolve at Pharmacy"
                  sublabel="Self-care / OTC treatment"
                  color="#15803D"
                  bg="#DCFCE7"
                  border="#86EFAC"
                />
                <OutcomeBtn
                  selected={outcome === 'referred'}
                  onClick={() => setOutcome('referred')}
                  emoji="📤"
                  label="Refer to GP"
                  sublabel="Create surgery referral"
                  color="#B45309"
                  bg="#FEF3C7"
                  border="#FDE68A"
                />
              </div>
            </Section>

            <Section title="Pharmacist Notes" icon="📝">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Clinical notes, recommendations, or reason for referral…"
                style={{ ...inputStyle, height: 80, resize: 'none' }}
              />
            </Section>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px',
                background: outcome === 'referred' ? '#B45309' : '#0F766E',
                color: '#FFF',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.15s',
              }}
            >
              {submitting ? 'Saving…' : outcome === 'referred' ? '📤  Submit Referral to Siam Surgery' : '✅  Save — Resolved at Pharmacy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  border: '1.5px solid #D1D9E0',
  borderRadius: 8,
  outline: 'none',
  background: '#FFF',
  color: '#212B32',
  fontFamily: 'inherit',
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#768692', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#425563', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function OutcomeBtn({ selected, onClick, emoji, label, sublabel, color, bg, border }: {
  selected: boolean; onClick: () => void; emoji: string; label: string; sublabel: string; color: string; bg: string; border: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 12px',
        borderRadius: 10,
        border: selected ? `2px solid ${color}` : '2px solid #D1D9E0',
        background: selected ? bg : '#FFF',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.15s',
        outline: 'none',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: selected ? color : '#212B32', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#768692' }}>{sublabel}</div>
    </button>
  )
}
