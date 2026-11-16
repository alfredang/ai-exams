import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

/**
 * Direct database access for /api/v1/db/* (scopes `db:read` / `db:write`).
 *
 * The guard is Postgres itself, not string matching: every call runs in its
 * own transaction under `SET LOCAL ROLE` to a NOLOGIN role that only holds the
 * column privileges below, with a statement timeout. Queries also run
 * `READ ONLY`. The text checks (one statement, no comments, no admin
 * functions, UPDATE/DELETE need WHERE) are a second layer.
 *
 * Never readable: password hashes, TOTP secrets, OAuth tokens, API-token
 * hashes, webhook secrets, OTP hashes, guest cookies, the Setting table.
 * Never writable: those columns, `User.role` (promote admins in the admin
 * dashboard), and the Setting / ApiToken / AdminLog / migrations tables.
 */
export const READER_ROLE = 'app_db_reader';
export const WRITER_ROLE = 'app_db_writer';

const HIDDEN_COLUMNS: Record<string, string[]> = {
  User: ['passwordHash', 'totpSecret'],
  Account: ['refresh_token', 'access_token', 'id_token'],
  ApiToken: ['hashedToken'],
  WebhookSubscription: ['secret'],
  OtpCode: ['codeHash'],
  Attempt: ['guestToken']
};
const HIDDEN_TABLES = ['Setting'];
const READ_ONLY_TABLES = ['Setting', 'ApiToken', 'AdminLog', '_prisma_migrations'];
const READ_ONLY_COLUMNS: Record<string, string[]> = { User: ['role'] };

export const MAX_ROWS = 1000;
const MAX_SQL = 20_000;
const MAX_PARAMS = 50;

const ident = (s: string) => `"${s.replace(/"/g, '""')}"`;

type Column = { table: string; column: string; type: string; nullable: boolean };

async function publicColumns(): Promise<Column[]> {
  const rows = await db.$queryRaw<{ table_name: string; column_name: string; data_type: string; udt_name: string; is_nullable: string }[]>`
    SELECT c.table_name, c.column_name, c.data_type, c.udt_name, c.is_nullable
    FROM information_schema.columns c
    JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    ORDER BY c.table_name, c.ordinal_position`;
  return rows.map((r) => ({
    table: r.table_name,
    column: r.column_name,
    type: r.data_type === 'USER-DEFINED' || r.data_type === 'ARRAY' ? r.udt_name : r.data_type,
    nullable: r.is_nullable === 'YES'
  }));
}

const readable = (c: Column) => !HIDDEN_TABLES.includes(c.table) && !(HIDDEN_COLUMNS[c.table] || []).includes(c.column);
const writable = (c: Column) =>
  readable(c) && !READ_ONLY_TABLES.includes(c.table) && !(READ_ONLY_COLUMNS[c.table] || []).includes(c.column);

