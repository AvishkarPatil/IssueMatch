import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mentorId, message } = body;
    
    if (!mentorId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentor/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mentorId, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail || 'Failed to send request' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error requesting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to send mentorship request' },
      { status: 500 }
    );
  }
}