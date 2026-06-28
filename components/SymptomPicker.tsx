'use client'

import { useState, useRef, useEffect } from 'react'
import { SYMPTOMS, searchSymptoms, type Symptom } from '@/lib/symptoms'

interface Props {
  value: Symptom | null
  onChange: (s: Symptom) => void
}

export default function SymptomPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = searchSymptoms(query)

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  function select(s: Symptom) {
    onChange(s)
    setQuery(s.label)
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && results[highlighted]) { e.preventDefault(); select(results[highlighted]) }
    if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Type symptom or condition…"
          style={{
            width: '100%',
            padding: '14px 44px 14px 16px',
            fontSize: 15,
            border: '1.5px solid #D1D9E0',
            borderRadius: 8,
            outline: 'none',
            background: '#FFF',
            color: '#212B32',
          }}
        />
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>
          🔍
        </span>
      </div>

      {/* Selected display */}
      {value && !open && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 8 }}>
          <span style={{ fontSize: 22 }}>{value.emoji}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#15803D' }}>{value.label}</div>
            <div style={{ fontSize: 11, color: '#4ADE80', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{value.category}</div>
          </div>
          <button
            onClick={() => { onChange(null as unknown as Symptom); setQuery(''); setOpen(false) }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#86EFAC', fontSize: 18, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#FFF',
            border: '1.5px solid #D1D9E0',
            borderRadius: 10,
            marginTop: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: '16px', fontSize: 13, color: '#768692', textAlign: 'center' }}>
              No matching symptoms
            </div>
          ) : (
            <>
              {/* Group: Pharmacy First */}
              {results.filter(r => r.category === 'Pharmacy First').length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#F0FDF4' }}>
                    NHS Pharmacy First Pathways
                  </div>
                  {results.filter(r => r.category === 'Pharmacy First').map((s, i) => (
                    <SymptomRow
                      key={s.code}
                      symptom={s}
                      highlighted={highlighted === results.indexOf(s)}
                      onHover={() => setHighlighted(results.indexOf(s))}
                      onClick={() => select(s)}
                    />
                  ))}
                </div>
              )}
              {/* Group: Minor Ailments */}
              {results.filter(r => r.category === 'Minor Ailments').length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#768692', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#F8FAFC' }}>
                    Minor Ailments
                  </div>
                  {results.filter(r => r.category === 'Minor Ailments').map((s) => (
                    <SymptomRow
                      key={s.code}
                      symptom={s}
                      highlighted={highlighted === results.indexOf(s)}
                      onHover={() => setHighlighted(results.indexOf(s))}
                      onClick={() => select(s)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

function SymptomRow({ symptom, highlighted, onHover, onClick }: {
  symptom: Symptom
  highlighted: boolean
  onHover: () => void
  onClick: () => void
}) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        background: highlighted ? '#F0F4F5' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
    >
      <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{symptom.emoji}</span>
      <span style={{ fontSize: 14, color: '#212B32', fontWeight: 500 }}>{symptom.label}</span>
    </button>
  )
}
