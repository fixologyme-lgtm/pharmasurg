import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'

export async function POST() {
  const db = serviceClient()

  await db.from('referrals').delete().not('id', 'is', null)
  await db.from('consultations').delete().not('id', 'is', null)
  await db.from('patients').delete().not('id', 'is', null)

  const { data: patients, error: pErr } = await db.from('patients').insert([
    { first_name: 'Sarah',    surname: 'Johnson',   dob: '1985-03-15', address: '12 High Street, Sudbury, CO10 2AA' },
    { first_name: 'James',    surname: 'Patel',     dob: '1978-07-22', address: '45 Church Field Road, Sudbury, CO10 2DZ' },
    { first_name: 'Emma',     surname: 'Clarke',    dob: '1992-11-08', address: '78 Newton Road, Sudbury, CO10 1PW' },
    { first_name: 'Robert',   surname: 'Davies',    dob: '1955-06-14', address: '3 Acton Lane, Sudbury, CO10 1QP' },
    { first_name: 'Lucy',     surname: 'Thompson',  dob: '2001-09-29', address: '22 Meadow Way, Sudbury, CO10 3HJ' },
    { first_name: 'David',    surname: 'Okafor',    dob: '1967-04-03', address: '9 Mill Lane, Sudbury, CO10 2EP' },
    { first_name: 'Priya',    surname: 'Sharma',    dob: '1990-12-17', address: '31 Friars Street, Sudbury, CO10 2AA' },
    { first_name: 'Thomas',   surname: 'Wright',    dob: '1948-08-30', address: '14 Kings Road, Sudbury, CO10 1RG' },
    { first_name: 'Amelia',   surname: 'Foster',    dob: '2003-02-14', address: '6 Cornard Road, Sudbury, CO10 2XB' },
    { first_name: 'Mohammed', surname: 'Hassan',    dob: '1981-05-19', address: '52 Melford Road, Sudbury, CO10 1JU' },
    { first_name: 'Karen',    surname: 'Mitchell',  dob: '1973-10-25', address: '27 Station Road, Long Melford, CO10 9HB' },
    { first_name: 'Oliver',   surname: 'Bennett',   dob: '1996-07-07', address: '88 Waldingfield Road, Sudbury, CO10 0NS' },
    { first_name: 'Diane',    surname: 'Pearson',   dob: '1960-01-31', address: '5 Girling Street, Sudbury, CO10 2AQ' },
    { first_name: 'Ravi',     surname: 'Nair',      dob: '1988-09-12', address: '19 Walnuttree Hospital Road, Sudbury, CO10 1QB' },
    { first_name: 'Fiona',    surname: 'McDonald',  dob: '1977-03-04', address: '33 Newton Road, Sudbury, CO10 1PW' },
  ]).select()

  if (pErr || !patients) return NextResponse.json({ error: pErr?.message }, { status: 500 })

  const [sarah, james, emma, robert, lucy, david, priya, thomas, amelia, mohammed, karen, oliver, diane, ravi, fiona] = patients

  const today = new Date()
  const ts = (h: number, m = 0) => {
    const d = new Date(today)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  const { data: consultations, error: cErr } = await db.from('consultations').insert([
    // 08:10 — resolved
    { patient_id: karen.id,    symptom_category: 'Minor Ailments',  symptom_detail: 'Hay fever / allergies',            outcome: 'resolved', pharmacy_notes: 'Cetirizine 10mg supplied. Advised to avoid triggers. Review in 2 weeks if no improvement.', created_at: ts(8,10) },
    // 08:35 — resolved
    { patient_id: thomas.id,   symptom_category: 'Minor Ailments',  symptom_detail: 'Indigestion / heartburn',           outcome: 'resolved', pharmacy_notes: 'Omeprazole 20mg supplied OTC. Dietary advice given. No red flag symptoms present.', created_at: ts(8,35) },
    // 09:05 — referred
    { patient_id: james.id,    symptom_category: 'Pharmacy First',   symptom_detail: 'Urinary tract infection (UTI)',     outcome: 'referred', pharmacy_notes: 'Symptoms >72 hours. Haematuria present. DIPSTICK: nitrites+, leucocytes++. Refer for antibiotic prescription — meets Pharmacy First referral criteria.', created_at: ts(9, 5) },
    // 09:20 — resolved
    { patient_id: sarah.id,    symptom_category: 'Pharmacy First',   symptom_detail: 'Acute sore throat',                outcome: 'resolved', pharmacy_notes: 'FeverPAIN score 2. Viral aetiology likely. Difflam spray + paracetamol. Safety-netted: return if worsening at 72h.', created_at: ts(9,20) },
    // 09:45 — resolved
    { patient_id: amelia.id,   symptom_category: 'Minor Ailments',  symptom_detail: 'Cold sore',                         outcome: 'resolved', pharmacy_notes: 'Early presentation (<24h). Aciclovir 5% cream supplied. Application technique demonstrated.', created_at: ts(9,45) },
    // 10:00 — referred
    { patient_id: robert.id,   symptom_category: 'Pharmacy First',   symptom_detail: 'Ear infection (acute otitis media)', outcome: 'referred', pharmacy_notes: 'Severe otalgia, temperature 38.4°C, otoscopy suggests bulging tympanic membrane. Meets Pharmacy First referral criteria for antibiotics. GP to assess.', created_at: ts(10, 0) },
    // 10:30 — resolved
    { patient_id: lucy.id,     symptom_category: 'Minor Ailments',  symptom_detail: 'Cold / flu',                         outcome: 'resolved', pharmacy_notes: 'Symptomatic management. No red flags. Paracetamol, decongestant, fluids & rest advised. Return if >7 days or deterioration.', created_at: ts(10,30) },
    // 10:50 — resolved
    { patient_id: oliver.id,   symptom_category: 'Minor Ailments',  symptom_detail: 'Muscle or joint pain',               outcome: 'resolved', pharmacy_notes: 'Acute lower back pain, no radiation, no neurological symptoms. Ibuprofen gel + heat pack. NICE guidance given.', created_at: ts(10,50) },
    // 11:15 — referred
    { patient_id: priya.id,    symptom_category: 'Pharmacy First',   symptom_detail: 'Impetigo',                          outcome: 'referred', pharmacy_notes: 'Widespread bullous impetigo covering >2 sites. Topical treatment insufficient — systemic antibiotics indicated. Refer urgently. Child-contact exclusion advice given.', created_at: ts(11,15) },
    // 11:40 — resolved
    { patient_id: david.id,    symptom_category: 'Minor Ailments',  symptom_detail: 'Headache / migraine',                outcome: 'resolved', pharmacy_notes: 'Tension-type. No red flags (no neck stiffness, photophobia, sudden onset). Sumatriptan discussed. Ibuprofen + paracetamol alternating regimen.', created_at: ts(11,40) },
    // 12:05 — resolved
    { patient_id: fiona.id,    symptom_category: 'Pharmacy First',   symptom_detail: 'Acute sinusitis',                   outcome: 'resolved', pharmacy_notes: 'Duration <10 days. Saline nasal rinse + decongestant. Analgesia. Advised: seek GP if not improving at 10 days.', created_at: ts(12, 5) },
    // 12:30 — referred
    { patient_id: mohammed.id, symptom_category: 'Pharmacy First',   symptom_detail: 'Shingles',                          outcome: 'referred', pharmacy_notes: 'Classic dermatomal rash (thoracic T5). Onset <72h — antiviral treatment eligible. Refer to GP for aciclovir/valaciclovir prescription. Ophthalmology referral not required — no V1 involvement.', created_at: ts(12,30) },
    // 13:10 — resolved
    { patient_id: diane.id,    symptom_category: 'Minor Ailments',  symptom_detail: 'Eye irritation / conjunctivitis',    outcome: 'resolved', pharmacy_notes: 'Allergic conjunctivitis. Sodium cromoglicate eye drops. Cool compress advice. No purulent discharge.', created_at: ts(13,10) },
    // 13:45 — referred
    { patient_id: ravi.id,     symptom_category: 'Pharmacy First',   symptom_detail: 'Infected insect bites',             outcome: 'referred', pharmacy_notes: 'Spreading cellulitis around multiple bite sites on lower leg. Lymphangitis visible. Oral antibiotics required — beyond Pharmacy First scope. Refer same day.', created_at: ts(13,45) },
    // 14:20 — resolved
    { patient_id: emma.id,     symptom_category: 'Minor Ailments',  symptom_detail: 'Mouth ulcers',                       outcome: 'resolved', pharmacy_notes: 'Recurrent aphthous ulcers. Bonjela + Corsodyl mouthwash. No systemic features. Reassured.', created_at: ts(14,20) },
  ]).select()

  if (cErr || !consultations) return NextResponse.json({ error: cErr?.message }, { status: 500 })

  const referred = consultations.filter(c => c.outcome === 'referred')
  // james=seen, robert=booked, priya=pending, mohammed=pending, ravi=pending
  const statusMap: Record<string, 'seen' | 'booked' | 'pending'> = {
    [james.id]:    'seen',
    [robert.id]:   'booked',
    [priya.id]:    'booked',
    [mohammed.id]: 'pending',
    [ravi.id]:     'pending',
  }

  const referralRows = referred.map(c => ({
    consultation_id: c.id,
    patient_id: c.patient_id,
    status: statusMap[c.patient_id] ?? 'pending',
    created_at: c.created_at,
  }))

  const { error: rErr } = await db.from('referrals').insert(referralRows)
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, patients: patients.length, consultations: consultations.length, referrals: referralRows.length })
}
