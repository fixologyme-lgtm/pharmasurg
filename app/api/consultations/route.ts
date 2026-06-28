import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'
import { createCalendarEvent } from '@/lib/calendar'

export async function POST(req: Request) {
  const body = await req.json()
  const { patient_id, symptom_category, symptom_detail, outcome, pharmacy_notes, patient_name } = body

  if (!patient_id || !symptom_category || !symptom_detail || !outcome) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = serviceClient()

  const { data: consultation, error: cErr } = await db
    .from('consultations')
    .insert({ patient_id, symptom_category, symptom_detail, outcome, pharmacy_notes })
    .select()
    .single()

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })

  if (outcome === 'referred') {
    // Create referral record
    const { data: referral, error: rErr } = await db
      .from('referrals')
      .insert({ consultation_id: consultation.id, patient_id, status: 'pending' })
      .select()
      .single()

    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

    // ── GOOGLE CALENDAR INTEGRATION POINT ──────────────────────
    const calResult = await createCalendarEvent({
      patientName: patient_name || 'Unknown',
      symptom: symptom_detail,
      notes: pharmacy_notes,
    })
    // Update referral with calendar event ID if we got one
    if (calResult.eventId) {
      await db
        .from('referrals')
        .update({ calendar_event_id: calResult.eventId })
        .eq('id', referral.id)
    }
    // ───────────────────────────────────────────────────────────

    return NextResponse.json({ consultation, referral })
  }

  return NextResponse.json({ consultation })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const db = serviceClient()

  const { data, error } = await db
    .from('consultations')
    .select(`*, patients(first_name, surname, dob)`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
