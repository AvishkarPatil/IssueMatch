import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { mentorId, message, issueLink, preferredTime } = body;
    
    if (!mentorId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // For demo purposes, just return a success response
    return NextResponse.json({
      id: 'demo-request-' + Date.now(),
      status: 'pending',
      message: 'Mentorship request sent successfully'
    });
  } catch (error) {
    console.error('Error requesting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to send mentorship request' },
      { status: 500 }
    );
  }
}