import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'

export async function GET() {
  const db = serviceClient()
  const { data, error } = await db
    .from('referrals')
    .select(`
      *,
      patients(first_name, surname, dob, address),
      consultations(symptom_category, symptom_detail, pharmacy_notes, created_at)
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  const db = serviceClient()
  const { data, error } = await db
    .from('referrals')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
