import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { publicUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get('impersonate_admin_id')?.value;
  const userId = cookieStore.get('impersonate_user_id')?.value;
  cookieStore.delete('impersonate_admin_id');
  cookieStore.delete('impersonate_user_id');
  if (adminId && userId) {
    await db.adminLog.create({
      data: { adminId, action: 'user.impersonate.end', targetType: 'User', targetId: userId, metadata: {} }
    }).catch(() => {});
  }
  // Same-origin guard on `next` — anything off-site or scheme-relative
  // falls back to the safe default. Belt-and-braces with `publicUrl()`,
  // which would also rewrite an off-site host but won't catch path
  // traversal back to a phishing destination on our own domain.
  const rawNext = new URL(req.url).searchParams.get('next') || '/admin-dashboard/users';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/admin-dashboard/users';
  return NextResponse.redirect(publicUrl(req, next));
}

export async function GET(req: Request) {
  return POST(req);
}
