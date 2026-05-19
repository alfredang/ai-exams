import crypto from 'node:crypto';
import { auth } from '@/lib/auth';
import { getSetting } from '@/lib/settings';

export type WorkerAuthResult = { ok: true; adminId?: string } | { ok: false };

type WorkerAuthOptions = {
  allowAdminSession?: boolean;
  bearer?: boolean;
  includeAdminId?: boolean;
  secretHeader?: string;
};

function timingSafeEqualString(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function readRequestSecret(req: Request, options: WorkerAuthOptions): string {
  if (options.bearer) {
    const header = req.headers.get('authorization') || '';
    return header.startsWith('Bearer ') ? header.slice(7) : '';
  }
  return req.headers.get(options.secretHeader ?? 'x-worker-secret') || '';
}

export async function authorizeWorkerRequest(
  req: Request,
  options: WorkerAuthOptions = {}
): Promise<WorkerAuthResult> {
  const actual = readRequestSecret(req, options);
  const expected = await getSetting('WORKER_SHARED_SECRET');

  if (actual && expected && timingSafeEqualString(actual, expected)) {
    return { ok: true };
  }

  if (options.allowAdminSession === false) {
    return { ok: false };
  }

  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { ok: false };
  }

  return options.includeAdminId ? { ok: true, adminId: session.user.id } : { ok: true };
}
