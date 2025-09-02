import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Proxy to the backend impact endpoint
    const response = await fetch('http://localhost:3001/api/v1/signatures/petition/cmeky1irj0000f5yhzgv7ocqu/stats')
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }
    
    const stats = await response.json()
    
    // Transform to the expected impact format
    const impactData = {
      education: stats.signatureCount,
      globalTotal: stats.signatureCount,
    }
    
    return NextResponse.json(impactData)
  } catch (error) {
    console.error('Error fetching impact data:', error)
    
    // Return fallback data
    return NextResponse.json({
      education: 0,
      globalTotal: 0,
    })
  }
}
