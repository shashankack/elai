import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const { data: applications, count: totalCount } = await supabase
      .from('KYCApplication')
      .select('*, user:users ( firstName, lastName, email )', { count: 'exact' })
      .eq('status', status as any)
      .order('submittedAt', { ascending: false })
      .range(skip, skip + limit - 1)

    return NextResponse.json({
      applications: applications || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching pending applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}