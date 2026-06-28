import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'

export async function POST() {
  const db = serviceClient()

  // Clear existing seed data
  await db.from('referrals').delete().not('id', 'is', null)
  await db.from('consultations').delete().not('id', 'is', null)
  await db.from('patients').delete().not('id', 'is', null)

  // Insert patients
  const { data: patients, error: pErr } = await db.from('patients').insert([
    { first_name: 'Sarah', surname: 'Johnson', dob: '1985-03-15', address: '12 High Street, Sudbury, CO10 2AA' },
    { first_name: 'James', surname: 'Patel', dob: '1978-07-22', address: '45 Church Field Road, Sudbury, CO10 2DZ' },
    { first_name: 'Emma', surname: 'Clarke', dob: '1992-11-08', address: '78 Newton Road, Sudbury, CO10 1PW' },
    { first_name: 'Robert', surname: 'Davies', dob: '1955-06-14', address: '3 Acton Lane, Sudbury, CO10 1QP' },
    { first_name: 'Lucy', surname: 'Thompson', dob: '2001-09-29', address: '22 Meadow Way, Sudbury, CO10 3HJ' },
    { first_name: 'David', surname: 'Okafor', dob: '1967-04-03', address: '9 Mill Lane, Sudbury, CO10 2EP' },
    { first_name: 'Priya', surname: 'Sharma', dob: '1990-12-17', address: '31 Friars Street, Sudbury, CO10 2AA' },
  ]).select()

  if (pErr || !patients) return NextResponse.json({ error: pErr?.message }, { status: 500 })

  const [sarah, james, emma, robert, lucy, david, priya] = patients

  const now = new Date()
  const ts = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString()

  // Insert consultations
  const { data: consultations, error: cErr } = await db.from('consultations').insert([
    { patient_id: sarah.id, symptom_category: 'Pharmacy First', symptom_detail: 'Acute sore throat', outcome: 'resolved', pharmacy_notes: 'Advised salt gargle and paracetamol. Given Difflam spray.', created_at: ts(4.5) },
    { patient_id: james.id, symptom_category: 'Pharmacy First', symptom_detail: 'Urinary tract infection (UTI)', outcome: 'referred', pharmacy_notes: 'Symptoms >3 days, haematuria present. Refer for antibiotic prescription.', created_at: ts(3.5) },
    { patient_id: emma.id, symptom_category: 'Pharmacy First', symptom_detail: 'Acute sinusitis', outcome: 'resolved', pharmacy_notes: 'Saline rinse and decongestant. Monitor for 5 days.', created_at: ts(3) },
    { patient_id: robert.id, symptom_category: 'Pharmacy First', symptom_detail: 'Ear infection (acute otitis media)', outcome: 'referred', pharmacy_notes: 'Tympanic perforation possible. Needs GP examination.', created_at: ts(2.5) },
    { patient_id: lucy.id, symptom_category: 'Minor Ailments', symptom_detail: 'Cold / flu', outcome: 'resolved', pharmacy_notes: 'Symptomatic relief. Rest and fluids advised.', created_at: ts(1.5) },
    { patient_id: david.id, symptom_category: 'Minor Ailments', symptom_detail: 'Headache / migraine', outcome: 'resolved', pharmacy_notes: 'Ibuprofen + paracetamol. Tension-type. No red flags.', created_at: ts(1) },
    { patient_id: priya.id, symptom_category: 'Pharmacy First', symptom_detail: 'Impetigo', outcome: 'referred', pharmacy_notes: 'Widespread lesions, possible systemic involvement. Refer urgently.', created_at: ts(0.5) },
  ]).select()

  if (cErr || !consultations) return NextResponse.json({ error: cErr?.message }, { status: 500 })

  const referredConsultations = consultations.filter(c => c.outcome === 'referred')

  // Insert referrals for referred consultations
  const referralRows = referredConsultations.map((c, i) => {
    const patientId = c.patient_id
    const statuses: ('pending' | 'booked' | 'seen')[] = ['seen', 'booked', 'pending']
    return {
      consultation_id: c.id,
      patient_id: patientId,
      status: statuses[i] || 'pending',
      created_at: c.created_at,
    }
  })

  const { error: rErr } = await db.from('referrals').insert(referralRows)
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, patients: patients.length, consultations: consultations.length, referrals: referralRows.length })
}
