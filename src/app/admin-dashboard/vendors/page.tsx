import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('forbidden');
  return session!.user as any;
}

async function createVendor(formData: FormData) {
  'use server';
  await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const logo = String(formData.get('logo') || '').trim() || null;
  const description = String(formData.get('description') || '').trim() || null;
  if (!name || !slug) return;
  await db.vendor.create({ data: { name, slug, logo, description } });
  revalidatePath('/admin-dashboard/vendors');
  revalidatePath('/admin-dashboard/exams');
}

async function updateVendor(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const logo = String(formData.get('logo') || '').trim() || null;
  const description = String(formData.get('description') || '').trim() || null;
  if (!id || !name || !slug) return;
  await db.vendor.update({ where: { id }, data: { name, slug, logo, description } });
  revalidatePath('/admin-dashboard/vendors');
  revalidatePath('/admin-dashboard/exams');
}

async function deleteVendor(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  if (!id) return;
  const count = await db.exam.count({ where: { vendorId: id } });
  if (count > 0) return;
  await db.vendor.delete({ where: { id } });
  revalidatePath('/admin-dashboard/vendors');
  revalidatePath('/admin-dashboard/exams');
}

const COL_NAME = 'w-48';
const COL_SLUG = 'w-40';
const COL_LOGO = 'w-56';
const COL_DESC = 'w-96';
const COL_EXAMS = 'w-24';
const COL_ACTIONS = 'w-40';
const TIGHT_INPUT =
  'w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500';

export default async function AdminVendorsPage() {
  const vendors = await db.vendor.findMany({
    include: { _count: { select: { exams: true } } },
    orderBy: { name: 'asc' }
  });
  return (
    <div>
      <h1 className="admin-h1">Vendors</h1>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-max min-w-full text-sm">
          <thead className="admin-thead">
            <tr>
              <th className={`px-2 py-1 font-medium ${COL_NAME}`}>Name</th>
              <th className={`px-2 py-1 font-medium ${COL_SLUG}`}>Slug</th>
              <th className={`px-2 py-1 font-medium ${COL_LOGO}`}>Logo URL</th>
              <th className={`px-2 py-1 font-medium ${COL_DESC}`}>Description</th>
              <th className={`px-2 py-1 font-medium ${COL_EXAMS}`}>Exams</th>
              <th className={`px-2 py-1 font-medium ${COL_ACTIONS}`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr>
              <td colSpan={6} className="px-2 py-1">
                <form
                  action={createVendor}
                  id="create-vendor"
                  className="flex items-center gap-2"
                >
                  <input name="name" placeholder="Name" required className={`${TIGHT_INPUT} ${COL_NAME}`} />
                  <input name="slug" placeholder="slug" required className={`${TIGHT_INPUT} ${COL_SLUG}`} />
                  <input name="logo" placeholder="Logo URL (optional)" className={`${TIGHT_INPUT} ${COL_LOGO}`} />
                  <input
                    name="description"
                    placeholder="Description"
                    className={`${TIGHT_INPUT} ${COL_DESC}`}
                  />
                  <span className={COL_EXAMS} />
                  <button className="btn-primary">Add</button>
                </form>
              </td>
            </tr>
            {vendors.map((v) => {
              const canDelete = v._count.exams === 0;
              const formId = `vendor-${v.id}`;
              return (
                <tr key={v.id} className="align-middle">
                  <td className={`px-2 py-1 ${COL_NAME}`}>
                    <form id={formId} action={updateVendor} className="contents">
                      <input type="hidden" name="id" value={v.id} />
                      <input form={formId} name="name" defaultValue={v.name} required className={TIGHT_INPUT} />
                    </form>
                  </td>
                  <td className={`px-2 py-1 ${COL_SLUG}`}>
                    <input form={formId} name="slug" defaultValue={v.slug} required className={TIGHT_INPUT} />
                  </td>
                  <td className={`px-2 py-1 ${COL_LOGO}`}>
                    <input
                      form={formId}
                      name="logo"
                      defaultValue={v.logo ?? ''}
                      placeholder="Logo URL"
                      className={TIGHT_INPUT}
                    />
                  </td>
                  <td className={`px-2 py-1 ${COL_DESC}`}>
                    <input
                      form={formId}
                      name="description"
                      defaultValue={v.description ?? ''}
                      placeholder="Description"
                      className={TIGHT_INPUT}
                    />
                  </td>
                  <td className={`px-2 py-1 text-xs text-slate-500 ${COL_EXAMS}`}>
                    /{v.slug} · {v._count.exams}
                  </td>
                  <td className={`px-2 py-1 ${COL_ACTIONS}`}>
                    <div className="flex items-center gap-3">
                      <button form={formId} className="btn-outline text-xs">Save</button>
                      <form action={deleteVendor}>
                        <input type="hidden" name="id" value={v.id} />
                        <button
                          disabled={!canDelete}
                          title={canDelete ? 'Delete vendor' : 'Cannot delete: vendor still has exams'}
                          className="text-xs text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                  No vendors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
