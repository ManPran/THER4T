import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Petition API test route is working',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}
