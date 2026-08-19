import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { RescueCapsule } from '@/types/capsule';

export async function POST(request: Request) {
  try {
    const payload = await request.json() as RescueCapsule;
    
    // In a real production scenario, CAPSULE_SIGNING_SECRET must be securely managed
    const secret = process.env.CAPSULE_SIGNING_SECRET || 'fallback-dev-secret-do-not-use-in-prod';
    
    // We only sign the payload data, excluding the integrityValue and pending status itself
    const { integrityValue, isPendingServerVerification, ...dataToSign } = payload;
    
    // Create a stable string representation (sorting keys is a good practice for signatures, 
    // but for simplicity in this prototype we can stringify deterministically if needed, 
    // or just rely on JSON.stringify since the client sends it in this format).
    const dataString = JSON.stringify(dataToSign);
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');
      
    return NextResponse.json({ signature }, { status: 200 });
  } catch (error) {
    console.error('Error signing capsule:', error);
    return NextResponse.json({ error: 'Failed to sign Rescue Capsule' }, { status: 500 });
  }
}
