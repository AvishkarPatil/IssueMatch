import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { referralStats } from '../../../lib/dummyData';

export async function POST() {
  try {
    // For demo purposes, just return the dummy referral code
    return NextResponse.json({ referralCode: referralStats.referralCode });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}

// Helper function to generate a unique referral code (not used in demo but kept for reference)
function generateReferralCode(userId: string): string {
  // Create a hash of the user ID and current timestamp
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}-${Date.now()}`)
    .digest('hex');
  
  // Take the first 8 characters and make it uppercase for a cleaner code
  return hash.substring(0, 8).toUpperCase();
}