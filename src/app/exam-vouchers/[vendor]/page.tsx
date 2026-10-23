import { redirect } from 'next/navigation';

// Vendor-level voucher URLs (breadcrumbs, hand-typed links) open the voucher
// catalog filtered to that vendor.
export default async function VendorVouchersPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  redirect(`/exam-vouchers?vendor=${encodeURIComponent(vendor)}`);
}