/** (Re)create both roles and their column grants. Runs once per process, so each deploy picks up new tables. */
async function syncRoles() {
  const cols = await publicColumns();
  const byTable = new Map<string, Column[]>();
  for (const c of cols) byTable.set(c.table, [...(byTable.get(c.table) || []), c]);

  const stmts: string[] = [];
  for (const role of [READER_ROLE, WRITER_ROLE]) {
    stmts.push(`DO $$ BEGIN CREATE ROLE ${role} NOLOGIN NOINHERIT; EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
    stmts.push(`GRANT USAGE ON SCHEMA public TO ${role}`);
  }
  for (const [table, tcols] of byTable) {
    const t = ident(table);
    stmts.push(`REVOKE ALL ON TABLE ${t} FROM ${READER_ROLE}, ${WRITER_ROLE}`);
    const read = tcols.filter(readable).map((c) => ident(c.column));
    if (read.length) {
      stmts.push(`GRANT SELECT (${read.join(', ')}) ON TABLE ${t} TO ${READER_ROLE}, ${WRITER_ROLE}`);
    }
    const write = tcols.filter(writable).map((c) => ident(c.column));
    if (write.length) {
      stmts.push(`GRANT INSERT (${write.join(', ')}), UPDATE (${write.join(', ')}) ON TABLE ${t} TO ${WRITER_ROLE}`);
      stmts.push(`GRANT DELETE ON TABLE ${t} TO ${WRITER_ROLE}`);
    }
  }
  await db.$transaction(async (tx) => {
    for (const s of stmts) await tx.$executeRawUnsafe(s);
  }, { timeout: 60_000 });
  // A non-superuser app login must be a member to SET ROLE (superusers can always).
  for (const role of [READER_ROLE, WRITER_ROLE]) {
    await db.$executeRawUnsafe(`GRANT ${role} TO CURRENT_USER`).catch(() => {});
  }
}

let ready: Promise<void> | null = null;
export function ensureDbApiRoles() {
  if (!ready) ready = syncRoles().catch((e) => { ready = null; throw e; });
  return ready;
}

/** Tables and the columns the API can read / write. */
export async function dbApiSchema(table?: string) {
  const cols = (await publicColumns()).filter(readable).filter((c) => !table || c.table === table);
  const tables: Record<string, { columns: { name: string; type: string; nullable: boolean; writable: boolean }[]; hidden: string[]; writable: boolean }> = {};
  for (const c of cols) {
    tables[c.table] ??= { columns: [], hidden: HIDDEN_COLUMNS[c.table] || [], writable: !READ_ONLY_TABLES.includes(c.table) };
    tables[c.table].columns.push({ name: c.column, type: c.type, nullable: c.nullable, writable: writable(c) });
  }
  return tables;
}

export class DbApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// Functions that reach outside a plain query (files, sleeping, other sessions,
// changing the role back, running SQL from a string). The role already lacks
// most of these; this is belt and braces.
const BANNED = /\b(set_config|pg_sleep\w*|pg_read_\w+|pg_ls_\w+|pg_stat_file|lo_\w+|dblink\w*|pg_terminate_backend|pg_cancel_backend|pg_reload_conf|pg_rotate_logfile|pg_advisory\w*|pg_try_advisory\w*|pg_logical_\w+|pg_replication_\w+|query_to_xml\w*|cursor_to_xml\w*|table_to_xml\w*|schema_to_xml\w*|database_to_xml\w*|current_setting|pg_notify|txid_\w+|pg_export_snapshot|copy)\b/i;

function cleanSql(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) throw new DbApiError('sql is required');
  if (raw.length > MAX_SQL) throw new DbApiError(`sql is longer than ${MAX_SQL} characters`);
  const sql = raw.trim().replace(/;+\s*$/, '');
  if (sql.includes(';')) throw new DbApiError('One statement per call; pass values (even ones containing ";") as $1, $2 params');
  if (/--|\/\*/.test(sql)) throw new DbApiError('Remove SQL comments');
  if (/\bU&["']/i.test(sql)) throw new DbApiError('Unicode-escaped identifiers are not allowed');
  const banned = sql.match(BANNED);
  if (banned) throw new DbApiError(`"${banned[0]}" is not allowed through this API`);
  return sql;
}

function cleanParams(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new DbApiError('params must be an array');
  if (raw.length > MAX_PARAMS) throw new DbApiError(`At most ${MAX_PARAMS} params`);
  for (const p of raw) {
    if (p !== null && !['string', 'number', 'boolean'].includes(typeof p)) {
      throw new DbApiError('params may only be strings, numbers, booleans or null (cast in SQL, e.g. $1::jsonb)');
    }
  }
  return raw;
}

/** JSON-safe rows: bigint → number (or string when too large), Decimal → string, bytes → base64. */
function plain(v: unknown): unknown {
  if (typeof v === 'bigint') return Number.isSafeInteger(Number(v)) ? Number(v) : v.toString();
  if (v instanceof Prisma.Decimal) return v.toString();
  if (v instanceof Uint8Array) return Buffer.from(v).toString('base64');
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

function pgMessage(e: unknown): string {
  const anyE = e as { meta?: { message?: string }; message?: string };
  const m = anyE?.meta?.message || anyE?.message || String(e);
  const msg = m.replace(/^[\s\S]*?(ERROR|error):\s*/, '').split('\n')[0].slice(0, 500);
  const denied = msg.match(/permission denied for table (\S+)/);
  return denied
    ? `${msg}. Some columns of ${denied[1]} are hidden or read-only: name the columns (no SELECT *, no whole-row) — see GET /api/v1/db/schema?table=${denied[1]}`
    : msg;
}

export async function runQuery(input: { sql: unknown; params?: unknown; limit?: unknown }) {
  const sql = cleanSql(input.sql);
  if (!/^(select|with)\b/i.test(sql)) throw new DbApiError('/db/query runs SELECT (or WITH … SELECT) only; use /db/execute to change data');
  const params = cleanParams(input.params);
  const limit = Math.min(Math.max(Math.floor(Number(input.limit) || 200), 1), MAX_ROWS);
  await ensureDbApiRoles();
  const started = Date.now();
  try {
    const rows = await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = '15s'`);
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${READER_ROLE}`);
      return tx.$queryRawUnsafe<Record<string, unknown>[]>(`SELECT * FROM (${sql}) AS _q LIMIT ${limit + 1}`, ...params);
    }, { timeout: 20_000, maxWait: 5_000 });
    const truncated = rows.length > limit;
    const out = (truncated ? rows.slice(0, limit) : rows).map(plain) as Record<string, unknown>[];
    return { rows: out, rowCount: out.length, truncated, ms: Date.now() - started };
  } catch (e) {
    if (e instanceof DbApiError) throw e;
    throw new DbApiError(pgMessage(e));
  }
}

export async function runExecute(input: { sql: unknown; params?: unknown; maxAffected?: unknown; dryRun?: unknown }) {
  const sql = cleanSql(input.sql);
  const verb = sql.match(/^(insert|update|delete)\b/i)?.[1]?.toLowerCase();
  if (!verb) throw new DbApiError('/db/execute runs one INSERT, UPDATE or DELETE');
  if ((verb === 'update' || verb === 'delete') && !/\bwhere\b/i.test(sql)) {
    throw new DbApiError(`${verb.toUpperCase()} needs a WHERE clause`);
  }
  if (/\b(drop|truncate|alter|create|grant|revoke|vacuum|cluster|reindex|refresh|listen|notify|lock)\b/i.test(sql.replace(/'(?:[^']|'')*'/g, "''"))) {
    throw new DbApiError('Schema changes and admin statements are not allowed; add a Prisma migration instead');
  }
  const params = cleanParams(input.params);
  const maxAffected = Math.min(Math.max(Math.floor(Number(input.maxAffected) || 100), 1), 10_000);
  const dryRun = input.dryRun === true;
  const returning = /\breturning\b/i.test(sql);
  await ensureDbApiRoles();
  const started = Date.now();

  class Rollback extends Error {
    constructor(public result: { affected: number; rows: Record<string, unknown>[] }) {
      super('rollback');
    }
  }
  let affected = 0;
  let rows: Record<string, unknown>[] = [];
  let rolledBack = false;
  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = '30s'`);
      await tx.$executeRawUnsafe(`SET LOCAL lock_timeout = '5s'`);
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${WRITER_ROLE}`);
      let res: { affected: number; rows: Record<string, unknown>[] };
      if (returning) {
        const r = await tx.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...params);
        res = { affected: r.length, rows: r };
      } else {
        res = { affected: await tx.$executeRawUnsafe(sql, ...params), rows: [] };
      }
      if (dryRun || res.affected > maxAffected) throw new Rollback(res);
      affected = res.affected;
      rows = res.rows;
    }, { timeout: 40_000, maxWait: 5_000 });
  } catch (e) {
    if (e instanceof Rollback) {
      affected = e.result.affected;
      rows = e.result.rows;
      rolledBack = true;
      if (!dryRun) {
        throw new DbApiError(`Would change ${affected} rows, more than maxAffected=${maxAffected}; rolled back. Narrow the WHERE or raise maxAffected.`, 409);
      }
    } else if (e instanceof DbApiError) {
      throw e;
    } else {
      throw new DbApiError(pgMessage(e));
    }
  }
  return {
    verb,
    affected,
    committed: !rolledBack,
    dryRun,
    rows: rows.slice(0, MAX_ROWS).map(plain) as Record<string, unknown>[],
    ms: Date.now() - started
  };
}
