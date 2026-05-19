import { NextResponse } from 'next/server';
import { API_TOKEN_FLASH_COOKIE } from '@/lib/api-tokens';
import { getPermissionedUser } from '@/lib/admin-access';

export async function DELETE() {
  const user = await getPermissionedUser('api-token.read');
  if (!user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(API_TOKEN_FLASH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  return response;
}
