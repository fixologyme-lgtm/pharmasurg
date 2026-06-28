import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const body = await req.json()
  const { first_name, surname, dob, address } = body

  if (!first_name || !surname || !dob || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = serviceClient()
  const { data, error } = await db
    .from('patients')
    .insert({ first_name, surname, dob, address })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET() {
  const db = serviceClient()
  const { data, error } = await db
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
