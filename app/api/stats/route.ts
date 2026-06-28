import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') || 'pharmacy'
  const db = serviceClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const iso = todayStart.toISOString()

  if (role === 'pharmacy') {
    const [{ count: total }, { count: resolved }, { count: referred }] = await Promise.all([
      db.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', iso),
      db.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', iso).eq('outcome', 'resolved'),
      db.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', iso).eq('outcome', 'referred'),
    ])
    return NextResponse.json({
      total: total ?? 0,
      resolved: resolved ?? 0,
      referred: referred ?? 0,
      saved: referred ?? 0,
    })
  }

  // Surgery stats
  const [{ count: totalRef }, { count: pending }, { count: booked }, { count: seen }] = await Promise.all([
    db.from('referrals').select('*', { count: 'exact', head: true }),
    db.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'booked'),
    db.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'seen'),
  ])

  const [{ count: totalToday }, { count: resolvedToday }] = await Promise.all([
    db.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', iso),
    db.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', iso).eq('outcome', 'resolved'),
  ])

  return NextResponse.json({
    totalReferrals: totalRef ?? 0,
    pending: pending ?? 0,
    booked: booked ?? 0,
    seen: seen ?? 0,
    totalToday: totalToday ?? 0,
    resolvedAtPharmacy: resolvedToday ?? 0,
  })
}
