import { NextResponse } from 'next/server'
import { getTiktokVideoInfo } from '@/lib/tiktok'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    const data = await getTiktokVideoInfo(url)

    let json_response = {
      status: 'success',
      data
    }

    return new NextResponse(JSON.stringify(json_response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    let error_response = {
      status: 'error',
      message: error.message
    }
    return new NextResponse(JSON.stringify(error_response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
