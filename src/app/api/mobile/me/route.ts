import { NextResponse } from 'next/server';
import { requireMobileUser } from '@/lib/mobile-auth';

export async function GET(req: Request) {
  const auth = await requireMobileUser(req);
  if ('response' in auth) return auth.response;
  return NextResponse.json({ user: auth.user });
}
