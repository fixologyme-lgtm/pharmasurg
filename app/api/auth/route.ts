import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { role, code } = await req.json()
  const validCode =
    role === 'pharmacy'
      ? process.env.PHARMACY_CODE
      : role === 'surgery'
      ? process.env.SURGERY_CODE
      : null

  if (!validCode || code !== validCode) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
