import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Petition debug route is working',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'POST request received',
      body: body,
      timestamp: new Date().toISOString(),
      status: 'success'
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      status: 'error'
    }, { status: 500 })
  }
}
